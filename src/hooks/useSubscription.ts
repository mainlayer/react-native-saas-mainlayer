/**
 * useSubscription — React hook for Mainlayer subscription state.
 *
 * Checks whether the current user has an active entitlement for the given
 * Mainlayer resource and exposes helpers to purchase or cancel.
 */
import { useState, useEffect, useCallback } from 'react';
import {
  MainlayerClient,
  MainlayerError,
  PaymentResult,
  Plan,
} from '../lib/mainlayer';

export type SubscriptionStatus =
  | 'loading'
  | 'subscribed'
  | 'unsubscribed'
  | 'error';

export interface UseSubscriptionOptions {
  client: MainlayerClient;
  resourceId: string;
  /** Unique identifier for the current user / wallet */
  payerWallet: string;
  /** Re-check interval in milliseconds. Defaults to 60_000 (1 min). */
  refreshInterval?: number;
}

export interface UseSubscriptionReturn {
  status: SubscriptionStatus;
  isSubscribed: boolean;
  isLoading: boolean;
  error: string | null;
  plans: Plan[];
  purchase: (plan: Plan) => Promise<PaymentResult>;
  cancel: () => Promise<void>;
  refresh: () => Promise<void>;
}

export function useSubscription({
  client,
  resourceId,
  payerWallet,
  refreshInterval = 60_000,
}: UseSubscriptionOptions): UseSubscriptionReturn {
  const [status, setStatus] = useState<SubscriptionStatus>('loading');
  const [error, setError] = useState<string | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);

  const checkEntitlement = useCallback(async () => {
    if (!payerWallet) return;
    try {
      setStatus('loading');
      const entitled = await client.checkEntitlement(resourceId, payerWallet);
      setStatus(entitled ? 'subscribed' : 'unsubscribed');
      setError(null);
    } catch (err) {
      const msg =
        err instanceof MainlayerError
          ? err.message
          : 'Failed to check subscription status.';
      setStatus('error');
      setError(msg);
    }
  }, [client, resourceId, payerWallet]);

  const loadPlans = useCallback(async () => {
    try {
      const available = await client.getPlans();
      setPlans(available);
    } catch {
      // Plans failing to load is non-fatal
    }
  }, [client]);

  // Initial load
  useEffect(() => {
    checkEntitlement();
    loadPlans();
  }, [checkEntitlement, loadPlans]);

  // Periodic refresh
  useEffect(() => {
    if (refreshInterval <= 0) return;
    const timer = setInterval(checkEntitlement, refreshInterval);
    return () => clearInterval(timer);
  }, [checkEntitlement, refreshInterval]);

  const purchase = useCallback(
    async (plan: Plan): Promise<PaymentResult> => {
      const result = await client.pay(plan.resourceId, payerWallet);
      if (result.success) {
        setStatus('subscribed');
        setError(null);
      }
      return result;
    },
    [client, payerWallet]
  );

  const cancel = useCallback(async () => {
    await client.cancelSubscription(resourceId, payerWallet);
    setStatus('unsubscribed');
  }, [client, resourceId, payerWallet]);

  return {
    status,
    isSubscribed: status === 'subscribed',
    isLoading: status === 'loading',
    error,
    plans,
    purchase,
    cancel,
    refresh: checkEntitlement,
  };
}
