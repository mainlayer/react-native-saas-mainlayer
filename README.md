# react-native-saas-mainlayer

![CI](https://github.com/mainlayer/react-native-saas-mainlayer/actions/workflows/ci.yml/badge.svg)
![License](https://img.shields.io/badge/license-MIT-blue)

Production-ready React Native SaaS starter with Mainlayer subscription billing. Pre-built screens for home, subscription checkout, and user dashboard with seamless entitlement gating.

## Quick Start

```bash
# Clone and install
git clone https://github.com/mainlayer/react-native-saas-mainlayer.git
cd react-native-saas-mainlayer && npm install

# Set environment variables
export EXPO_PUBLIC_MAINLAYER_API_KEY=your_api_key
export EXPO_PUBLIC_MAINLAYER_RESOURCE_ID=your_resource_id

# Run with Expo
npx expo start
```

## Environment Variables

Create `.env.local` (not committed):

```env
EXPO_PUBLIC_MAINLAYER_API_KEY=sk_live_...
EXPO_PUBLIC_MAINLAYER_RESOURCE_ID=saas_premium
```

| Variable | Description | Example |
|---|---|---|
| `EXPO_PUBLIC_MAINLAYER_API_KEY` | Public API key from Mainlayer dashboard | `sk_live_abc123...` |
| `EXPO_PUBLIC_MAINLAYER_RESOURCE_ID` | Resource ID for your SaaS tier | `saas_premium` |

## Architecture

```
src/
├── lib/
│   └── mainlayer.ts          # Low-level API client
├── services/
│   └── mainlayer.ts          # High-level service layer + singleton
├── hooks/
│   └── useSubscription.ts    # React hook for subscription state
├── screens/
│   ├── HomeScreen.tsx        # Landing / hero screen
│   ├── SubscriptionScreen.tsx # Checkout and plan selection
│   └── DashboardScreen.tsx   # Authenticated user content
├── App.tsx                   # Root navigator (Expo Router)
└── types.ts                  # TypeScript interfaces
```

## Core Features

- **Subscription Hook** (`useSubscription`) — entitlement check, plan loading, purchase, cancel
- **Three Pre-built Screens** — Home, Subscription (checkout), Dashboard
- **Premium Content Gating** — conditional rendering based on entitlement status
- **Service Layer** — singleton MainlayerClient with convenience helpers
- **Type Safety** — full TypeScript throughout
- **Dark Theme UI** — accessible, production-ready components

## Usage

### Basic Subscription Check

```tsx
import { useSubscription } from './src/hooks/useSubscription';
import { getClient } from './src/services/mainlayer';

function MyScreen() {
  const { isSubscribed, plans, purchase, isLoading } = useSubscription({
    client: getClient(),
    resourceId: 'saas_premium',
    payerWallet: userId,
  });

  if (isLoading) return <Text>Loading...</Text>;

  if (!isSubscribed) {
    return (
      <View>
        <Text>Upgrade to unlock premium features</Text>
        <Button
          title={`Upgrade - ${plans[0]?.price}`}
          onPress={() => purchase(plans[0])}
        />
      </View>
    );
  }

  return <PremiumContent />;
}
```

### Checking Entitlement Status

```tsx
import { checkSubscription, getEntitlementDetails } from './src/services/mainlayer';

// Simple boolean check
const isSubscribed = await checkSubscription(userId);

// Detailed status (plan, expiry, etc.)
const details = await getEntitlementDetails(userId);
console.log(details.planId);
console.log(details.expiresAt);
```

## Running

### Development

```bash
# Start Expo dev server
npx expo start

# Run on iOS (requires macOS + Xcode)
npx expo start --ios

# Run on Android (requires Android Studio or adb)
npx expo start --android

# Web preview
npx expo start --web
```

### Testing

```bash
# Run test suite
npm test

# Watch mode
npm test -- --watch

# Lint
npm run lint
```

## Deployment

### Prerequisites

- Mainlayer dashboard account with resource configured
- EAS (Expo Application Services) account for distribution
- Signed certificate for app stores (if needed)

### Steps

```bash
# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android

# Submit to app store
eas submit --platform ios
eas submit --platform android
```

### Environment Setup

In your CI/CD pipeline:

```bash
export EXPO_PUBLIC_MAINLAYER_API_KEY=$MAINLAYER_API_KEY
export EXPO_PUBLIC_MAINLAYER_RESOURCE_ID=$MAINLAYER_RESOURCE_ID
eas build --platform ios
```

## Project Structure

```
.
├── src/
│   ├── lib/mainlayer.ts       # API client (types, requests, errors)
│   ├── services/mainlayer.ts  # Service layer (singleton, convenience methods)
│   ├── hooks/useSubscription  # React hook for subscription state management
│   ├── screens/               # Navigation screens
│   ├── types.ts               # TypeScript interfaces
│   └── App.tsx                # Root component + navigation
├── tests/                     # Test files
├── .env.example               # Example environment file
├── package.json               # Dependencies
├── tsconfig.json              # TypeScript config
└── README.md
```

## API Reference

### `useSubscription(options)`

Main hook for managing subscription state.

**Parameters:**

```typescript
interface UseSubscriptionOptions {
  client: MainlayerClient;
  resourceId: string;
  payerWallet: string;
}
```

**Returns:**

```typescript
interface UseSubscriptionState {
  isSubscribed: boolean;
  isLoading: boolean;
  isError: boolean;
  error?: Error;
  plans: Plan[];
  purchase: (plan: Plan) => Promise<PaymentResult>;
  cancel: () => Promise<void>;
}
```

### `checkSubscription(userId)`

Quick boolean check for entitlement.

**Returns:** `Promise<boolean>`

### `getEntitlementDetails(userId)`

Get full entitlement status including plan and expiry.

**Returns:** `Promise<EntitlementStatus>`

## Troubleshooting

### API Key Not Found

```
Error: No Mainlayer API key found
```

Ensure `EXPO_PUBLIC_MAINLAYER_API_KEY` is set in your environment.

### 402 Payment Required

User has no active subscription. Show the subscription screen.

### Network Errors

Check that the Mainlayer API is reachable (`api.mainlayer.fr`).

## Support

- **Docs**: https://docs.mainlayer.fr
- **Issues**: Report on GitHub
- **Contact**: support@mainlayer.fr
