import { useEffect, useState } from 'react';
import { useReviewStore } from '@/store/useReviewStore';
import orderApi from '@/api/orderService';
import reviewApi from '@/api/reviewService';

const PROMPT_COOLDOWN_MS = 3 * 24 * 60 * 60 * 1000; // 3 days

export function useReviewPrompt() {
    const [promptOrder, setPromptOrder] = useState<any | null>(null);
    const { 
        lastReviewPromptAt, 
        dismissedReviewOrderIds, 
        setLastReviewPromptAt 
    } = useReviewStore();

    useEffect(() => {
        let isMounted = true;

        const checkReviews = async () => {
            try {
                // --- TEMPORARY OVERRIDE FOR TESTING ---
                // We're forcing a dummy completed order so the user can see the UI immediately
                setPromptOrder({
                    id: 9999,
                    items: [
                        { screen_title: "Test Screen - UI Demo" }
                    ]
                });
                return;
                // --------------------------------------

                // 1. Check Cooldown
                if (lastReviewPromptAt) {
                    const timeSinceLastPrompt = Date.now() - (lastReviewPromptAt || 0);
                    if (timeSinceLastPrompt < PROMPT_COOLDOWN_MS) {
                        return; // Still in cooldown
                    }
                }

                // 2. Fetch the most recent completed order
                const res = await orderApi.getOrders({ status: 'completed', per_page: 5 });
                const completedOrders = res.orders || [];

                if (completedOrders.length === 0) return;

                // 3. Find the first completed order that we haven't dismissed
                const eligibleOrder = completedOrders.find(
                    (order) => !dismissedReviewOrderIds.includes(order.id.toString())
                );

                if (!eligibleOrder) return;

                // 4. Check if it already has a review
                const reviewStatus = await reviewApi.getOrderReviewStatus(eligibleOrder!.id);
                
                if (isMounted && reviewStatus?.review?.can_review && !reviewStatus?.review?.has_review) {
                    // We found an unreviewed completed order! Trigger the prompt.
                    setPromptOrder(eligibleOrder);
                }

            } catch (err) {
                console.log("[useReviewPrompt] Failed to check review status", err);
            }
        };

        checkReviews();

        return () => {
            isMounted = false;
        };
    }, []); // Only run once on mount (e.g. when home screen loads)

    const hidePrompt = () => {
        setPromptOrder(null);
    };

    const handleRemindLater = () => {
        setLastReviewPromptAt(Date.now());
        hidePrompt();
    };

    const handleDismiss = () => {
        if (promptOrder) {
            useReviewStore.getState().dismissReviewOrder(promptOrder.id.toString());
        }
        hidePrompt();
    };

    return {
        promptOrder,
        hidePrompt,
        handleRemindLater,
        handleDismiss
    };
}
