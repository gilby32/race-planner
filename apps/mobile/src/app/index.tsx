import { useQuery } from '@apollo/client/react';
import { RACE_TYPE_LABELS } from '@race-planner/shared';
import { Link } from 'expo-router';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { ErrorView, LoadingView } from '@/components/state-view';
import { colors } from '@/constants/theme';
import { HOME_QUERY } from '@/graphql/race-plans';
import { API_URL } from '@/lib/apollo';
import { formatDate, formatDuration } from '@/lib/format';

export default function HomeScreen() {
  const { data, loading, error, refetch } = useQuery(HOME_QUERY);

  if (loading && !data) return <LoadingView />;
  if (error)
    return <ErrorView message={`${error.message}\n(${API_URL})`} onRetry={() => void refetch()} />;

  const plans = data?.racePlans ?? [];
  const dbOk = data?.health.database ?? false;

  return (
    <FlatList
      contentContainerStyle={styles.list}
      data={plans}
      keyExtractor={(plan) => plan.id}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={() => void refetch()} />}
      ListHeaderComponent={
        <View style={styles.status}>
          <View style={[styles.dot, { backgroundColor: dbOk ? colors.success : colors.danger }]} />
          <Text style={styles.statusText}>
            {dbOk ? 'Connected to the backend' : 'Backend has no database'}
          </Text>
        </View>
      }
      ListEmptyComponent={
        <Text style={styles.empty}>No plans yet. Run the backend seed to create a sample one.</Text>
      }
      renderItem={({ item }) => (
        <Link href={{ pathname: '/plan/[id]', params: { id: item.id } }} asChild>
          <Pressable style={styles.card}>
            <Text style={styles.cardTitle}>{item.name}</Text>
            <Text style={styles.cardMeta}>
              {RACE_TYPE_LABELS[item.raceType]}
              {item.raceDate ? ` · ${formatDate(item.raceDate)}` : ''}
            </Text>
            {item.targetFinishTimeS != null && (
              <Text style={styles.cardMeta}>Target: {formatDuration(item.targetFinishTimeS)}</Text>
            )}
          </Pressable>
        </Link>
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: 16, gap: 12 },
  status: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  statusText: { fontSize: 13, color: colors.muted },
  empty: { textAlign: 'center', color: colors.muted, marginTop: 32 },
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
  },
  cardTitle: { fontSize: 17, fontWeight: '600', color: colors.text, marginBottom: 4 },
  cardMeta: { fontSize: 14, color: colors.muted },
});
