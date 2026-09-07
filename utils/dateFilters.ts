export type TimeFilterPreset = 'All Time' | 'Last 30 Days' | 'This Month' | 'Last Month' | 'This Quarter' | 'This Year';

export function isDateInFilter(dateString: string | null | undefined, filter: TimeFilterPreset): boolean {
    if (filter === 'All Time') return true;
    if (!dateString) return false;

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return false; // Invalid date

    const now = new Date();
    
    // Set 'now' to end of today for accurate backward calculations
    now.setHours(23, 59, 59, 999);

    switch (filter) {
        case 'Last 30 Days': {
            const thirtyDaysAgo = new Date(now);
            thirtyDaysAgo.setDate(now.getDate() - 30);
            thirtyDaysAgo.setHours(0, 0, 0, 0);
            return date >= thirtyDaysAgo && date <= now;
        }
        case 'This Month': {
            const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            return date >= firstDayOfMonth && date <= now;
        }
        case 'Last Month': {
            const firstDayOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            const lastDayOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
            return date >= firstDayOfLastMonth && date <= lastDayOfLastMonth;
        }
        case 'This Quarter': {
            const currentQuarter = Math.floor(now.getMonth() / 3);
            const firstDayOfQuarter = new Date(now.getFullYear(), currentQuarter * 3, 1);
            return date >= firstDayOfQuarter && date <= now;
        }
        case 'This Year': {
            const firstDayOfYear = new Date(now.getFullYear(), 0, 1);
            return date >= firstDayOfYear && date <= now;
        }
        default:
            return true;
    }
}
