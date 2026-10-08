"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

/**
 * UI translations (English default + Albanian). The chosen language is a
 * per-device preference, so it lives here and not in the data store.
 * Stored data (client names, material names, units) is never translated —
 * units are only mapped for display via `unit()`.
 */

export type Lang = "sq" | "en";
export const LANGS: { id: Lang; short: string; name: string }[] = [
  { id: "sq", short: "AL", name: "Shqip" },
  { id: "en", short: "EN", name: "English" },
];

const plural = (n: number, one: string, many: string) => (n === 1 ? one : many);

const sq = {
  months: ["Janar", "Shkurt", "Mars", "Prill", "Maj", "Qershor", "Korrik", "Gusht", "Shtator", "Tetor", "Nëntor", "Dhjetor"],
  units: {} as Record<string, string>,

  common: {
    cancel: "Anulo",
    save: "Ruaj",
    saveChanges: "Ruaj ndryshimet",
    edit: "Ndrysho",
    delete: "Fshij",
    actions: "Veprime",
    more: "Më shumë",
    close: "Mbyll",
    logout: "Dil",
    email: "Email",
    emailPh: "emri@shembull.com",
    password: "Fjalëkalimi",
    showPassword: "Shfaq fjalëkalimin",
    hidePassword: "Fshih fjalëkalimin",
    invalidEmail: "Shkruaj një email të vlefshëm.",
    pwMin8: "Fjalëkalimi duhet të ketë të paktën 8 karaktere.",
    tryAnotherName: "Provo një emër tjetër.",
    searchMaterial: "Kërko material…",
    all: "Të gjitha",
    total: "Total",
    optional: "Opsionale",
    materialsCount: (n: number) => `${n} materiale`,
  },

  lang: { label: "Gjuha", text: "Zgjidh gjuhën e aplikacionit." },

  nav: { clients: "Klientët", materials: "Materialet", companies: "Kompanitë", profile: "Profili" },

  // Column names follow the original Excel sheet
  cols: { material: "Materiali", date: "Data", qty: "Sasia", price: "Vlera", amount: "Çmimi", unit: "Njësia" },

  clients: {
    title: "Klientët",
    subtitle: "Zgjidh një klient për të parë materialet",
    add: "Shto klient",
    fab: "Klient",
    statTotal: "Totali i të gjithë klientëve",
    statClients: "Klientë",
    statEntries: "Materiale të shtuara",
    search: "Kërko klient, telefon ose qytet…",
    notFound: "Asnjë klient nuk u gjet",
    empty: "Ende nuk ke klientë",
    emptyText: "Shto klientin e parë për të filluar.",
    colClient: "Klienti",
    colPhone: "Telefoni",
    colMaterials: "Materiale",
    colLast: "E fundit",
    colAdded: "Shtuar më",
    colTotal: "Totali",
    added: "Klienti u shtua",
    updated: "Klienti u përditësua",
    deleted: "Klienti u fshi",
    deleteTitle: "Fshij klientin?",
    deleteText: (name: string) => `"${name}" dhe të gjitha materialet e tij do të fshihen. Ky veprim nuk kthehet mbrapsht.`,
  },

  client: {
    notFound: "Klienti nuk u gjet",
    notFoundText: "Mund të jetë fshirë.",
    back: "Kthehu te klientët",
    noContact: "Pa të dhëna kontakti",
    print: "Printo",
    edit: "Ndrysho klientin",
    delete: "Fshij klientin",
    addMaterial: "Shto material",
    fab: "Material",
    statTotal: "Totali",
    statItems: "Artikuj",
    statMonth: "Këtë muaj",
    noResults: "Asnjë rezultat",
    noResultsText: "Ndrysho kërkimin ose muajin.",
    empty: "Ende pa materiale",
    emptyText: "Shto materialin e parë për këtë klient.",
    entryDeleted: "Materiali u fshi",
    deleteEntryTitle: "Fshij materialin?",
    deleteEntryText: (name: string, qty: string) => `"${name}" (${qty}) do të hiqet nga ky klient.`,
    deleteText: (name: string, n: number) => `"${name}" dhe ${n} materiale do të fshihen. Ky veprim nuk kthehet mbrapsht.`,
  },

  clientForm: {
    addTitle: "Shto klient",
    editTitle: "Ndrysho klientin",
    description: "Vetëm emri është i detyrueshëm",
    save: "Ruaj klientin",
    name: "Emri *",
    nameRequired: "Emri është i detyrueshëm.",
    namePh: "p.sh. Arben Krasniqi",
    phone: "Telefoni",
    address: "Adresa",
    addressPh: "p.sh. Prishtinë",
    note: "Shënim",
  },

  entryForm: {
    addTitle: "Shto material",
    editTitle: "Ndrysho materialin",
    description: "Zgjidh materialin, shkruaj vetëm sasinë",
    client: "Klienti",
    newMaterial: "Material i ri: do të ruhet edhe në katalog",
    price: "Vlera (Den)",
    formula: "Sasia × Vlera",
    pickMaterial: "Zgjidh një material.",
    enterQty: "Shkruaj sasinë.",
    enterPrice: "Shkruaj vlerën.",
    added: "Materiali u shtua",
    addedToCatalog: "Materiali u shtua (edhe në katalog)",
    updated: "Materiali u përditësua",
    pickPh: "Zgjidh nga katalogu…",
    searchPh: "Shkruaj për të kërkuar…",
    isNew: "i ri",
    catalogEmpty: "Katalogu është bosh",
    addToCatalog: (q: string) => `Shto “${q}” në katalog`,
  },

  materials: {
    title: "Materialet",
    subtitle: "Katalogu: shto materialin një herë me çmimin, pastaj vetëm zgjidhe te klienti",
    add: "Shto në katalog",
    fab: "Në katalog",
    notFound: "Asnjë material nuk u gjet",
    empty: "Katalogu është bosh",
    emptyText: "Shto materialet që përdor më shpesh me çmimet e tyre.",
    colUsed: "Përdorur",
    perUnit: (unit: string, n: number) => `për ${unit} · ${n}× përdorur`,
    priceNote:
      "Ndryshimi i çmimit vlen vetëm për materialet që shtohen pas ndryshimit. Materialet e vjetra te klientët e mbajnë çmimin e tyre.",
    added: "Materiali u shtua në katalog",
    updated: "Materiali u përditësua",
    deleted: "Materiali u fshi nga katalogu",
    deleteTitle: "Fshij nga katalogu?",
    deleteText: (name: string) =>
      `"${name}" nuk do të shfaqet më për zgjedhje. Materialet e shtuara më parë te klientët mbeten.`,
    editTitle: "Ndrysho materialin",
    formDescription: "Ky çmim plotësohet automatikisht te klientët",
    save: "Ruaj materialin",
    name: "Emri i materialit *",
    namePh: "p.sh. Çimento 25kg",
    nameRequired: "Shkruaj emrin e materialit.",
    price: "Vlera (Den) *",
    colChange: "Ndryshimi i fundit",
    priceHistory: "Historiku i çmimit",
    priceHistoryText: (n: number) =>
      n === 0 ? "Çmimi nuk ka ndryshuar ende" : `${n} ${plural(n, "ndryshim", "ndryshime")} të çmimit`,
    initialPrice: "Çmimi fillestar",
    current: "Aktual",
    lowest: "Më i ulëti",
    highest: "Më i larti",
    sinceStart: "Që nga fillimi",
    dateTime: "Data dhe ora",
    change: "Ndryshimi",
    priceRose: "Çmimi u rrit",
    priceFell: "Çmimi u ul",
    noChanges: "Pa ndryshime",
    priceChangeHint: "Ndryshimi i çmimit ruhet në historik me këtë datë.",
    priceDate: "Data e çmimit",
    dateBeforeLast: (d: string) => `Data duhet të jetë më e vonë ose e njëjtë me ndryshimin e fundit (${d}).`,
  },

  companies: {
    title: "Kompanitë",
    subtitle: "Furnitorët nga i blen materialet",
    label: "Kompania",
    add: "Shto kompani",
    fab: "Kompani",
    search: "Kërko kompani, telefon ose qytet…",
    notFound: "Asnjë kompani nuk u gjet",
    empty: "Ende nuk ke kompani",
    emptyText: "Shto furnitorët për t'i lidhur me materialet.",
    colCompany: "Kompania",
    colPhone: "Telefoni",
    colMaterials: "Materiale",
    colSold: "Shitur te klientët",
    viewMaterials: "Shiko materialet",
    none: "Pa kompani",
    all: "Të gjitha kompanitë",
    added: "Kompania u shtua",
    updated: "Kompania u përditësua",
    deleted: "Kompania u fshi",
    deleteTitle: "Fshij kompaninë?",
    deleteText: (name: string, n: number) =>
      `"${name}" do të fshihet. ${n} materiale në katalog mbeten, por pa kompani.`,
    addTitle: "Shto kompani",
    editTitle: "Ndrysho kompaninë",
    description: "Vetëm emri është i detyrueshëm",
    save: "Ruaj kompaninë",
    namePh: "p.sh. Fero-Beton Sh.p.k.",
  },

  history: {
    title: "Historiku i totalit",
    subtitle: "Totali i të gjithë klientëve sipas viteve",
    allTime: "Gjithsej",
    totalFor: (period: string) => `Totali · ${period}`,
    byMonth: (year: string) => `Sipas muajve · ${year}`,
    entriesIn: (n: number) => `${n} materiale`,
  },

  settings: {
    title: "Profili",
    subtitle: "Të dhënat e llogarisë, fjalëkalimi dhe gjuha",
    personal: "Të dhënat personale",
    name: "Emri",
    saved: "Profili u ruajt",
    changePw: "Ndrysho fjalëkalimin",
    currentPw: "Fjalëkalimi aktual",
    newPw: "Fjalëkalimi i ri",
    enterCurrentPw: "Shkruaj fjalëkalimin aktual.",
    newPwMin: "Fjalëkalimi i ri duhet të ketë të paktën 8 karaktere.",
    pwChanged: "Fjalëkalimi u ndryshua",
    resetTitle: "Rikthe të dhënat demo",
    resetText: "Kthen klientët dhe materialet shembull (vetëm për versionin pa databazë).",
    reset: "Rikthe",
    resetConfirmTitle: "Rikthe të dhënat demo?",
    resetConfirmText: "Ndryshimet e tua në klientë dhe materiale do të humbin.",
    resetDone: "Të dhënat demo u rikthyen",
    logoutTitle: "Dil nga llogaria",
    logoutText: "Do të duhet të kyçesh përsëri.",
  },

  auth: {
    headline: "Materialet e çdo klienti, në një vend.",
    tagline: "Zgjidh materialin, shkruaj sasinë, çmimi llogaritet vetë. Pa formula, pa Excel.",
    welcome: "Mirë se erdhe",
    welcomeText: "Kyçu për të vazhduar te klientët dhe materialet.",
    forgot: "Harrove fjalëkalimin?",
    remember: "Më mbaj të kyçur",
    login: "Kyçu",
    pwMin4: "Fjalëkalimi duhet të ketë të paktën 4 karaktere.",
    noAccount: "Nuk ke llogari?",
    register: "Regjistrohu",
    demo: "Demo: çdo email dhe fjalëkalim (4+ karaktere) funksionon.",
    registerTitle: "Krijo llogari",
    registerText: "Fillo të regjistrosh materialet për klientët e tu.",
    fullName: "Emri dhe mbiemri",
    fullNamePh: "p.sh. Veton Hasani",
    enterName: "Shkruaj emrin.",
    pwHint: "Të paktën 8 karaktere, një shkronjë e madhe dhe një numër.",
    createAccount: "Krijo llogarinë",
    haveAccount: "Ke llogari?",
    forgotText: "Shkruaj emailin dhe do të të dërgojmë një link për ta ndryshuar.",
    sendLink: "Dërgo linkun",
    checkEmail: "Kontrollo emailin",
    sentTo: "Të kemi dërguar një link për ta ndryshuar fjalëkalimin te",
    openLink: "Hap linkun (demo)",
    resend: "Nuk e more? Dërgo përsëri",
    backToLogin: "Kthehu te kyçja",
    resetTitle: "Vendos fjalëkalim të ri",
    resetText: "Zgjidh një fjalëkalim që nuk e ke përdorur më parë.",
    newPw: "Fjalëkalimi i ri",
    repeatPw: "Përsërite fjalëkalimin",
    pwMismatch: "Fjalëkalimet nuk përputhen.",
    savePw: "Ruaj fjalëkalimin",
    pwChanged: "Fjalëkalimi u ndryshua",
    pwChangedText: "Tani mund të kyçesh me fjalëkalimin e ri.",
  },
};

