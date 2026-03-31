/**
 * HomeScreen — shown to all users (subscribed or not).
 *
 * Displays a teaser of the app and a subscribe CTA for free users.
 */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';

interface HomeScreenProps {
  isSubscribed: boolean;
  isLoading: boolean;
  userId: string;
  onNavigateToDashboard: () => void;
  onNavigateToSubscription: () => void;
}

export function HomeScreen({
  isSubscribed,
  isLoading,
  userId,
  onNavigateToDashboard,
  onNavigateToSubscription,
}: HomeScreenProps): React.JSX.Element {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.logo}>⚡ MyApp</Text>
      <Text style={styles.tagline}>Supercharge your workflow</Text>

      {isLoading ? (
        <ActivityIndicator size="large" color="#6C63FF" style={styles.loader} />
      ) : isSubscribed ? (
        <>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>PRO</Text>
          </View>
          <Text style={styles.subtitle}>Welcome back, {userId.slice(0, 8)}!</Text>
          <TouchableOpacity style={styles.primaryButton} onPress={onNavigateToDashboard}>
            <Text style={styles.primaryButtonText}>Open Dashboard →</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text style={styles.subtitle}>
            Unlock premium features with a subscription.
          </Text>
          <View style={styles.featureList}>
            {FEATURES.map((f) => (
              <Text key={f} style={styles.featureItem}>
                ✓ {f}
              </Text>
            ))}
          </View>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={onNavigateToSubscription}
          >
            <Text style={styles.primaryButtonText}>View Plans</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton} onPress={onNavigateToDashboard}>
            <Text style={styles.secondaryButtonText}>Continue with Free</Text>
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );
}

const FEATURES = [
  'Unlimited projects',
  'Advanced analytics',
  'Priority support',
  'Export to PDF & CSV',
  'Team collaboration',
];

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#0F0F1A',
  },
  logo: {
    fontSize: 48,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 18,
    color: '#9B9BB0',
    marginBottom: 32,
  },
  loader: {
    marginVertical: 32,
  },
  badge: {
    backgroundColor: '#6C63FF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginBottom: 12,
  },
  badgeText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 16,
    color: '#C0C0D0',
    textAlign: 'center',
    marginBottom: 24,
  },
  featureList: {
    alignSelf: 'stretch',
    marginBottom: 28,
    paddingHorizontal: 16,
  },
  featureItem: {
    fontSize: 15,
    color: '#A0A0C0',
    marginBottom: 8,
  },
  primaryButton: {
    backgroundColor: '#6C63FF',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 40,
    marginBottom: 12,
    width: '100%',
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: '#3A3A5A',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 40,
    width: '100%',
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#9B9BB0',
    fontSize: 16,
  },
});
