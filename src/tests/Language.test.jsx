import { render, screen } from '@testing-library/react'
import { expect, test } from '@jest/globals';

jest.mock('react-i18next', () => ({
    // this mock makes sure any components using the translate hook can use it without a warning being shown
    useTranslation: () => {
      return {
        t: (str) => str,
        i18n: {
          changeLanguage: () => new Promise(() => {}),
        },
      };
    },
    initReactI18next: {
      type: '3rdParty',
      init: () => {},
    }
  }));

/**
 * 
 */
describe('Check tranlations', () => {
    test('Translations should not have unused keys', () => {
    })
})


