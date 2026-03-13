import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { STORAGE_KEY_PREFIX } from 'lib/workoutStorage';
import { TOTAL_EXERCISES } from 'components/WorkoutScreen';

type DaySummary = {
  dateKey: string;
  date: Date;
  completedExercises: number;
  percent: number;
};

const parseDateKey = (key: string): Date | null => {
  const datePart = key.replace(STORAGE_KEY_PREFIX, '');
  const d = new Date(datePart);
  return Number.isNaN(d.getTime()) ? null : d;
};

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const daysBetween = (a: Date, b: Date) => {
  const msPerDay = 24 * 60 * 60 * 1000;
  const start = new Date(a.getFullYear(), a.getMonth(), a.getDate()).getTime();
  const end = new Date(b.getFullYear(), b.getMonth(), b.getDate()).getTime();
  return Math.round((end - start) / msPerDay);
};

const computeStreaks = (days: DaySummary[]) => {
  if (days.length === 0) {
    return { currentStreak: 0, bestStreak: 0 };
  }

  const sorted = [...days].sort((a, b) => a.date.getTime() - b.date.getTime());
  let best = 1;
  let current = 1;

  for (let i = 1; i < sorted.length; i++) {
    const diff = daysBetween(sorted[i - 1].date, sorted[i].date);
    if (diff === 1) {
      current += 1;
    } else if (diff > 1) {
      best = Math.max(best, current);
      current = 1;
    }
  }
  best = Math.max(best, current);

  // Adjust current streak: only count from the most recent day up to today with no gaps
  const today = new Date();
  const latest = sorted[sorted.length - 1];
  const gapFromToday = daysBetween(latest.date, today);

  let adjustedCurrent = current;
  if (gapFromToday > 1) {
    adjustedCurrent = 0;
  } else if (gapFromToday === 1 && !isSameDay(latest.date, today)) {
    // you worked out yesterday but not yet today
    adjustedCurrent = current;
  }

  return { currentStreak: adjustedCurrent, bestStreak: best };
};

export const ProgressScreen: React.FC = () => {
  const [days, setDays] = useState<DaySummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const keys = await AsyncStorage.getAllKeys();
        const workoutKeys = keys.filter((k) => k.startsWith(STORAGE_KEY_PREFIX));

        if (workoutKeys.length === 0) {
          setDays([]);
          return;
        }

        const values = await AsyncStorage.multiGet(workoutKeys);

        const summaries: DaySummary[] = [];

        for (const [key, value] of values) {
          if (!value) continue;
          const date = parseDateKey(key);
          if (!date) continue;

          try {
            const parsed: string[] = JSON.parse(value);
            const completedExercises = parsed.length;
            const percent =
              TOTAL_EXERCISES === 0
                ? 0
                : Math.round((completedExercises / TOTAL_EXERCISES) * 100);

            summaries.push({
              dateKey: key,
              date,
              completedExercises,
              percent,
            });
          } catch {
            // ignore bad entries
          }
        }

        summaries.sort((a, b) => b.date.getTime() - a.date.getTime());
        setDays(summaries);
      } finally {
        setIsLoading(false);
      }
    };

    void load();
  }, []);

  const { currentStreak, bestStreak } = useMemo(() => computeStreaks(days), [days]);

  const last14 = useMemo(() => {
    const today = new Date();
    const list: { date: Date; didWorkout: boolean }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() - i
      );
      const didWorkout = days.some((day) => isSameDay(day.date, d) && day.completedExercises > 0);
      list.push({ date: d, didWorkout });
    }
    return list;
  }, [days]);

  const totalActiveDays = days.filter((d) => d.completedExercises > 0).length;

  return (
    <SafeAreaView className="flex-1 bg-slate-950">
      <View className="px-5 pb-4">
        <Text className="text-slate-100 text-3xl font-extrabold tracking-tight">
          Progress
        </Text>
        <Text className="text-slate-400 mt-1 text-sm">
          See how consistent you&apos;ve been.
        </Text>
        <Text className="text-slate-500 mt-1 text-xs">
          Every check-in here is one more step toward your goal.
        </Text>

        <View className="mt-4 flex-row gap-3">
          <View className="flex-1 rounded-2xl bg-slate-900/80 p-4 border border-slate-800">
            <Text className="text-slate-400 text-xs mb-1">Current streak</Text>
            <Text className="text-emerald-400 text-2xl font-extrabold">
              {currentStreak}
            </Text>
            <Text className="text-slate-500 text-xs mt-1">days in a row</Text>
          </View>
          <View className="flex-1 rounded-2xl bg-slate-900/80 p-4 border border-slate-800">
            <Text className="text-slate-400 text-xs mb-1">Best streak</Text>
            <Text className="text-cyan-400 text-2xl font-extrabold">
              {bestStreak}
            </Text>
            <Text className="text-slate-500 text-xs mt-1">all-time best</Text>
          </View>
        </View>

        <View className="mt-4 rounded-2xl bg-slate-900/80 p-4 border border-slate-800">
          <Text className="text-slate-100 font-semibold text-sm mb-3">
            Last 14 days
          </Text>
          <View className="flex-row justify-between">
            {last14.map(({ date, didWorkout }) => {
              const label = date.toLocaleDateString(undefined, { weekday: 'short' }).slice(0, 1);
              const dayOfMonth = date.getDate();
              return (
                <View
                  key={date.toISOString()}
                  className="items-center"
                >
                  <Text className="text-[10px] text-slate-500 mb-1">{label}</Text>
                  <View
                    className={`w-6 h-6 rounded-full items-center justify-center ${
                      didWorkout ? 'bg-emerald-500/80' : 'bg-slate-800'
                    }`}
                  >
                    <Text
                      className={`text-[10px] font-semibold ${
                        didWorkout ? 'text-slate-950' : 'text-slate-500'
                      }`}
                    >
                      {dayOfMonth}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="pb-10 px-5"
        showsVerticalScrollIndicator={false}
      >
        <View className="mt-4 rounded-2xl bg-slate-900/80 border border-slate-800">
          <View className="flex-row items-center justify-between px-4 py-3 border-b border-slate-800">
            <Text className="text-slate-100 font-semibold text-sm">
              Daily breakdown
            </Text>
            <Text className="text-slate-500 text-xs">
              {totalActiveDays} active day{totalActiveDays === 1 ? '' : 's'}
            </Text>
          </View>

          {isLoading ? (
            <View className="py-6 items-center">
              <Text className="text-slate-400 text-sm">Loading history…</Text>
            </View>
          ) : days.length === 0 ? (
            <View className="py-6 items-center px-6">
              <Text className="text-slate-400 text-sm text-center">
                Once you start checking off workouts, your daily history and streaks
                will appear here.
              </Text>
            </View>
          ) : (
            days.map((day) => (
              <View
                key={day.dateKey}
                className="flex-row items-center justify-between px-4 py-3 border-t border-slate-800"
              >
                <View>
                  <Text className="text-slate-100 text-sm">
                    {day.date.toLocaleDateString(undefined, {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </Text>
                  <Text className="text-slate-500 text-xs">
                    {day.completedExercises}/{TOTAL_EXERCISES} exercises
                  </Text>
                </View>
                <View className="items-end">
                  <Text
                    className={`text-sm font-semibold ${
                      day.percent >= 80
                        ? 'text-emerald-400'
                        : day.percent >= 40
                        ? 'text-amber-300'
                        : 'text-slate-400'
                    }`}
                  >
                    {day.percent}%
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

