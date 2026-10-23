const catalogModules = import.meta.glob("./*/*.json", { eager: true, import: "default" });

export const resources = {};
export const languages = [];

for (const [path, catalog] of Object.entries(catalogModules)) {
  const match = path.match(/^\.\/([^/]+)\/([^/]+)\.json$/);
  if (!match) continue;

  const [, locale, namespace] = match;
  if (namespace === "meta") {
    languages.push({ locale, ...catalog });
    continue;
  }

  resources[locale] ??= {};
  resources[locale][namespace] = catalog;
}

languages.sort((left, right) => left.label.localeCompare(right.label));

export const namespaces = [...new Set(Object.values(resources).flatMap((catalogs) => Object.keys(catalogs)))];
export const supportedLanguages = languages.map(({ locale }) => locale);
