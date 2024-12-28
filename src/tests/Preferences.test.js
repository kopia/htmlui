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
describe('Select the light theme', () => {
    test('Should select light theme', () => {
     userEvent.selectOptions(
            screen.getByRole('combobox', { name: "Select theme" }),
            screen.getByRole('option', { name: 'light' }));

        expect(screen.getByRole('option', { name: 'light' }).selected).toBe(true)
    })
})

/**
 * 
 */
describe('Test number of themes', () => {
    test('Should have four themes', () => {
        let theme = screen.getByRole('combobox', { name: "Select theme" });
        expect(theme).toHaveLength(4);
    })
})

/**
 * 
 */
describe('Test byte representation', () => {
    test('Should have two options', () => {
        let theme = screen.getByRole('combobox', { name: "Select byte representation" });
        expect(theme).toHaveLength(2);
    })
})