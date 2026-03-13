import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, Text, View, Pressable } from 'react-native';

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
    title: 'Warm-up (5–7 min)',
    emoji: '🔥',
    exercises: [
      { id: 'warmup_jumping_jacks', name: 'Jumping Jacks', details: '50 reps' },
      { id: 'warmup_squats', name: 'Bodyweight Squats', details: '20 reps' },
      { id: 'warmup_pushups', name: 'Push-ups', details: '15 reps' },
      { id: 'warmup_high_knees', name: 'High Knees', details: '30 sec' },
      { id: 'warmup_arm_circles', name: 'Arm Circles', details: '30 sec' },
    ],
  },
  {
    id: 'push',
    title: 'Push (Chest + Triceps)',
    emoji: '🏋️',
    exercises: [
      { id: 'push_pushups', name: 'Push-ups', details: '4 × 20' },
      { id: 'push_decline', name: 'Decline Push-ups', details: '3 × 15 (feet on chair)' },
      { id: 'push_diamond', name: 'Diamond Push-ups', details: '3 × 12' },
    ],
  },
  {
    id: 'pull',
    title: 'Pull (Back + Arms)',
    emoji: '🏋️',
    subtitle: 'If you have a bar, otherwise do floor alternatives',
    exercises: [
      { id: 'pull_pullups', name: 'Pull-ups / Doorframe Rows', details: '4 × max' },
      { id: 'pull_superman', name: 'Superman Hold', details: '3 × 40 sec' },
      { id: 'pull_backpack_rows', name: 'Backpack Rows', details: '3 × 15' },
    ],
  },
  {
    id: 'legs',
    title: 'Legs',
    emoji: '🦵',
    exercises: [
      { id: 'legs_squats', name: 'Squats', details: '4 × 25' },
      { id: 'legs_lunges', name: 'Lunges', details: '3 × 20 each leg' },
      { id: 'legs_bulgarian', name: 'Bulgarian Split Squats', details: '3 × 12 each leg' },
    ],
  },
  {
    id: 'cardio',
    title: 'Cardio Replacement',
    emoji: '🔥',
    subtitle: 'High calorie burn instead of long walks',
    exercises: [
      { id: 'cardio_wall_sit', name: 'Wall Sit', details: '3 × 1 min' },
      { id: 'cardio_jump_squats', name: 'Jump Squats', details: '3 × 20' },
      { id: 'cardio_mountain_climbers', name: 'Mountain Climbers', details: '3 × 40 sec' },
      { id: 'cardio_burpees', name: 'Burpees', details: '3 × 12' },
    ],
  },
  {
    id: 'core',
    title: 'Core',
    emoji: '🧠',
    exercises: [
      { id: 'core_plank', name: 'Plank', details: '3 × 1 min' },
      { id: 'core_leg_raises', name: 'Leg Raises', details: '3 × 20' },
      { id: 'core_russian_twists', name: 'Russian Twists', details: '3 × 30' },
    ],
  },
  {
    id: 'finisher',
    title: 'Finisher (Extreme Fat Burner)',
    emoji: '💀',
    subtitle: 'Do once at the end. Break into sets if needed.',
    exercises: [
      { id: 'finisher_pushups', name: 'Push-ups', details: '100 total' },
      { id: 'finisher_squats', name: 'Squats', details: '100 total' },
      { id: 'finisher_situps', name: 'Sit-ups', details: '100 total' },
    ],
  },
];

const STORAGE_KEY_PREFIX = 'daily_workout_progress_';

const getTodayKey = () => {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  return `${STORAGE_KEY_PREFIX}${yyyy}-${mm}-${dd}`;
};

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
    <View className="flex-1 bg-slate-950">
      <View className="px-5 pt-12 pb-4">
        <Text className="text-slate-100 text-3xl font-extrabold tracking-tight">
          AntiWeight
        </Text>
        <Text className="text-slate-400 mt-1 text-sm">{todayLabel}</Text>

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
    </View>
  );
};

