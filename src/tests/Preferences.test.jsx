import { render, screen } from '@testing-library/react'
import { expect, test } from '@jest/globals';
import userEvent from "@testing-library/user-event";
import { Preferences } from '../pages/Preferences';

import { configure } from '@testing-library/dom'
configure({ testIdAttribute: 'id' })

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
            screen.getByTestId('themeSelector'),
            screen.getByRole('option', { name: "ui.value.theme-light" }));

        expect(screen.getByRole('option', { name: "ui.value.theme-light" }).selected).toBe(true)
        expect(wrapper).toMatchSnapshot();
    })
})

/**
 * 
 */
describe('Test number of themes', () => {
    test('Should have four themes', () => {
        let selector = screen.getByTestId('themeSelector');
        expect(selector).toHaveLength(4);
        expect(wrapper).toMatchSnapshot();
    })
})

/**
 * 
 */
describe('Test byte representation', () => {
    test('Should have two options', () => {
        let selector = screen.getByTestId('bytesBaseInput');
        expect(selector).toHaveLength(2);
        expect(wrapper).toMatchSnapshot();
    })
})