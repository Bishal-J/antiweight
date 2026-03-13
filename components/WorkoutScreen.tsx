import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, Text, View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BASE_EXERCISE_OVERRIDES_KEY, CUSTOM_EXERCISES_KEY, getTodayKey } from 'lib/workoutStorage';
import {
  BASE_EXERCISES,
  BASE_TOTAL_EXERCISES,
  WORKOUT_SECTIONS,
  WorkoutExercise,
  WorkoutSection,
} from 'config/workoutData';
import { TimerModal } from 'components/TimerModal';

type SectionWithExercises = WorkoutSection & {
  exercises: WorkoutExercise[];
};

export const WorkoutScreen: React.FC = () => {
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [sections, setSections] = useState<SectionWithExercises[]>([]);

  const allExerciseIds = useMemo(
    () => sections.flatMap((section) => section.exercises.map((ex) => ex.id)),
    [sections]
  );

  const totalExercises = allExerciseIds.length || BASE_TOTAL_EXERCISES;
  const completedCount = completedIds.size;
  const progress = totalExercises === 0 ? 0 : Math.round((completedCount / totalExercises) * 100);

  const [timerExercise, setTimerExercise] = useState<WorkoutExercise | null>(null);
  const [timerInitial, setTimerInitial] = useState(0);
  const [timerRemaining, setTimerRemaining] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerCompleted, setTimerCompleted] = useState(false);

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
    const load = async () => {
      await loadProgress();

      try {
        const [storedCustom, storedOverrides] = await Promise.all([
          AsyncStorage.getItem(CUSTOM_EXERCISES_KEY),
          AsyncStorage.getItem(BASE_EXERCISE_OVERRIDES_KEY),
        ]);

        let custom: WorkoutExercise[] = [];
        if (storedCustom) {
          const parsed: WorkoutExercise[] = JSON.parse(storedCustom);
          if (Array.isArray(parsed)) {
            custom = parsed;
          }
        }

        let overridesById = new Map<
          string,
          { name?: string; details?: string; timerSeconds?: number; deleted?: boolean }
        >();
        if (storedOverrides) {
          const parsed: any[] = JSON.parse(storedOverrides);
          if (Array.isArray(parsed)) {
            parsed.forEach((ov) => {
              if (ov && typeof ov.id === 'string') {
                overridesById.set(ov.id, {
                  name: ov.name,
                  details: ov.details,
                  timerSeconds: ov.timerSeconds,
                  deleted: ov.deleted,
                });
              }
            });
          }
        }

        const bySection: Record<string, WorkoutExercise[]> = {};

        // base exercises with overrides
        for (const base of BASE_EXERCISES) {
          const ov = overridesById.get(base.id);
          if (ov?.deleted) continue;
          const effective: WorkoutExercise = {
            ...base,
            ...(ov?.name ? { name: ov.name } : null),
            ...(ov?.details ? { details: ov.details } : null),
            ...(ov?.timerSeconds !== undefined ? { timerSeconds: ov.timerSeconds } : null),
          };
          if (!bySection[effective.sectionId]) bySection[effective.sectionId] = [];
          bySection[effective.sectionId].push(effective);
        }

        // custom exercises
        for (const ex of custom) {
          if (!bySection[ex.sectionId]) bySection[ex.sectionId] = [];
          bySection[ex.sectionId].push(ex);
        }

        const nextSections: SectionWithExercises[] = WORKOUT_SECTIONS.map((section) => ({
          ...section,
          exercises: bySection[section.id] ?? [],
        }));

        setSections(nextSections);
      } catch {
        // ignore
      }
    };

    void load();
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

  const handleTimerStartPause = () => {
    if (!timerExercise) return;
    if (timerRunning) {
      setTimerRunning(false);
    } else {
      if (timerRemaining <= 0) {
        setTimerRemaining(timerInitial || 0);
        setTimerCompleted(false);
      }
      setTimerRunning(true);
    }
  };

  const handleTimerReset = () => {
    setTimerRemaining(timerInitial);
    setTimerRunning(false);
    setTimerCompleted(false);
  };

  const openTimerForExercise = (exercise: WorkoutExercise) => {
    if (!exercise.timerSeconds) return;
    const initial = exercise.timerSeconds;
    setTimerExercise(exercise);
    setTimerInitial(initial);
    setTimerRemaining(initial);
    setTimerRunning(false);
    setTimerCompleted(false);
  };

  const closeTimer = () => {
    setTimerExercise(null);
    setTimerRunning(false);
    setTimerCompleted(false);
  };

  useEffect(() => {
    if (!timerRunning || !timerExercise) return;
    const id = setInterval(() => {
      setTimerRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(id);
          setTimerRunning(false);
          setTimerCompleted(true);
          setCompletedIds((prevCompleted) => {
            const next = new Set(prevCompleted);
            next.add(timerExercise.id);
            void saveProgress(next);
            return next;
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [timerRunning, timerExercise, saveProgress]);

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
              className="h-full rounded-full bg-emerald-400"
              style={{
                width: `${Math.max(0, Math.min(100, progress))}%`,
              }}
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
          sections.map((section) => (
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
                    onLongPress={() => openTimerForExercise(exercise)}
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

        <View className="mt-2 items-center">
          <Text className="text-[10px] text-slate-600">
            Built just for you. Stay consistent.
          </Text>
        </View>
      </ScrollView>

      {timerExercise && (
        <TimerModal
          exercise={timerExercise}
          initialSeconds={timerInitial}
          remainingSeconds={timerRemaining}
          running={timerRunning}
          completed={timerCompleted}
          onClose={closeTimer}
          onStartPause={handleTimerStartPause}
          onReset={handleTimerReset}
        />
      )}
    </SafeAreaView>
  );
};

