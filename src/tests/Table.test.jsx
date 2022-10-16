import { fireEvent } from '@testing-library/dom';
import { screen, render } from '@testing-library/react';
import { UIPreferenceProvider } from '../contexts/UIPreferencesContext';
import MyTable from '../Table';

const renderWithContext = bytesStringBase2 =>
  render(
    <UIPreferenceProvider initialValue={{ bytesStringBase2 }}>
      <MyTable />
    </UIPreferenceProvider>
  );

describe('Table', () => {
  describe('Units dropdown', () => {
    const getUnitButton = (unit) =>
      screen.getByRole('button', { name: `Units: ${unit}` });
    const openDropdown = () =>
      fireEvent.click(getUnitButton('Decimal'));

    describe('labeled with the units value', () => {
      it('decimal', () => {
        renderWithContext();
        getUnitButton('Decimal');
      });

      it('binary', () => {
        renderWithContext(true);
        getUnitButton('Binary');
      });
    });

    it('has dropdown options for Decimal and Binary', () => {
      renderWithContext();
      openDropdown();

      expect(screen.getAllByRole('button', { name: 'Units: Decimal' })).toHaveLength(2);
      getUnitButton('Binary');
    });

    it('updates the value when an option is selected', () => {
      renderWithContext();
      openDropdown();
      fireEvent.click(screen.getAllByRole('button', { name: 'Units: Decimal' })[0]);

      expect(screen.queryByRole('button', { name: 'Units: Decimal' })).toBeFalsy();
      getUnitButton('Binary');
    })
  });
});
