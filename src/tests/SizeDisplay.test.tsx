import { render, screen } from '@testing-library/react';
import { UIPreferenceProvider } from 'src/contexts/UIPreferencesContext';
import SizeDisplay from 'src/SizeDisplay';
import { Summary } from 'src/utils/ui';

const renderWithContext = (
    size?: number,
    summary?: Summary,
    bytesStringBase2 = false
) =>
    render(
        <UIPreferenceProvider initialValue={{ bytesStringBase2 }}>
            <SizeDisplay {...{ size, summary }} />
        </UIPreferenceProvider>
    );

const getErrorIcon = (container: HTMLElement) =>
    container.querySelector('[data-icon="triangle-exclamation"]');

const expectNoErrorIcon = (container: HTMLElement) =>
    expect(getErrorIcon(container)).toBeFalsy();

describe('SizeDisplay', () => {
    it('displays nothing if the size is undefined', () => {
        const { container } = renderWithContext();

        expect(container.childElementCount).toEqual(0);
    });

    it('displays the size in base-10', () => {
        const { container } = renderWithContext(900);

        screen.getByText('0.9 KB');
        expectNoErrorIcon(container);
    });

    it('displays the size in base-2', () => {
        const { container } = renderWithContext(900, undefined, true);

        screen.getByText('900 B');
        expectNoErrorIcon(container);
    });

    it('displays errors with an icon', () => {
        const rootError = { path: '/', error: 'root path' };
        const homeError = { path: '/home', error: 'home path' };

        const { container } = renderWithContext(900, {
            errors: [rootError, homeError],
            numFailed: 2,
        });

        screen.getByText('0.9 KB');
        expect(getErrorIcon(container)).toHaveAttribute(
            'title',
            'Encountered 2 errors:\n\n- /: root path\n- /home: home path'
        );
    });
});
