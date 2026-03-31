/**
 * DashboardScreen — the main app screen shown after authentication.
 *
 * Premium content is gated behind subscription status.
 */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';

interface DashboardScreenProps {
  isSubscribed: boolean;
  userId: string;
  onUpgrade: () => void;
  onBack: () => void;
}

interface StatCard {
  label: string;
  value: string;
  proOnly: boolean;
}

const STATS: StatCard[] = [
  { label: 'Projects', value: '3', proOnly: false },
  { label: 'Tasks Completed', value: '127', proOnly: false },
  { label: 'Team Members', value: '12', proOnly: true },
  { label: 'API Calls', value: '14,822', proOnly: true },
  { label: 'Storage Used', value: '2.4 GB', proOnly: true },
  { label: 'Monthly Revenue', value: '$3,240', proOnly: true },
];

export function DashboardScreen({
  isSubscribed,
  userId,
  onUpgrade,
  onBack,
}: DashboardScreenProps): React.JSX.Element {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <Text style={styles.backButtonText}>← Home</Text>
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={styles.greeting}>Dashboard</Text>
        <View style={[styles.tierBadge, isSubscribed ? styles.tierBadgePro : styles.tierBadgeFree]}>
          <Text style={styles.tierBadgeText}>{isSubscribed ? 'PRO' : 'FREE'}</Text>
        </View>
      </View>

      <Text style={styles.userId}>User: {userId.slice(0, 12)}...</Text>

      <View style={styles.statsGrid}>
        {STATS.map((stat) => (
          <View
            key={stat.label}
            style={[
              styles.statCard,
              stat.proOnly && !isSubscribed ? styles.statCardLocked : null,
            ]}
          >
            <Text style={styles.statValue}>
              {stat.proOnly && !isSubscribed ? '🔒' : stat.value}
            </Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      {!isSubscribed && (
        <View style={styles.upgradePrompt}>
          <Text style={styles.upgradeTitle}>Unlock 4 more metrics</Text>
          <Text style={styles.upgradeSubtitle}>
            Upgrade to Pro to see team, API usage, storage, and revenue data.
          </Text>
          <TouchableOpacity style={styles.upgradeButton} onPress={onUpgrade}>
            <Text style={styles.upgradeButtonText}>Upgrade to Pro →</Text>
          </TouchableOpacity>
        </View>
      )}

      {isSubscribed && (
        <View style={styles.proFeatures}>
          <Text style={styles.proFeaturesTitle}>Pro Features</Text>
          {['Advanced reports', 'CSV export', 'Webhooks', 'API access'].map((f) => (
            <Text key={f} style={styles.proFeatureItem}>
              ✓ {f}
            </Text>
          ))}
        </View>
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
    marginBottom: 16,
  },
  backButtonText: {
    color: '#6C63FF',
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  tierBadge: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  tierBadgePro: {
    backgroundColor: '#6C63FF',
  },
  tierBadgeFree: {
    backgroundColor: '#2A2A4A',
  },
  tierBadgeText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
    letterSpacing: 1,
  },
  userId: {
    fontSize: 12,
    color: '#4A4A6A',
    marginBottom: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    width: '47%',
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2A2A4A',
  },
  statCardLocked: {
    opacity: 0.4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B6B8A',
  },
  upgradePrompt: {
    backgroundColor: '#1A1A2E',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#6C63FF',
    marginBottom: 24,
  },
  upgradeTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  upgradeSubtitle: {
    fontSize: 14,
    color: '#8080A0',
    marginBottom: 16,
  },
  upgradeButton: {
    backgroundColor: '#6C63FF',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  upgradeButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  proFeatures: {
    backgroundColor: '#1A1A2E',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#2A2A4A',
  },
  proFeaturesTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  proFeatureItem: {
    fontSize: 14,
    color: '#A0C0A0',
    marginBottom: 6,
  },
});
