import { useQuery } from '@apollo/client/react';
import { DISCIPLINE_LABELS, RACE_TYPE_LABELS } from '@race-planner/shared';
import { Stack, useLocalSearchParams } from 'expo-router';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { ErrorView, LoadingView } from '@/components/state-view';
import { colors } from '@/constants/theme';
import { RACE_PLAN_QUERY } from '@/graphql/race-plans';
import { formatDuration } from '@/lib/format';

export default function PlanScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, loading, error, refetch } = useQuery(RACE_PLAN_QUERY, { variables: { id } });

  if (loading && !data) return <LoadingView />;
  if (error || !data) {
    return (
      <ErrorView message={error?.message ?? 'Plan not found'} onRetry={() => void refetch()} />
    );
  }

  const plan = data.racePlan;
  const totalCarbs = plan.segments.reduce((sum, s) => sum + (s.carbsG ?? 0), 0);
  const totalFluid = plan.segments.reduce((sum, s) => sum + (s.fluidMl ?? 0), 0);

  return (
    <>
      <Stack.Screen options={{ title: plan.name }} />
      <FlatList
        contentContainerStyle={styles.list}
        data={plan.segments}
        keyExtractor={(s) => s.id}
        ListHeaderComponent={
          <View style={styles.summary}>
            <Text style={styles.summaryTitle}>{RACE_TYPE_LABELS[plan.raceType]}</Text>
            <View style={styles.statsRow}>
              {plan.targetFinishTimeS != null && (
                <Stat label="Target" value={formatDuration(plan.targetFinishTimeS)} />
              )}
              {plan.expectedTempC != null && (
                <Stat label="Temp." value={`${plan.expectedTempC} °C`} />
              )}
              <Stat label="Carbs" value={`${totalCarbs} g`} />
              <Stat label="Fluid" value={`${(totalFluid / 1000).toFixed(1)} L`} />
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.segment}>
            <View style={styles.segmentHeader}>
              <Text style={styles.segmentKm}>
                km {item.startKm} – {item.endKm}
              </Text>
              <Text style={styles.segmentDiscipline}>{DISCIPLINE_LABELS[item.discipline]}</Text>
            </View>
            <Text style={styles.segmentTarget}>
              {item.targetPaceLabel ?? (item.targetPowerW ? `${item.targetPowerW} W` : '—')}
            </Text>
            {item.carbsG || item.fluidMl ? (
              <Text style={styles.segmentFuel}>
                {item.carbsG ? `${item.carbsG} g carbs` : ''}
                {item.carbsG && item.fluidMl ? ' · ' : ''}
                {item.fluidMl ? `${item.fluidMl} ml` : ''}
              </Text>
            ) : null}
            {item.notes && <Text style={styles.segmentNotes}>{item.notes}</Text>}
          </View>
        )}
      />
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  list: { padding: 16, gap: 10 },
  summary: {
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 6,
  },
  summaryTitle: { fontSize: 15, color: colors.muted, marginBottom: 12 },
  statsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 20 },
  stat: { minWidth: 64 },
  statValue: { fontSize: 18, fontWeight: '700', color: colors.text },
  statLabel: { fontSize: 12, color: colors.muted },
  segment: {
    backgroundColor: colors.card,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
  },
  segmentHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  segmentKm: { fontSize: 14, fontWeight: '600', color: colors.text },
  segmentDiscipline: { fontSize: 12, color: colors.muted },
  segmentTarget: { fontSize: 22, fontWeight: '700', color: colors.primary },
  segmentFuel: { fontSize: 13, color: colors.text, marginTop: 4 },
  segmentNotes: { fontSize: 13, color: colors.muted, fontStyle: 'italic', marginTop: 6 },
});
