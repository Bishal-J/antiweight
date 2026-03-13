import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, Text, View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getTodayKey, STORAGE_KEY_PREFIX } from 'lib/workoutStorage';

type Exercise = {
  id: string;
  name: string;
  details: string;
};

type Section = {
  id: string;
  title: string;
  emoji: string;
  subtitle?: string;
  exercises: Exercise[];
};

const WORKOUT_SECTIONS: Section[] = [
  {
    id: 'warmup',
    title: 'Warm-Up (5–8 min)',
    emoji: '🔥',
    exercises: [
      { id: 'warmup_jumping_jacks', name: 'Jumping Jacks', details: '60 reps' },
      { id: 'warmup_squats', name: 'Squats', details: '20 reps' },
      { id: 'warmup_pushups', name: 'Push-ups', details: '15 reps' },
      { id: 'warmup_high_knees', name: 'High Knees', details: '30 sec' },
      { id: 'warmup_arm_circles', name: 'Arm Circles', details: '30 sec' },
      { id: 'warmup_lunges', name: 'Lunges', details: '20 reps' },
    ],
  },
  {
    id: 'push',
    title: 'Push (Chest + Shoulders + Triceps)',
    emoji: '🏋️',
    exercises: [
      { id: 'push_pushups', name: 'Push-ups', details: '4 × 20' },
      {
        id: 'push_decline',
        name: 'Decline Push-ups',
        details: '3 × 15 (feet on bed/chair)',
      },
      { id: 'push_diamond', name: 'Diamond Push-ups', details: '3 × 12' },
      { id: 'push_pike', name: 'Pike Push-ups (shoulders)', details: '3 × 12' },
    ],
  },
  {
    id: 'legs',
    title: 'Legs',
    emoji: '🦵',
    exercises: [
      { id: 'legs_squats', name: 'Bodyweight Squats', details: '4 × 25' },
      { id: 'legs_walking_lunges', name: 'Walking Lunges', details: '3 × 20 each leg' },
      { id: 'legs_jump_squats', name: 'Jump Squats', details: '3 × 15' },
      { id: 'legs_wall_sit', name: 'Wall Sit', details: '3 × 60 sec' },
    ],
  },
  {
    id: 'core',
    title: 'Core',
    emoji: '🧠',
    exercises: [
      { id: 'core_plank', name: 'Plank', details: '3 × 60 sec' },
      { id: 'core_leg_raises', name: 'Leg Raises', details: '3 × 20' },
      { id: 'core_russian_twists', name: 'Russian Twists', details: '3 × 30' },
      { id: 'core_flutter_kicks', name: 'Flutter Kicks', details: '3 × 40' },
    ],
  },
  {
    id: 'skill',
    title: 'Calisthenics Skill (Strength + Balance)',
    emoji: '🤸',
    subtitle: 'Handstand practice. If hard → do pike push-ups.',
    exercises: [
      {
        id: 'skill_wall_handstand',
        name: 'Wall Handstand Hold',
        details: '3 × 30–45 sec',
      },
      {
        id: 'skill_handstand_pushup_practice',
        name: 'Handstand Push-up Practice',
        details: '3 × 5–8',
      },
    ],
  },
  {
    id: 'fatburn',
    title: 'Fat Burning (instead of walking)',
    emoji: '⚡',
    exercises: [
      { id: 'fatburn_mountain_climbers', name: 'Mountain Climbers', details: '3 × 45 sec' },
      { id: 'fatburn_burpees', name: 'Burpees', details: '3 × 12' },
      { id: 'fatburn_high_knees', name: 'High Knees', details: '3 × 40 sec' },
    ],
  },
  {
    id: 'finisher',
    title: 'Extreme Finisher',
    emoji: '💀',
    subtitle: 'Complete before ending workout. Break into sets if needed.',
    exercises: [
      { id: 'finisher_squats', name: 'Squats', details: '100 total' },
      { id: 'finisher_pushups', name: 'Push-ups', details: '100 total' },
      { id: 'finisher_situps', name: 'Sit-ups', details: '100 total' },
    ],
  },
];

export const TOTAL_EXERCISES = WORKOUT_SECTIONS.reduce(
  (total, section) => total + section.exercises.length,
  0
);

