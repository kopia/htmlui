import { render, screen } from '@testing-library/react'
import { expect, test } from '@jest/globals';
import userEvent from "@testing-library/user-event";
import { Preferences } from '../pages/Preferences';
const { setTheme } = jest.requireActual('../pages/Preferences');
// Wrapper
let wrapper;

/**
 * 
 */
beforeEach(() => {
    wrapper = render(<Preferences />)
});

/**
 * 
 */
describe('Calling the preference page', () => {
    test('Should render preferences', () => {
        expect(wrapper).toMatchSnapshot();
    })
})

/**
 * 
 */
describe('Select the light theme', () => {
    test('Should select light theme', () => {
     userEvent.selectOptions(
            screen.getByRole('combobox', { name: "Theme" }),
            screen.getByRole('option', { name: 'light' }));

        expect(screen.getByRole('option', { name: 'light' }).selected).toBe(true)

        expect(wrapper).toMatchSnapshot();
    })
})

/**
 * 
 */
describe('Test number of themes', () => {
    test('Should have four themes', () => {
        let theme = screen.getByRole('combobox', { name: "Theme" });
        expect(theme).toHaveLength(4);
        expect(wrapper).toMatchSnapshot();
    })
})

/**
 * 
 */
describe('Test byte representation', () => {
    test('Should have two options', () => {
        let theme = screen.getByRole('combobox', { name: "Byte representation" });
        expect(theme).toHaveLength(2);
        expect(wrapper).toMatchSnapshot();
    })
})