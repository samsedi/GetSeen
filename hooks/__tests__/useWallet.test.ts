import { renderHook, waitFor } from '@testing-library/react-native';
import { useWallet } from '../useWallet';
import { useOwnerBookingStore } from '@/store/useOwnerBookingStore';
import { useOwnerWalletStore } from '@/store/useOwnerWalletStore';
import { OwnerPayout } from '@/api/ownerWalletService';

describe('useWallet', () => {
    let currentUnmount: (() => void) | undefined;

    beforeEach(() => {
        jest.clearAllMocks();
        useOwnerBookingStore.setState({ fetchBookings: jest.fn().mockResolvedValue(undefined) });
    });

    afterEach(() => {
        currentUnmount?.();
        currentUnmount = undefined;
    });

    const setup = async (
        earnings: { total_earnings: number; total_paid: number; pending_payout: number },
        payouts: OwnerPayout[]
    ) => {
        useOwnerWalletStore.setState({
            earnings,
            payouts,
            fetchPayouts: jest.fn().mockResolvedValue(undefined),
            fetchEarnings: jest.fn().mockResolvedValue(undefined),
        });
        const { result, unmount } = await renderHook(() => useWallet());
        currentUnmount = unmount;
        await waitFor(() => expect(result.current.loading).toBe(false));
        return result;
    };

    it('formats the real aggregate earnings totals for display', async () => {
        const result = await setup(
            { total_earnings: 25000, total_paid: 15000, pending_payout: 10000 },
            []
        );

        expect(result.current.earningsSummary.totalEarnings).toBe('₦25,000.00');
        expect(result.current.earningsSummary.totalPaid).toBe('₦15,000.00');
        expect(result.current.earningsSummary.pendingPayout).toBe('₦10,000.00');
    });

    it('maps a paid payout using the real per-screen, per-week payout shape', async () => {
        const result = await setup(
            { total_earnings: 0, total_paid: 0, pending_payout: 0 },
            [{
                id: 264,
                screen_id: 27,
                screen_title: 'body love gym, ogba, lagos.',
                week_start: '2026-08-17',
                week_end: '2026-08-23',
                total_campaigns: 1,
                total_earnings: 8400.0,
                expected_payout_date: '2026-08-24',
                payout_date: '2026-08-17',
                status: 'paid',
                currency_symbol: '₦',
            }]
        );

        expect(result.current.payoutHistory).toEqual([
            {
                id: '264',
                screenTitle: 'body love gym, ogba, lagos.',
                weekStart: 'Aug 17, 2026',
                weekEnd: 'Aug 23, 2026',
                totalCampaigns: 1,
                earnings: '₦8,400.00',
                status: 'Paid',
                expectedPayoutDate: 'Aug 24, 2026',
                actualPayoutDate: 'Aug 17, 2026',
            },
        ]);
    });

    it('maps a pending payout with no payout_date yet', async () => {
        const result = await setup(
            { total_earnings: 0, total_paid: 0, pending_payout: 0 },
            [{
                id: 300,
                screen_id: 27,
                screen_title: 'body love gym, ogba, lagos.',
                week_start: '2026-08-24',
                week_end: '2026-08-30',
                total_campaigns: 2,
                total_earnings: 4000.0,
                expected_payout_date: '2026-08-31',
                payout_date: null,
                status: 'pending',
                currency_symbol: '₦',
            }]
        );

        expect(result.current.payoutHistory[0]).toMatchObject({
            status: 'Pending',
            actualPayoutDate: null,
        });
    });
});