export type Dict = typeof sq;

const en: Dict = {
  months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
  units: { copë: "pcs", thes: "bag", litër: "L", pako: "pack", shufër: "bar", palë: "pair" },

  common: {
    cancel: "Cancel",
    save: "Save",
    saveChanges: "Save changes",
    edit: "Edit",
    delete: "Delete",
    actions: "Actions",
    more: "More",
    close: "Close",
    logout: "Log out",
    email: "Email",
    emailPh: "name@example.com",
    password: "Password",
    showPassword: "Show password",
    hidePassword: "Hide password",
    invalidEmail: "Enter a valid email.",
    pwMin8: "Password must be at least 8 characters.",
    tryAnotherName: "Try a different name.",
    searchMaterial: "Search materials…",
    all: "All",
    total: "Total",
    optional: "Optional",
    materialsCount: (n) => `${n} ${plural(n, "material", "materials")}`,
  },

  lang: { label: "Language", text: "Choose the app language." },

  nav: { clients: "Clients", materials: "Materials", companies: "Companies", profile: "Profile" },

  cols: { material: "Material", date: "Date", qty: "Quantity", price: "Unit price", amount: "Amount", unit: "Unit" },

  clients: {
    title: "Clients",
    subtitle: "Pick a client to see their materials",
    add: "Add client",
    fab: "Client",
    statTotal: "Total across all clients",
    statClients: "Clients",
    statEntries: "Materials added",
    search: "Search client, phone or city…",
    notFound: "No clients found",
    empty: "No clients yet",
    emptyText: "Add your first client to get started.",
    colClient: "Client",
    colPhone: "Phone",
    colMaterials: "Materials",
    colLast: "Latest",
    colAdded: "Added",
    colTotal: "Total",
    added: "Client added",
    updated: "Client updated",
    deleted: "Client deleted",
    deleteTitle: "Delete client?",
    deleteText: (name) => `"${name}" and all of their materials will be deleted. This can't be undone.`,
  },

  client: {
    notFound: "Client not found",
    notFoundText: "It may have been deleted.",
    back: "Back to clients",
    noContact: "No contact details",
    print: "Print",
    edit: "Edit client",
    delete: "Delete client",
    addMaterial: "Add material",
    fab: "Material",
    statTotal: "Total",
    statItems: "Items",
    statMonth: "This month",
    noResults: "No results",
    noResultsText: "Change the search or month.",
    empty: "No materials yet",
    emptyText: "Add the first material for this client.",
    entryDeleted: "Material removed",
    deleteEntryTitle: "Remove material?",
    deleteEntryText: (name, qty) => `"${name}" (${qty}) will be removed from this client.`,
    deleteText: (name, n) => `"${name}" and ${n} ${plural(n, "material", "materials")} will be deleted. This can't be undone.`,
  },

  clientForm: {
    addTitle: "Add client",
    editTitle: "Edit client",
    description: "Only the name is required",
    save: "Save client",
    name: "Name *",
    nameRequired: "Name is required.",
    namePh: "e.g. Arben Krasniqi",
    phone: "Phone",
    address: "Address",
    addressPh: "e.g. Prishtina",
    note: "Note",
  },

  entryForm: {
    addTitle: "Add material",
    editTitle: "Edit material",
    description: "Pick the material, just type the quantity",
    client: "Client",
    newMaterial: "New material: it will also be saved to the catalog",
    price: "Unit price (Den)",
    formula: "Quantity × Unit price",
    pickMaterial: "Pick a material.",
    enterQty: "Enter the quantity.",
    enterPrice: "Enter the price.",
    added: "Material added",
    addedToCatalog: "Material added (also to the catalog)",
    updated: "Material updated",
    pickPh: "Choose from the catalog…",
    searchPh: "Type to search…",
    isNew: "new",
    catalogEmpty: "The catalog is empty",
    addToCatalog: (q) => `Add “${q}” to the catalog`,
  },

  materials: {
    title: "Materials",
    subtitle: "Catalog: add a material once with its price, then just pick it for a client",
    add: "Add to catalog",
    fab: "To catalog",
    notFound: "No materials found",
    empty: "The catalog is empty",
    emptyText: "Add the materials you use most, with their prices.",
    colUsed: "Used",
    perUnit: (unit, n) => `per ${unit} · used ${n}×`,
    priceNote:
      "A price change only applies to materials added after the change. Materials already added to clients keep their price.",
    added: "Material added to catalog",
    updated: "Material updated",
    deleted: "Material removed from catalog",
    deleteTitle: "Remove from catalog?",
    deleteText: (name) => `"${name}" will no longer be offered. Materials already added to clients stay.`,
    editTitle: "Edit material",
    formDescription: "This price is filled in automatically for clients",
    save: "Save material",
    name: "Material name *",
    namePh: "e.g. Cement 25kg",
    nameRequired: "Enter the material name.",
    price: "Unit price (Den) *",
    colChange: "Last change",
    priceHistory: "Price history",
    priceHistoryText: (n) => (n === 0 ? "The price hasn't changed yet" : `${n} price ${plural(n, "change", "changes")}`),
    initialPrice: "Initial price",
    current: "Current",
    lowest: "Lowest",
    highest: "Highest",
    sinceStart: "Since first price",
    dateTime: "Date & time",
    change: "Change",
    priceRose: "Price went up",
    priceFell: "Price went down",
    noChanges: "No changes",
    priceChangeHint: "A price change is saved to the history with this date.",
    priceDate: "Price date",
    dateBeforeLast: (d) => `The date can't be before the last price change (${d}).`,
  },

  companies: {
    title: "Companies",
    subtitle: "The suppliers you buy materials from",
    label: "Company",
    add: "Add company",
    fab: "Company",
    search: "Search company, phone or city…",
    notFound: "No companies found",
    empty: "No companies yet",
    emptyText: "Add your suppliers to link them to materials.",
    colCompany: "Company",
    colPhone: "Phone",
    colMaterials: "Materials",
    colSold: "Sold to clients",
    viewMaterials: "View materials",
    none: "No company",
    all: "All companies",
    added: "Company added",
    updated: "Company updated",
    deleted: "Company deleted",
    deleteTitle: "Delete company?",
    deleteText: (name, n) =>
      `"${name}" will be deleted. ${n} catalog ${plural(n, "material stays", "materials stay")}, without a company.`,
    addTitle: "Add company",
    editTitle: "Edit company",
    description: "Only the name is required",
    save: "Save company",
    namePh: "e.g. Fero-Beton LLC",
  },

  history: {
    title: "Total history",
    subtitle: "Total across all clients, per year",
    allTime: "All time",
    totalFor: (period) => `Total · ${period}`,
    byMonth: (year) => `By month · ${year}`,
    entriesIn: (n) => `${n} ${plural(n, "material", "materials")}`,
  },

  settings: {
    title: "Profile",
    subtitle: "Account details, password and language",
    personal: "Personal details",
    name: "Name",
    saved: "Profile saved",
    changePw: "Change password",
    currentPw: "Current password",
    newPw: "New password",
    enterCurrentPw: "Enter your current password.",
    newPwMin: "The new password must be at least 8 characters.",
    pwChanged: "Password changed",
    resetTitle: "Restore demo data",
    resetText: "Brings back the sample clients and materials (only in the version without a database).",
    reset: "Restore",
    resetConfirmTitle: "Restore demo data?",
    resetConfirmText: "Your changes to clients and materials will be lost.",
    resetDone: "Demo data restored",
    logoutTitle: "Log out",
    logoutText: "You'll need to log in again.",
  },

  auth: {
    headline: "Every client's materials, in one place.",
    tagline: "Pick the material, type the quantity, the price is calculated for you. No formulas, no Excel.",
    welcome: "Welcome back",
    welcomeText: "Log in to continue to your clients and materials.",
    forgot: "Forgot password?",
    remember: "Keep me logged in",
    login: "Log in",
    pwMin4: "Password must be at least 4 characters.",
    noAccount: "Don't have an account?",
    register: "Sign up",
    demo: "Demo: any email and password (4+ characters) works.",
    registerTitle: "Create account",
    registerText: "Start tracking materials for your clients.",
    fullName: "Full name",
    fullNamePh: "e.g. Veton Hasani",
    enterName: "Enter your name.",
    pwHint: "At least 8 characters, one uppercase letter and one number.",
    createAccount: "Create account",
    haveAccount: "Have an account?",
    forgotText: "Enter your email and we'll send you a link to reset it.",
    sendLink: "Send link",
    checkEmail: "Check your email",
    sentTo: "We've sent a password reset link to",
    openLink: "Open link (demo)",
    resend: "Didn't get it? Send again",
    backToLogin: "Back to login",
    resetTitle: "Set a new password",
    resetText: "Choose a password you haven't used before.",
    newPw: "New password",
    repeatPw: "Repeat password",
    pwMismatch: "Passwords don't match.",
    savePw: "Save password",
    pwChanged: "Password changed",
    pwChangedText: "You can now log in with your new password.",
  },
};

const DICTS: Record<Lang, Dict> = { sq, en };
const KEY = "invoice-tracker:lang";

type I18n = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: Dict;
  /** Display label for a stored unit ("copë" → "pcs" in English). */
  unit: (u: string) => string;
  /** "2026-10" → "Tetor 2026" / "October 2026" */
  monthLabel: (ym: string) => string;
};

const Ctx = createContext<I18n | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(KEY);
      if (saved === "sq" || saved === "en") setLangState(saved);
    } catch {}
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem(KEY, l);
    } catch {}
  }, []);

  const value = useMemo<I18n>(() => {
    const t = DICTS[lang];
    return {
      lang,
      setLang,
      t,
      unit: (u) => t.units[u] ?? u,
      monthLabel: (ym) => {
        const [y, m] = ym.split("-");
        return `${t.months[Number(m) - 1]} ${y}`;
      },
    };
  }, [lang, setLang]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useT() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useT must be used inside <I18nProvider>");
  return ctx;
}
