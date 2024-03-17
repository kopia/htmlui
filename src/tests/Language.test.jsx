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
describe('Check completeness of tranlations', () => {
  test('Translations should not have unused keys', () => {
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
  test('All translations should be in sync with each other', () => {
    for (const localeF1 in localesPaths) {
      let l1 = localesPaths[localeF1]
      for (const localeF2 in localesPaths) {
        let l2 = localesPaths[localeF2]
        // We do not have to check the files with itself
        if (l1 == l2) {
          break;
        }
        let dataA = require(l1)
        let dataB = require(l2)
        let keysA = Object.keys(dataA)
        let keysB = Object.keys(dataB)
        let intersection = computeIntersection(keysA, keysB)
        expect(intersection.length).toEqual(keysA.length)
      }
    }
  })
})

