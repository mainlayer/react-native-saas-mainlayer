# react-native-saas-mainlayer
![CI](https://github.com/mainlayer/react-native-saas-mainlayer/actions/workflows/ci.yml/badge.svg) ![License](https://img.shields.io/badge/license-MIT-blue)

React Native SaaS starter with Mainlayer subscription billing. Home, subscription, and dashboard screens wired up out of the box.

## Install

```bash
npm install @mainlayer/sdk
```

## Quickstart

```tsx
import { useSubscription } from './src/hooks/useSubscription';
import { getClient } from './src/services/mainlayer';

function MyScreen() {
  const { isSubscribed, plans, purchase } = useSubscription({
    client: getClient(),
    resourceId: 'your-resource-id',
    payerWallet: currentUserId,
  });

  if (!isSubscribed) {
    return <Button title="Subscribe" onPress={() => purchase(plans[0])} />;
  }
  return <PremiumContent />;
}
```

## Features

- `useSubscription` hook — entitlement check, plan loading, purchase, cancel
- Three pre-built screens: Home, Subscription, Dashboard
- Premium content gating with upgrade prompts
- Mainlayer service layer with singleton client and type-safe helpers
- Dark theme UI components

## Run

```bash
EXPO_PUBLIC_MAINLAYER_API_KEY=... npx expo start
```

## Test

```bash
npm test
```

📚 [mainlayer.fr](https://mainlayer.fr)
