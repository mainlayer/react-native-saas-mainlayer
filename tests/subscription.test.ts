/**
 * Tests for the useSubscription hook and Mainlayer service.
 */
import { renderHook, act } from '@testing-library/react-hooks';
import { useSubscription } from '../src/hooks/useSubscription';
import {
  MainlayerClient,
  MainlayerError,
  Plan,
  PaymentResult,
  EntitlementStatus,
} from '../src/lib/mainlayer';

// ---------------------------------------------------------------------------
// Mock MainlayerClient
// ---------------------------------------------------------------------------

const mockPlan: Plan = {
  id: 'plan_pro',
  name: 'Pro',
  description: 'Pro plan',
  price: 9.99,
  currency: 'usd',
  interval: 'month',
  features: ['Unlimited projects', 'Priority support'],
  resourceId: 'res_pro_001',
  popular: true,
};

function createMockClient(overrides: Partial<{
  checkEntitlement: (resourceId: string, payer: string) => Promise<boolean>;
  getPlans: () => Promise<Plan[]>;
  pay: (resourceId: string, payer: string) => Promise<PaymentResult>;
  getEntitlementStatus: (resourceId: string, payer: string) => Promise<EntitlementStatus>;
  cancelSubscription: (resourceId: string, payer: string) => Promise<{ success: boolean }>;
}> = {}): MainlayerClient {
  return {
    checkEntitlement: overrides.checkEntitlement ?? jest.fn().mockResolvedValue(false),
    getPlans: overrides.getPlans ?? jest.fn().mockResolvedValue([mockPlan]),
    pay: overrides.pay ?? jest.fn().mockResolvedValue({ success: true, transactionId: 'txn_001' }),
    getEntitlementStatus: overrides.getEntitlementStatus ?? jest.fn().mockResolvedValue({ entitled: false }),
    cancelSubscription: overrides.cancelSubscription ?? jest.fn().mockResolvedValue({ success: true }),
  } as unknown as MainlayerClient;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('useSubscription', () => {
  it('returns loading initially', () => {
    const client = createMockClient({
      checkEntitlement: jest.fn(() => new Promise(() => {})), // never resolves
    });

    const { result } = renderHook(() =>
      useSubscription({
        client,
        resourceId: 'res_test',
        payerWallet: 'user_test',
        refreshInterval: 0,
      })
    );

    expect(result.current.isLoading).toBe(true);
    expect(result.current.isSubscribed).toBe(false);
  });

  it('sets subscribed true when entitled', async () => {
    const client = createMockClient({
      checkEntitlement: jest.fn().mockResolvedValue(true),
    });

    const { result, waitForNextUpdate } = renderHook(() =>
      useSubscription({
        client,
        resourceId: 'res_test',
        payerWallet: 'user_test',
        refreshInterval: 0,
      })
    );

    await waitForNextUpdate();

    expect(result.current.isSubscribed).toBe(true);
    expect(result.current.status).toBe('subscribed');
  });

  it('sets unsubscribed when not entitled', async () => {
    const client = createMockClient({
      checkEntitlement: jest.fn().mockResolvedValue(false),
    });

    const { result, waitForNextUpdate } = renderHook(() =>
      useSubscription({
        client,
        resourceId: 'res_test',
        payerWallet: 'user_test',
        refreshInterval: 0,
      })
    );

    await waitForNextUpdate();

    expect(result.current.isSubscribed).toBe(false);
    expect(result.current.status).toBe('unsubscribed');
  });

  it('loads available plans', async () => {
    const client = createMockClient({
      checkEntitlement: jest.fn().mockResolvedValue(false),
    });

    const { result, waitForNextUpdate } = renderHook(() =>
      useSubscription({
        client,
        resourceId: 'res_test',
        payerWallet: 'user_test',
        refreshInterval: 0,
      })
    );

    await waitForNextUpdate();

    expect(result.current.plans).toHaveLength(1);
    expect(result.current.plans[0].name).toBe('Pro');
  });

  it('updates to subscribed after successful purchase', async () => {
    const client = createMockClient({
      checkEntitlement: jest.fn().mockResolvedValue(false),
      pay: jest.fn().mockResolvedValue({ success: true, transactionId: 'txn_new' }),
    });

    const { result, waitForNextUpdate } = renderHook(() =>
      useSubscription({
        client,
        resourceId: 'res_test',
        payerWallet: 'user_test',
        refreshInterval: 0,
      })
    );

    await waitForNextUpdate();
    expect(result.current.isSubscribed).toBe(false);

    await act(async () => {
      await result.current.purchase(mockPlan);
    });

    expect(result.current.isSubscribed).toBe(true);
    expect(result.current.status).toBe('subscribed');
  });

  it('handles entitlement check errors gracefully', async () => {
    const client = createMockClient({
      checkEntitlement: jest.fn().mockRejectedValue(
        new MainlayerError('Network error', 503)
      ),
    });

    const { result, waitForNextUpdate } = renderHook(() =>
      useSubscription({
        client,
        resourceId: 'res_test',
        payerWallet: 'user_test',
        refreshInterval: 0,
      })
    );

    await waitForNextUpdate();

    expect(result.current.status).toBe('error');
    expect(result.current.error).toContain('Network error');
  });

  it('transitions to unsubscribed after cancel', async () => {
    const client = createMockClient({
      checkEntitlement: jest.fn().mockResolvedValue(true),
      cancelSubscription: jest.fn().mockResolvedValue({ success: true }),
    });

    const { result, waitForNextUpdate } = renderHook(() =>
      useSubscription({
        client,
        resourceId: 'res_test',
        payerWallet: 'user_test',
        refreshInterval: 0,
      })
    );

    await waitForNextUpdate();
    expect(result.current.isSubscribed).toBe(true);

    await act(async () => {
      await result.current.cancel();
    });

    expect(result.current.isSubscribed).toBe(false);
    expect(result.current.status).toBe('unsubscribed');
  });
});
