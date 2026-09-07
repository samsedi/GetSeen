import { aggregateVenueEarnings, PayoutHistoryData } from '../../hooks/useWallet';

describe('useWallet - aggregateVenueEarnings', () => {
    
    // Mock payout data
    const mockPayouts: PayoutHistoryData[] = [
        {
            id: '1',
            screenTitle: 'Body Love Gym, Ogba, Lagos.',
            weekStart: 'Aug 17, 2026',
            weekEnd: 'Aug 23, 2026',
            totalCampaigns: 2,
            earnings: '₦2,400.00',
            rawEarnings: 2400,
            status: 'Paid',
            expectedPayoutDate: 'Aug 24, 2026',
            actualPayoutDate: 'Aug 17, 2026',
            rawActualPayoutDate: '2026-08-17',
            rawWeekEnd: '2026-08-23',
        },
        {
            id: '2',
            screenTitle: 'Body Love Gym, Ogba, Lagos.',
            weekStart: 'Aug 24, 2026',
            weekEnd: 'Aug 30, 2026',
            totalCampaigns: 1,
            earnings: '₦1,000.00',
            rawEarnings: 1000,
            status: 'Pending',
            expectedPayoutDate: 'Sep 01, 2026',
            actualPayoutDate: null,
            rawActualPayoutDate: null,
            rawWeekEnd: '2026-08-30',
        },
        {
            id: '3',
            screenTitle: 'Second Gym, Ikeja',
            weekStart: 'Aug 17, 2026',
            weekEnd: 'Aug 23, 2026',
            totalCampaigns: 5,
            earnings: '₦5,000.00',
            rawEarnings: 5000,
            status: 'Paid',
            expectedPayoutDate: 'Aug 24, 2026',
            actualPayoutDate: 'Aug 18, 2026',
            rawActualPayoutDate: '2026-08-18',
            rawWeekEnd: '2026-08-23',
        }
    ];

    it('should accurately group payouts by venue (screenTitle)', () => {
        const result = aggregateVenueEarnings(mockPayouts);
        expect(result.length).toBe(2);
        
        const bodyLoveGym = result.find(v => v.venueName === 'Body Love Gym, Ogba, Lagos.');
        expect(bodyLoveGym).toBeDefined();
        expect(bodyLoveGym?.weeklyBreakdowns.length).toBe(2);

        const secondGym = result.find(v => v.venueName === 'Second Gym, Ikeja');
        expect(secondGym).toBeDefined();
        expect(secondGym?.weeklyBreakdowns.length).toBe(1);
    });

    it('should correctly sum up totalCampaigns', () => {
        const result = aggregateVenueEarnings(mockPayouts);
        const bodyLoveGym = result.find(v => v.venueName === 'Body Love Gym, Ogba, Lagos.')!;
        
        // 2 + 1 = 3 campaigns
        expect(bodyLoveGym.totalCampaigns).toBe(3);
    });

    it('should correctly split and sum Paid vs Pending payouts', () => {
        const result = aggregateVenueEarnings(mockPayouts);
        const bodyLoveGym = result.find(v => v.venueName === 'Body Love Gym, Ogba, Lagos.')!;

        // 1 pending (1000), 1 paid (2400) -> total 3400
        expect(bodyLoveGym.pendingPayout).toBe('₦1,000.00');
        expect(bodyLoveGym.paidAmount).toBe('₦2,400.00');
        expect(bodyLoveGym.totalEarnings).toBe('₦3,400.00');
    });

    it('should determine the correct lastPayoutDate among multiple completed payouts', () => {
        // Add another paid payout to Second Gym to test sorting
        const expandedMock = [
            ...mockPayouts,
            {
                id: '4',
                screenTitle: 'Second Gym, Ikeja',
                weekStart: 'Aug 24, 2026',
                weekEnd: 'Aug 30, 2026',
                totalCampaigns: 2,
                earnings: '₦2,000.00',
                rawEarnings: 2000,
                status: 'Paid',
                expectedPayoutDate: 'Sep 01, 2026',
                actualPayoutDate: 'Aug 25, 2026',
                rawActualPayoutDate: '2026-08-25',
                rawWeekEnd: '2026-08-30',
            } as PayoutHistoryData
        ];

        const result = aggregateVenueEarnings(expandedMock);
        const secondGym = result.find(v => v.venueName === 'Second Gym, Ikeja')!;

        // The latest date is Aug 25, 2026 (id: 4) vs Aug 18, 2026 (id: 3)
        expect(secondGym.lastPayoutDate).toBe('Aug 25, 2026');
    });

});