export const WorkoutScreen: React.FC = () => {
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  const allExerciseIds = useMemo(
    () => WORKOUT_SECTIONS.flatMap((section) => section.exercises.map((ex) => ex.id)),
    []
  );

  const totalExercises = allExerciseIds.length;
  const completedCount = completedIds.size;
  const progress = totalExercises === 0 ? 0 : Math.round((completedCount / totalExercises) * 100);

  const loadProgress = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(getTodayKey());
      if (stored) {
        const parsed: string[] = JSON.parse(stored);
        setCompletedIds(new Set(parsed));
      }
    } catch (e) {
      // ignore loading errors
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveProgress = useCallback(async (ids: Set<string>) => {
    try {
      const arr = Array.from(ids);
      await AsyncStorage.setItem(getTodayKey(), JSON.stringify(arr));
    } catch (e) {
      // ignore save errors
    }
  }, []);

  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  const toggleExercise = (id: string) => {
    setCompletedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      void saveProgress(next);
      return next;
    });
  };

  const resetToday = () => {
    setCompletedIds(new Set());
    void AsyncStorage.removeItem(getTodayKey());
  };

  const todayLabel = useMemo(() => {
    const today = new Date();
    return today.toLocaleDateString(undefined, {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-slate-950">
      <View className="px-5 pb-4">
        <Text className="text-slate-100 text-3xl font-extrabold tracking-tight">
          AntiWeight
        </Text>
        <Text className="text-slate-400 mt-1 text-sm">{todayLabel}</Text>
        <Text className="text-slate-500 mt-1 text-xs">
          Daily full body · No equipment · Stay moving
        </Text>

        <View className="mt-4 rounded-2xl bg-slate-900/80 p-4 border border-slate-800">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-slate-100 font-semibold text-base">Today&apos;s Progress</Text>
            <Text className="text-emerald-400 font-semibold text-sm">
              {completedCount}/{totalExercises} · {progress}%
            </Text>
          </View>
          <View className="h-2 rounded-full bg-slate-800 overflow-hidden">
            <View
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400"
              style={{ width: `${progress}%` }}
            />
          </View>
          <View className="flex-row items-center justify-between mt-3">
            <Text className="text-slate-400 text-xs">
              Tap each exercise when you finish it.
            </Text>
            <Pressable
              onPress={resetToday}
              className="px-3 py-1 rounded-full border border-slate-700"
            >
              <Text className="text-slate-300 text-xs font-medium">Reset day</Text>
            </Pressable>
          </View>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="pb-10 px-5"
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <View className="mt-10 items-center">
            <Text className="text-slate-400 text-sm">Loading your plan…</Text>
          </View>
        ) : (
          WORKOUT_SECTIONS.map((section) => (
            <View
              key={section.id}
              className="mb-5 rounded-2xl bg-slate-900/80 p-4 border border-slate-800"
            >
              <View className="flex-row items-center mb-1">
                <Text className="text-lg mr-2">{section.emoji}</Text>
                <Text className="text-slate-100 font-semibold text-base">
                  {section.title}
                </Text>
              </View>
              {section.subtitle ? (
                <Text className="text-slate-500 text-xs mb-3">{section.subtitle}</Text>
              ) : null}

              {section.exercises.map((exercise) => {
                const checked = completedIds.has(exercise.id);
                return (
                  <Pressable
                    key={exercise.id}
                    onPress={() => toggleExercise(exercise.id)}
                    className="flex-row items-center py-2 px-2 rounded-xl mb-1 bg-slate-900 active:bg-slate-800"
                  >
                    <View
                      className={`w-6 h-6 mr-3 rounded-md border ${
                        checked
                          ? 'border-emerald-400 bg-emerald-500/20'
                          : 'border-slate-600 bg-slate-950'
                      } items-center justify-center`}
                    >
                      {checked ? (
                        <Text className="text-emerald-300 text-sm font-bold">✓</Text>
                      ) : null}
                    </View>
                    <View className="flex-1">
                      <Text
                        className={`text-sm font-medium ${
                          checked ? 'text-slate-300 line-through' : 'text-slate-100'
                        }`}
                      >
                        {exercise.name}
                      </Text>
                      <Text className="text-xs text-slate-500">{exercise.details}</Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          ))
        )}

        <View className="mt-2 mb-6 items-center">
          <Text className="text-[10px] text-slate-600">
            Built just for you. Stay consistent.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

