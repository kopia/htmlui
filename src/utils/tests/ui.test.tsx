import { sizeDisplayName } from '../ui';

const base10Cases = {
	0: '0 B',
	1: '1 B',
	2: '2 B',
	899: '899 B',
	900: '0.9 KB',
	999: '1 KB',
	1000: '1 KB',
	1200: '1.2 KB',
	899999: '900 KB',
	900000: '0.9 MB',
	999000: '1 MB',
	999999: '1 MB',
	1000000: '1 MB',
	99000000: '99 MB',
	990000000: '1 GB',
	9990000000: '10 GB',
	99900000000: '99.9 GB',
	1000000000000: '1 TB',
	99000000000000: '99 TB',
};

const base2Cases = {
	0: '0 B',
	1: '1 B',
	2: '2 B',
	899: '899 B',
	900: '900 B',
	999: '1 KiB',
	1024: '1 KiB',
	1400: '1.4 KiB',
	// TODO: Unfamiliar with this syntax from Go
	// 900:<10 - 1, "900 KiB",
	// 900:<< 10, "900 KiB",
	999000: '1 MiB',
	999999: '1 MiB',
	1000000: '1 MiB',
	// 99:<< 20, "99 MiB",
	// 1:<< 30, "1 GiB",
	// 10:<< 30, "10 GiB",
	99900000000: '93 GiB',
	1000000000000: '0.9 TiB',
	99000000000000: '90 TiB',
};

describe('UI utils', () => {
	describe('sizeDisplayName', () => {
		it('returns an empty string when undefined', () =>
			expect(sizeDisplayName()).toEqual(''));

		it('returns the unit string in base-10', () =>
			Object.entries(base10Cases).forEach(([bytes, expected]) =>
				expect(sizeDisplayName(Number(bytes))).toEqual(expected)
			));

		it('returns the unit string in base-2', () =>
			Object.entries(base2Cases).forEach(([bytes, expected]) =>
				expect(sizeDisplayName(Number(bytes), true)).toEqual(expected)
			));
	});
});
