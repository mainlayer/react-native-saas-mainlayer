/**
 * Mainlayer service singleton for React Native.
 *
 * Wraps the MainlayerClient with app-level configuration and exposes
 * convenience helpers used across the app.
 */
import {
  MainlayerClient,
  MainlayerError,
  getMainlayerClient,
  resetMainlayerClient,
  Plan,
  PaymentResult,
  EntitlementStatus,
} from '../lib/mainlayer';

// Re-export types for convenience
export type { Plan, PaymentResult, EntitlementStatus, MainlayerError };

/** The Mainlayer resource ID for this app's subscription. */
const APP_RESOURCE_ID =
  process.env.EXPO_PUBLIC_MAINLAYER_RESOURCE_ID ?? 'default-resource';

/**
 * Get (or lazily create) the singleton Mainlayer client.
 */
export function getClient(): MainlayerClient {
  return getMainlayerClient();
}

/**
 * Check whether a user has an active subscription.
 *
 * @param userId - The user ID or identifier
 * @returns true if user has active entitlement, false otherwise
 */
export async function checkSubscription(userId: string): Promise<boolean> {
  if (!userId) {
    throw new Error('userId is required for checkSubscription');
  }
  const client = getClient();
  return client.checkEntitlement(APP_RESOURCE_ID, userId);
}

/**
 * Get full entitlement details (plan, expiry, etc.).
 *
 * @param userId - The user ID or identifier
 * @returns EntitlementStatus with plan and expiry info
 */
export async function getEntitlementDetails(
  userId: string
): Promise<EntitlementStatus> {
  if (!userId) {
    throw new Error('userId is required for getEntitlementDetails');
  }
  const client = getClient();
  return client.getEntitlementStatus(APP_RESOURCE_ID, userId);
}

/**
 * Purchase a subscription plan for the user.
 */
export async function purchasePlan(
  userId: string,
  plan: Plan
): Promise<PaymentResult> {
  const client = getClient();
  return client.pay(plan.resourceId, userId);
}

/**
 * Fetch available subscription plans.
 */
export async function fetchPlans(): Promise<Plan[]> {
  const client = getClient();
  return client.getPlans();
}

/**
 * Cancel the user's active subscription.
 */
export async function cancelSubscription(userId: string): Promise<void> {
  const client = getClient();
  await client.cancelSubscription(APP_RESOURCE_ID, userId);
}

/**
 * Reset the client singleton (for testing or key rotation).
 */
export { resetMainlayerClient };
export { APP_RESOURCE_ID };
