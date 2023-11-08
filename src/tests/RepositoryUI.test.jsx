import axios from 'axios';
import React from 'react';
import App from '../App';
import { render } from '@testing-library/react';

jest.mock('axios');

// Wrapper
let wrapper;

/**
 * 
 */
beforeEach(() => {
    wrapper = render(<App />)
});

describe('Testing the app', () => {
    test('Should render the app', () => {
        expect(wrapper).toMatchSnapshot();
    })
})
