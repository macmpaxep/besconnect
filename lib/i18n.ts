export const locales = ["ru", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "ru";
export const isLocale = (s: string): s is Locale => (locales as readonly string[]).includes(s);

type Plural = [string, string, string]; // ru: 1 / 2-4 / 5+ ; en uses [one, other, other]
export const plural = (n: number, forms: Plural, l: Locale) => {
  if (l === "en") return n === 1 ? forms[0] : forms[1];
  const m = n % 10, m100 = n % 100;
  return m === 1 && m100 !== 11 ? forms[0] : m >= 2 && m <= 4 && (m100 < 12 || m100 > 14) ? forms[1] : forms[2];
};

const ru = {
  htmlLang: "ru",
  siteTitle: "BESconnect — международные компании и предприниматели",
  siteDesc: "Каталог международных компаний, предпринимателей и деловые новости.",
  logoLabel: "BESconnect, на главную",
  nav: { companies: "Компании", people: "Предприниматели", news: "Новости", main: "Основная навигация", lang: "Язык" },
  footerData: "Источники данных:",
  footerNews: "Новости: BBC, CNBC, The New York Times, The Wall Street Journal, The Economist, Financial Times, Forbes, The Economic Times. Приводятся заголовок, краткий пересказ и ссылка на оригинал.",
  home: { latest: "Последние материалы", top: "Крупнейшие по числу сотрудников", people: "Предприниматели", feed: "Лента новостей", allCompanies: "Весь каталог компаний", allPeople: "Все предприниматели", allNews: "Все новости" },
  cat: {
    companiesTitle: "Каталог компаний", companiesSub: "Международные компании в алфавитном порядке. Фильтр по сфере деятельности и поиск.",
    peopleTitle: "Предприниматели", peopleSub: "Предприниматели и бизнесмены мира в алфавитном порядке. Фильтр по сфере деятельности и поиск.",
    sphere: "Сфера деятельности", allSpheres: "Все сферы", all: "Все", index: "Алфавитный указатель", catalog: "Каталог",
    searchCompanies: "Поиск по названию или стране", searchPeople: "Поиск по имени или описанию",
    empty: "Ничего не найдено. Сбросьте фильтры или измените запрос.",
    nounCompanies: ["компания", "компании", "компаний"] as Plural, nounPeople: ["персона", "персоны", "персон"] as Plural,
    colCountry: "Страна", colSphere: "Сфера", colFounded: "Основана", colEmployees: "Сотрудники", colDescription: "Описание", colLife: "Годы жизни",
  },
  detail: {
    companies: "Компании", people: "Предприниматели", about: "О компании", portfolio: "Портфолио", products: "Продукты и услуги", brands: "Бренды", subs: "Дочерние компании и проекты",
    noPortfolio: "В открытых базах нет структурированного списка продуктов этой компании.", founders: "Основатели", profile: "Профиль", founder: "Основатель",
    requisites: "Реквизиты", similar: "Другие компании сферы", country: "Страна", hq: "Штаб-квартира", founded: "Основана", employees: "Сотрудники", revenue: "Выручка", ceo: "Руководитель", parent: "Материнская компания", site: "Сайт",
    bio: "Биография", facts: "Краткие сведения", born: "Родился", died: "Умер", birthplace: "Место рождения", citizenship: "Гражданство", education: "Образование", sphere: "Сфера",
    activity: "Деятельность и достижения", occupations: "Род деятельности", awards: "Награды", works: "Известные работы", companiesOf: "Компании", sources: "Источники:", crumbNav: "Навигация",
    mlrd: "млрд", mln: "млн", projects: "Реализованные проекты", selfReported: "Показатели приведены по данным компании и не проверялись независимо.", sourceLabel: "Источник:",
  },
  news: {
    title: "Новости международного бизнеса", sub: "Заголовки ведущих деловых изданий с кратким пересказом и ссылками на оригиналы.", search: "Поиск по новостям", allSources: "Все источники", source: "Источник",
    items: ["материал", "материала", "материалов"] as Plural, more: "Показать ещё", read: "Читать в источнике", related: "Упомянутые компании", original: "Заголовок оригинала",
    note: "Краткий пересказ подготовлен автоматически по заголовку и анонсу издания и может быть неполным. Полный текст — в источнике.", back: "Все новости",
  },
};

const en: typeof ru = {
  htmlLang: "en",
  siteTitle: "BESconnect — international companies and entrepreneurs",
  siteDesc: "A directory of international companies, entrepreneurs and business news.",
  logoLabel: "BESconnect, home",
  nav: { companies: "Companies", people: "Entrepreneurs", news: "News", main: "Main navigation", lang: "Language" },
  footerData: "Data sources:",
  footerNews: "News: BBC, CNBC, The New York Times, The Wall Street Journal, The Economist, Financial Times, Forbes, The Economic Times. We show the headline, a short summary and a link to the original.",
  home: { latest: "Latest", top: "Largest by employees", people: "Entrepreneurs", feed: "News feed", allCompanies: "Full company directory", allPeople: "All entrepreneurs", allNews: "All news" },
  cat: {
    companiesTitle: "Company directory", companiesSub: "International companies in alphabetical order. Filter by industry and search.",
    peopleTitle: "Entrepreneurs", peopleSub: "Entrepreneurs and business leaders in alphabetical order. Filter by industry and search.",
    sphere: "Industry", allSpheres: "All industries", all: "All", index: "Alphabetical index", catalog: "Directory",
    searchCompanies: "Search by name or country", searchPeople: "Search by name or description",
    empty: "Nothing found. Reset the filters or change your query.",
    nounCompanies: ["company", "companies", "companies"] as Plural, nounPeople: ["person", "people", "people"] as Plural,
    colCountry: "Country", colSphere: "Industry", colFounded: "Founded", colEmployees: "Employees", colDescription: "Description", colLife: "Years",
  },
  detail: {
    companies: "Companies", people: "Entrepreneurs", about: "About", portfolio: "Portfolio", products: "Products and services", brands: "Brands", subs: "Subsidiaries and projects",
    noPortfolio: "Open databases hold no structured list of this company's products.", founders: "Founders", profile: "Profile", founder: "Founder",
    requisites: "Key facts", similar: "Other companies in this industry", country: "Country", hq: "Headquarters", founded: "Founded", employees: "Employees", revenue: "Revenue", ceo: "Leadership", parent: "Parent company", site: "Website",
    bio: "Biography", facts: "At a glance", born: "Born", died: "Died", birthplace: "Birthplace", citizenship: "Citizenship", education: "Education", sphere: "Industry",
    activity: "Career and achievements", occupations: "Occupations", awards: "Awards", works: "Notable works", companiesOf: "Companies", sources: "Sources:", crumbNav: "Breadcrumb",
    mlrd: "bn", mln: "m", projects: "Selected projects", selfReported: "Figures are provided by the company and have not been independently verified.", sourceLabel: "Source:",
  },
  news: {
    title: "International business news", sub: "Headlines from leading business publications with a short summary and links to the originals.", search: "Search news", allSources: "All sources", source: "Source",
    items: ["article", "articles", "articles"] as Plural, more: "Show more", read: "Read at the source", related: "Companies mentioned", original: "Original headline",
    note: "The short summary is generated automatically from the publication's headline and snippet and may be incomplete. The full text is at the source.", back: "All news",
  },
};

export const dict = { ru, en } as const;
export type Dict = typeof ru;
export const getDict = (l: Locale): Dict => dict[l];
