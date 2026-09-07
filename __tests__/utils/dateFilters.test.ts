import { isDateInFilter } from '../../utils/dateFilters';

describe('dateFilters utility', () => {
    beforeAll(() => {
        // Mock current date to "2026-09-04T12:00:00Z"
        jest.useFakeTimers();
        jest.setSystemTime(new Date('2026-09-04T12:00:00Z'));
    });

    afterAll(() => {
        jest.useRealTimers();
    });

    describe('isDateInFilter', () => {
        it('should always return true for "All Time"', () => {
            expect(isDateInFilter('1999-01-01', 'All Time')).toBe(true);
            expect(isDateInFilter(null, 'All Time')).toBe(true);
            expect(isDateInFilter('invalid date', 'All Time')).toBe(true);
        });

        it('should return false for invalid dates', () => {
            expect(isDateInFilter(null, 'This Month')).toBe(false);
            expect(isDateInFilter('invalid date', 'This Month')).toBe(false);
        });

        it('should filter "Last 30 Days"', () => {
            // Today is Sept 4
            expect(isDateInFilter('2026-09-03', 'Last 30 Days')).toBe(true);
            expect(isDateInFilter('2026-08-15', 'Last 30 Days')).toBe(true);
            
            // 31 days ago (Aug 4)
            expect(isDateInFilter('2026-08-04', 'Last 30 Days')).toBe(false);
        });

        it('should filter "This Month"', () => {
            // Sept 2026
            expect(isDateInFilter('2026-09-01', 'This Month')).toBe(true);
            expect(isDateInFilter('2026-09-04', 'This Month')).toBe(true);
            
            // Aug 2026
            expect(isDateInFilter('2026-08-31', 'This Month')).toBe(false);
        });

        it('should filter "Last Month"', () => {
            // Aug 2026
            expect(isDateInFilter('2026-08-01', 'Last Month')).toBe(true);
            expect(isDateInFilter('2026-08-31', 'Last Month')).toBe(true);
            
            // July 2026 and Sept 2026
            expect(isDateInFilter('2026-07-31', 'Last Month')).toBe(false);
            expect(isDateInFilter('2026-09-01', 'Last Month')).toBe(false);
        });

        it('should filter "This Quarter"', () => {
            // Q3: July 1 - Sept 30
            expect(isDateInFilter('2026-07-01', 'This Quarter')).toBe(true);
            expect(isDateInFilter('2026-08-15', 'This Quarter')).toBe(true);
            expect(isDateInFilter('2026-09-04', 'This Quarter')).toBe(true);
            
            // June 30
            expect(isDateInFilter('2026-06-30', 'This Quarter')).toBe(false);
        });

        it('should filter "This Year"', () => {
            // 2026
            expect(isDateInFilter('2026-01-01', 'This Year')).toBe(true);
            expect(isDateInFilter('2026-09-04', 'This Year')).toBe(true);
            
            // 2025
            expect(isDateInFilter('2025-12-31', 'This Year')).toBe(false);
        });
    });
});
