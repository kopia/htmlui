import { fireEvent, act, render } from '@testing-library/react';
import { setupAPIMock } from './api_mocks';
import { UIPreferenceProvider } from '../contexts/UIPreferencesContext';

export function changeControlValue(selector, value) {
    fireEvent.change(selector, { target: { value: value } })
}

export function toggleCheckbox(selector) {
    fireEvent.click(selector)
}

export function simulateClick(selector) {
    fireEvent.click(selector);
}

export const renderWithContext = async (children, value) => {
    let serverMock = setupAPIMock();
    // Properly return values when UIPreferenceProvider makes the request
    serverMock.onGet('/api/v1/ui-preferences').reply(200, value);
    serverMock.onPut('/api/v1/ui-preferences').reply(204);

    let result;
    await act(() => {
        result = render(
            <UIPreferenceProvider initialValue={value}>
                {children}
            </UIPreferenceProvider>
        );
    });
    return result;
};
