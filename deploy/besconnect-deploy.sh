#!/usr/bin/env bash
# Safe deploy of besconnect on the VPS. Install once as /usr/local/bin/besconnect-deploy (chmod 755).
#
# Runs as an SSH *forced command* (see authorized_keys), so the GitHub deploy key can do nothing else.
# $SSH_ORIGINAL_COMMAND may carry the commit SHA to deploy (otherwise the tip of main).
#
# Flow: fetch exact commit into a new release dir -> npm ci -> next build (low priority) ->
# switch the "current" symlink only if the build succeeded -> restart pm2 -> health check ->
# roll back automatically if the new version does not answer. The old release keeps serving
# until the switch, so a failed build never takes the site down.
set -euo pipefail
export PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
export HOME="${HOME:-/root}"

REPO_URL="https://github.com/macmpaxep/besconnect.git"
RELEASES="/var/www/besconnect-releases"
CURRENT="/var/www/besconnect-current"
PM2_NAME="besconnect"
PORT=3002
KEEP=3

exec 9>/var/lock/besconnect-deploy.lock
flock -n 9 || { echo "another deploy is already running"; exit 1; }

REF="${SSH_ORIGINAL_COMMAND:-main}"
if ! [[ "$REF" =~ ^[0-9a-f]{40}$ || "$REF" == "main" ]]; then
  echo "refusing unexpected ref: $REF"; exit 2
fi

mkdir -p "$RELEASES"
NEW="$RELEASES/$(date +%Y%m%d-%H%M%S)"
SWITCHED=0
trap 'rc=$?; if [ "$rc" -ne 0 ] && [ "$SWITCHED" -ne 1 ]; then rm -rf "$NEW"; fi' EXIT

switch_to() { ln -sfn "$1" "$CURRENT.tmp" && mv -Tf "$CURRENT.tmp" "$CURRENT"; }
start_or_restart() {
  # (re)create the pm2 process if it is not running from the "current" symlink yet (first run / migration)
  if pm2 jlist 2>/dev/null | grep -q "\"pm_cwd\":\"$CURRENT\""; then
    pm2 restart "$PM2_NAME" --update-env >/dev/null
  else
    pm2 delete "$PM2_NAME" >/dev/null 2>&1 || true
    (cd "$CURRENT" && pm2 start npm --name "$PM2_NAME" -- start -- -p "$PORT" >/dev/null)
  fi
}
healthy() {
  for _ in $(seq 1 25); do
    code="$(curl -s -o /dev/null -w '%{http_code}' --max-time 5 "http://127.0.0.1:$PORT/ru" || true)"
    [ "$code" = "200" ] && return 0
    sleep 2
  done
  return 1
}

echo "==> fetching $REF"
git init -q "$NEW"
git -C "$NEW" remote add origin "$REPO_URL"
git -C "$NEW" fetch -q --depth 1 origin "$REF"
git -C "$NEW" checkout -q FETCH_HEAD
SHA="$(git -C "$NEW" rev-parse --short HEAD)"

echo "==> building $SHA"
cd "$NEW"
npm ci --no-audit --no-fund
nice -n 19 npm run build

PREV="$(readlink -f "$CURRENT" 2>/dev/null || true)"
echo "==> switching to $SHA"
switch_to "$NEW"; SWITCHED=1
start_or_restart

if healthy; then
  pm2 save >/dev/null
  echo "==> deployed $SHA"
else
  echo "!! health check failed, rolling back"
  if [ -n "$PREV" ] && [ -d "$PREV" ]; then switch_to "$PREV"; start_or_restart; fi
  rm -rf "$NEW"
  exit 1
fi

# keep only the newest releases
ls -1dt "$RELEASES"/*/ 2>/dev/null | tail -n +$((KEEP + 1)) | xargs -r rm -rf
