import { screen } from '@testing-library/react';
import MyTable from '../Table';
import { simulateClick } from './testutils';
import { renderWithContext } from './testutils';

const renderTable = bytesStringBase2 =>
  renderWithContext(<MyTable columns={[]} />, { bytesStringBase2 });

describe('Table', () => {
  describe('Units dropdown', () => {
    const expectButtonCount = (unit, count) =>
      expect(
        screen.getAllByRole('button', { name: new RegExp(`Units: ${unit}`) })
      ).toHaveLength(count);

    const getUnitButton = (unit) =>
      screen.getByRole('button', { name: new RegExp(`Units: ${unit}`) });

    const openDropdown = () => simulateClick(getUnitButton('Decimal'));

    describe('labeled with the units value', () => {
      it('decimal', async () => {
        await renderTable();
        getUnitButton('Decimal');
      });

      it('binary', async () => {
        await renderTable(true);
        getUnitButton('Binary');
      });
    });

    it('has dropdown options for Decimal and Binary', async () => {
      await renderTable();
      openDropdown();

      expectButtonCount('Decimal', 2);
      getUnitButton('Binary');
    });

    it('updates the value when an option is selected', async () => {
      await renderTable();
      openDropdown();
      simulateClick(getUnitButton('Binary'));

      expectButtonCount('Binary', 2);
      getUnitButton('Decimal');
    });
  });
});
