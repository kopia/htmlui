import { RenderResult, screen } from '@testing-library/react';
import SizeDisplay from 'src/SizeDisplay';
import { Summary } from 'src/utils/ui';
//@ts-ignore
import { renderWithContext } from './testutils';

const renderSizeDisplay = (size?: number, summary?: Summary, bytesStringBase2 = false) =>
    renderWithContext(<SizeDisplay {...{ size, summary }} />, { bytesStringBase2 });


const getErrorIcon = (container: HTMLElement) =>
    container.querySelector('[data-icon="triangle-exclamation"]');

const expectNoErrorIcon = (container: HTMLElement) =>
    expect(getErrorIcon(container)).toBeFalsy();

describe('SizeDisplay', () => {
    it('displays nothing if the size is undefined', async () => {
        const { container } = await renderSizeDisplay();

        expect(container.childElementCount).toEqual(0);
    });

    it('displays the size in base-10', async () => {
        const { container } = await renderSizeDisplay(900);

        screen.getByText('0.9 KB');
        expectNoErrorIcon(container);
    });

    it('displays the size in base-2', async () => {
        const { container } = await renderSizeDisplay(900, undefined, true);

        screen.getByText('900 B');
        expectNoErrorIcon(container);
    });

    it('displays errors with an icon', async () => {
        const rootError = { path: '/', error: 'root path' };
        const homeError = { path: '/home', error: 'home path' };

        const { container } = await renderSizeDisplay(900, {
            errors: [rootError, homeError],
            numFailed: 2,
        });

        screen.getByText('0.9 KB');
        expect(getErrorIcon(container)?.querySelector('title')?.textContent).toEqual(
            'Encountered 2 errors:\n\n- /: root path\n- /home: home path'
        );
    });
});
