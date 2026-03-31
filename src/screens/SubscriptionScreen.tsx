/**
 * SubscriptionScreen — displays available plans and handles purchase flow.
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Plan, PaymentResult } from '../lib/mainlayer';

interface SubscriptionScreenProps {
  plans: Plan[];
  isSubscribed: boolean;
  isLoading: boolean;
  onPurchase: (plan: Plan) => Promise<PaymentResult>;
  onCancel: () => Promise<void>;
  onBack: () => void;
}

export function SubscriptionScreen({
  plans,
  isSubscribed,
  isLoading,
  onPurchase,
  onCancel,
  onBack,
}: SubscriptionScreenProps): React.JSX.Element {
  const [purchasing, setPurchasing] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

  const handlePurchase = async (plan: Plan) => {
    setSelectedPlanId(plan.id);
    setPurchasing(true);
    try {
      const result = await onPurchase(plan);
      if (result.success) {
        Alert.alert('Success', `You're now subscribed to ${plan.name}!`, [
          { text: 'OK', onPress: onBack },
        ]);
      } else {
        Alert.alert('Payment Failed', result.error ?? 'Please try again.');
      }
    } catch (err) {
      Alert.alert('Error', 'Could not complete purchase. Please try again.');
    } finally {
      setPurchasing(false);
      setSelectedPlanId(null);
    }
  };

  const handleCancel = () => {
    Alert.alert(
      'Cancel Subscription',
      'Are you sure you want to cancel your subscription?',
      [
        { text: 'Keep Subscription', style: 'cancel' },
        {
          text: 'Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              await onCancel();
              Alert.alert('Cancelled', 'Your subscription has been cancelled.');
              onBack();
            } catch {
              Alert.alert('Error', 'Failed to cancel subscription.');
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <Text style={styles.backButtonText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Choose a Plan</Text>
      <Text style={styles.subtitle}>Cancel anytime. Powered by Mainlayer.</Text>

      {isLoading ? (
        <ActivityIndicator size="large" color="#6C63FF" />
      ) : plans.length === 0 ? (
        <Text style={styles.emptyText}>No plans available at the moment.</Text>
      ) : (
        plans.map((plan) => (
          <View
            key={plan.id}
            style={[styles.planCard, plan.popular ? styles.planCardPopular : null]}
          >
            {plan.popular && (
              <View style={styles.popularBadge}>
                <Text style={styles.popularBadgeText}>MOST POPULAR</Text>
              </View>
            )}
            <Text style={styles.planName}>{plan.name}</Text>
            <Text style={styles.planDescription}>{plan.description}</Text>
            <Text style={styles.planPrice}>
              ${plan.price}
              <Text style={styles.planInterval}>/{plan.interval}</Text>
            </Text>
            {plan.features.map((feature) => (
              <Text key={feature} style={styles.planFeature}>
                ✓ {feature}
              </Text>
            ))}
            <TouchableOpacity
              style={[
                styles.purchaseButton,
                (purchasing && selectedPlanId === plan.id) ? styles.purchaseButtonLoading : null,
              ]}
              onPress={() => handlePurchase(plan)}
              disabled={purchasing}
            >
              {purchasing && selectedPlanId === plan.id ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.purchaseButtonText}>
                  {isSubscribed ? 'Switch to This Plan' : 'Subscribe'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        ))
      )}

      {isSubscribed && (
        <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
          <Text style={styles.cancelButtonText}>Cancel Subscription</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#0F0F1A',
  },
  backButton: {
    marginBottom: 20,
  },
  backButtonText: {
    color: '#6C63FF',
    fontSize: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B6B8A',
    marginBottom: 24,
  },
  emptyText: {
    color: '#6B6B8A',
    textAlign: 'center',
    marginTop: 40,
  },
  planCard: {
    backgroundColor: '#1A1A2E',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2A2A4A',
  },
  planCardPopular: {
    borderColor: '#6C63FF',
    borderWidth: 2,
  },
  popularBadge: {
    backgroundColor: '#6C63FF',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  popularBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  planName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  planDescription: {
    fontSize: 14,
    color: '#8080A0',
    marginBottom: 12,
  },
  planPrice: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  planInterval: {
    fontSize: 16,
    fontWeight: '400',
    color: '#6B6B8A',
  },
  planFeature: {
    fontSize: 14,
    color: '#A0A0C0',
    marginBottom: 4,
  },
  purchaseButton: {
    backgroundColor: '#6C63FF',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  purchaseButtonLoading: {
    opacity: 0.7,
  },
  purchaseButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
  cancelButton: {
    marginTop: 16,
    alignItems: 'center',
    padding: 12,
  },
  cancelButtonText: {
    color: '#FF4466',
    fontSize: 14,
  },
});
