import { describe, expect, it } from "vitest";
import { languages, resources } from "../../src/locales";

function catalogKeys(catalog) {
  return Object.keys(catalog).sort();
}

describe("localisation catalogs", () => {
  it("has metadata for every locale", () => {
    expect(languages.map(({ locale }) => locale).sort()).toEqual(Object.keys(resources).sort());
  });

  for (const locale of Object.keys(resources)) {
    if (locale === "en") continue;

    it(`${locale} has the same namespaces and keys as English`, () => {
      expect(Object.keys(resources[locale]).sort()).toEqual(Object.keys(resources.en).sort());
      for (const namespace of Object.keys(resources.en)) {
        expect(catalogKeys(resources[locale][namespace])).toEqual(catalogKeys(resources.en[namespace]));
      }
    });
  }
});
