import apiClient from './client';

export interface DashboardScreensInfo {
    total: number;
    active: number;
    pending_review: number;
    rejected: number;
}

export interface DashboardEarningsInfo {
    total_earnings: number;
    total_paid: number;
    pending_payout: number;
}

export interface OnboardingStepInfo {
    complete: boolean;
    locked: boolean;
}

export interface DashboardOnboardingInfo {
    profile_incomplete: boolean;
    first_time_vendor: boolean;
    is_complete: boolean;
    next_step: string | null;
    steps: {
        profile: OnboardingStepInfo;
        tutorial: OnboardingStepInfo;
        screen: OnboardingStepInfo;
    };
}

export interface OwnerDashboardData {
    screens: DashboardScreensInfo;
    earnings: DashboardEarningsInfo;
    onboarding: DashboardOnboardingInfo;
}

export interface OwnerDashboardResponse {
    success: boolean;
    data: {
        dashboard: OwnerDashboardData;
    };
}

export interface CompleteTutorialResponse {
    success: boolean;
    data: {
        onboarding: DashboardOnboardingInfo;
    };
}

const ownerDashboardApi = {
    completeTutorial: async (): Promise<DashboardOnboardingInfo> => {
        const response = await apiClient.post<CompleteTutorialResponse>('/screen-owner/onboarding/tutorial-complete');
        return response?.data?.data?.onboarding;
    },

    fetchDashboardOverview: async (): Promise<OwnerDashboardData> => {
        const response = await apiClient.get<OwnerDashboardResponse>('/screen-owner/dashboard');
        
        if (response?.data?.success && response?.data?.data?.dashboard) {
            return response?.data?.data?.dashboard;
        }
        
        // Gracefully handle null or empty responses by returning a default structure
        return {
            screens: { total: 0, active: 0, pending_review: 0, rejected: 0 },
            earnings: { total_earnings: 0, total_paid: 0, pending_payout: 0 },
            onboarding: {
                profile_incomplete: false,
                first_time_vendor: false,
                is_complete: true,
                next_step: null,
                steps: {
                    profile: { complete: true, locked: false },
                    tutorial: { complete: true, locked: false },
                    screen: { complete: true, locked: false }
                }
            }
        };
    }
};

export default ownerDashboardApi;
