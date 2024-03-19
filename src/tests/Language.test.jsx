import { expect, test } from '@jest/globals';
const { sync: globSync } = require('glob');

const localesPaths = globSync('./public/locales/*/*.json', { realpath: true });
const srcPaths = globSync('./src/**/*.+(tsx|ts|jsx)', { realpath: true });


function computeIntersection(dataA, dataB) {
  return dataA.filter(element => dataB.includes(element));
}

/**
 * 
 */
describe('Check for unused translations', () => {
  test('Translations should be declared and used', () => {
  })
})

/**
 * This test checks for empty strings within each translation file.
 * If an empty string exists, the test will fail.
 */
describe('Check for empty translations', () => {
  test('Translations should not be emtpy', async () => {
    for (const localeFile in localesPaths) {
      let locale = localesPaths[localeFile]
      let data = require(locale);
      expect(data).not.toBeNull()

      for (const key in data) {
        expect(data[key]).toBeTruthy();
      }
    }
  })
})

/**
 * The test checks whether the intersection of two json sets is equal
 * to the length of the primary json key set. 
 * 
 * Each file is checked against the others.  
 */
describe('Check that translations are in sync', () => {
  test.each(localesPaths)('All translations should be in sync with each other', l1 => {
      for (const localeF2 in localesPaths) {
        let l2 = localesPaths[localeF2]
        // We do not have to check the file with itself
        if (l1 == l2) {
          break;
        }

        let msg = `${l1} should be in sync with ${l2}`
        let dataA = require(l1)
        let dataB = require(l2)
        expect(dataA).not.toBeNull()
        expect(dataB).not.toBeNull()

        let keysA = Object.keys(dataA)
        let keysB = Object.keys(dataB)
        expect(keysA.length).toBeGreaterThan(0)
        expect(keysB.length).toBeGreaterThan(0)

        let intersection = computeIntersection(keysA, keysB)
        expect({msg, result:intersection.length}).toEqual({msg, result:keysA.length})
      }
    })
})

