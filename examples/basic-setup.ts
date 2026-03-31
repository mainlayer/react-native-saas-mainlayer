/**
 * Basic Mainlayer setup example for React Native.
 *
 * Shows how to check entitlements and initiate a purchase outside
 * of the React component tree (e.g., in a background task or native module).
 */
import { MainlayerClient } from '../src/lib/mainlayer';
import {
  checkSubscription,
  purchasePlan,
  fetchPlans,
  cancelSubscription,
  APP_RESOURCE_ID,
} from '../src/services/mainlayer';

// 1. Direct client usage
async function directClientExample() {
  const client = new MainlayerClient({
    apiKey: process.env.EXPO_PUBLIC_MAINLAYER_API_KEY ?? '',
  });

  const userId = 'user_example_001';

  // Check entitlement
  const entitled = await client.checkEntitlement(APP_RESOURCE_ID, userId);
  console.log('Is subscribed:', entitled);

  // Get available plans
  const plans = await client.getPlans();
  console.log('Available plans:', plans.map((p) => `${p.name} — $${p.price}/${p.interval}`));

  if (!entitled && plans.length > 0) {
    // Purchase the first plan
    const result = await client.pay(plans[0].resourceId, userId);
    console.log('Purchase result:', result.success ? 'success' : `failed: ${result.error}`);
  }
}

// 2. Service layer usage (recommended)
async function serviceLayerExample() {
  const userId = 'user_example_002';

  // Check subscription status
  const isSubscribed = await checkSubscription(userId);
  console.log('Subscribed:', isSubscribed);

  if (!isSubscribed) {
    // Load plans and purchase
    const plans = await fetchPlans();
    if (plans.length > 0) {
      const proPlan = plans.find((p) => p.name.toLowerCase().includes('pro')) ?? plans[0];
      const result = await purchasePlan(userId, proPlan);
      console.log('Purchased:', result.transactionId);
    }
  }

  // Cancel
  // await cancelSubscription(userId);
}

// Run
directClientExample().catch(console.error);
