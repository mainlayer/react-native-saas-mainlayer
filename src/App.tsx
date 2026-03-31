/**
 * App.tsx — React Native root component.
 *
 * Manages top-level navigation state and Mainlayer subscription context.
 */
import React, { useState, useMemo } from 'react';
import { SafeAreaView, StatusBar, StyleSheet } from 'react-native';

import { getClient, APP_RESOURCE_ID } from './services/mainlayer';
import { useSubscription } from './hooks/useSubscription';
import { HomeScreen } from './screens/HomeScreen';
import { SubscriptionScreen } from './screens/SubscriptionScreen';
import { DashboardScreen } from './screens/DashboardScreen';

type Screen = 'home' | 'subscription' | 'dashboard';

// Demo user ID — in production, derive from your auth system
const DEMO_USER_ID = 'user_demo_001';

export default function App(): React.JSX.Element {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');

  const client = useMemo(() => getClient(), []);

  const {
    isSubscribed,
    isLoading,
    plans,
    purchase,
    cancel,
    refresh,
  } = useSubscription({
    client,
    resourceId: APP_RESOURCE_ID,
    payerWallet: DEMO_USER_ID,
  });

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#0F0F1A" />

      {currentScreen === 'home' && (
        <HomeScreen
          isSubscribed={isSubscribed}
          isLoading={isLoading}
          userId={DEMO_USER_ID}
          onNavigateToDashboard={() => setCurrentScreen('dashboard')}
          onNavigateToSubscription={() => setCurrentScreen('subscription')}
        />
      )}

      {currentScreen === 'subscription' && (
        <SubscriptionScreen
          plans={plans}
          isSubscribed={isSubscribed}
          isLoading={isLoading}
          onPurchase={purchase}
          onCancel={cancel}
          onBack={() => setCurrentScreen('home')}
        />
      )}

      {currentScreen === 'dashboard' && (
        <DashboardScreen
          isSubscribed={isSubscribed}
          userId={DEMO_USER_ID}
          onUpgrade={() => setCurrentScreen('subscription')}
          onBack={() => setCurrentScreen('home')}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0F0F1A',
  },
});
