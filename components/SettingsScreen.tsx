import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, Text, View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BASE_EXERCISE_OVERRIDES_KEY, CUSTOM_EXERCISES_KEY } from 'lib/workoutStorage';
import { BASE_EXERCISES, WORKOUT_SECTIONS, WorkoutExercise, WorkoutSectionId } from 'config/workoutData';
import { NewExerciseForm } from './NewExerciseForm';
import { BaseExerciseItem } from './BaseExerciseItem';


type CustomExercise = WorkoutExercise;

type BaseExerciseOverride = {
  id: string;
  name?: string;
  details?: string;
  timerSeconds?: number;
  deleted?: boolean;
};

export const SettingsScreen: React.FC = () => {
  // --- State ---
  const [selectedSectionId, setSelectedSectionId] = useState<WorkoutSectionId>('warmup');
  const [name, setName] = useState('');
  const [details, setDetails] = useState('');
  const [useTimer, setUseTimer] = useState(false);
  const [timerSecondsInput, setTimerSecondsInput] = useState('');
  const [customExercises, setCustomExercises] = useState<CustomExercise[]>([]);
  const [baseOverrides, setBaseOverrides] = useState<BaseExerciseOverride[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [editingBaseId, setEditingBaseId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editDetails, setEditDetails] = useState('');
  const [editUseTimer, setEditUseTimer] = useState(false);
  const [editTimerSecondsInput, setEditTimerSecondsInput] = useState('');

  // --- Load from AsyncStorage ---
  useEffect(() => {
    const load = async () => {
      try {
        const [storedCustom, storedOverrides] = await Promise.all([
          AsyncStorage.getItem(CUSTOM_EXERCISES_KEY),
          AsyncStorage.getItem(BASE_EXERCISE_OVERRIDES_KEY),
        ]);

        if (storedCustom) {
          const parsed: CustomExercise[] = JSON.parse(storedCustom);
          if (Array.isArray(parsed)) setCustomExercises(parsed);
        }

        if (storedOverrides) {
          const parsed: BaseExerciseOverride[] = JSON.parse(storedOverrides);
          if (Array.isArray(parsed)) setBaseOverrides(parsed);
        }
      } finally {
        setIsLoading(false);
      }
    };
    void load();
  }, []);

  // --- AsyncStorage helpers ---
  const saveCustomExercises = async (next: CustomExercise[]) => {
    setCustomExercises(next);
    await AsyncStorage.setItem(CUSTOM_EXERCISES_KEY, JSON.stringify(next));
  };

  const saveBaseOverrides = async (next: BaseExerciseOverride[]) => {
    setBaseOverrides(next);
    await AsyncStorage.setItem(BASE_EXERCISE_OVERRIDES_KEY, JSON.stringify(next));
  };

  // --- Add custom exercise ---
  const handleAdd = async () => {
    if (!name.trim()) return;
    const trimmedDetails = details.trim();
    const seconds = useTimer ? Number.parseInt(timerSecondsInput || '0', 10) : 0;
    const id = `custom_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const exercise: CustomExercise = {
      id,
      sectionId: selectedSectionId,
      name: name.trim(),
      details: trimmedDetails || (seconds > 0 ? `${seconds}s timer` : 'Custom exercise'),
      timerSeconds: seconds > 0 ? seconds : undefined,
    };
    await saveCustomExercises([...customExercises, exercise]);
    setName('');
    setDetails('');
    setUseTimer(false);
    setTimerSecondsInput('');
  };

  const handleRemove = async (id: string) => {
    await saveCustomExercises(customExercises.filter((ex) => ex.id !== id));
  };

  // --- Base exercise editing ---
  const beginEditBase = (exerciseId: string) => {
    const base = BASE_EXERCISES.find((ex) => ex.id === exerciseId);
    if (!base) return;
    const override = baseOverrides.find((ov) => ov.id === exerciseId);
    setEditingBaseId(exerciseId);
    setEditName(override?.name ?? base.name);
    setEditDetails(override?.details ?? base.details);
    const timerSeconds = override?.timerSeconds ?? base.timerSeconds ?? 0;
    setEditUseTimer(timerSeconds > 0);
    setEditTimerSecondsInput(timerSeconds > 0 ? String(timerSeconds) : '');
  };

  const cancelEditBase = () => {
    setEditingBaseId(null);
    setEditName('');
    setEditDetails('');
    setEditUseTimer(false);
    setEditTimerSecondsInput('');
  };

  const saveEditBase = async () => {
    if (!editingBaseId) return;
    const base = BASE_EXERCISES.find((ex) => ex.id === editingBaseId);
    if (!base) return;

    const trimmedName = editName.trim() || base.name;
    const trimmedDetails = editDetails.trim() || base.details;
    const seconds =
      editUseTimer && editTimerSecondsInput ? Number.parseInt(editTimerSecondsInput, 10) || 0 : 0;

    const existingIndex = baseOverrides.findIndex((ov) => ov.id === editingBaseId);
    const next = [...baseOverrides];

    const override: BaseExerciseOverride = {
      id: editingBaseId,
      name: trimmedName !== base.name ? trimmedName : undefined,
      details: trimmedDetails !== base.details ? trimmedDetails : undefined,
      timerSeconds: seconds > 0 && seconds !== (base.timerSeconds ?? 0) ? seconds : undefined,
      deleted: next[existingIndex]?.deleted,
    };

    if (!override.name && !override.details && override.timerSeconds === undefined) {
      if (existingIndex !== -1) next.splice(existingIndex, 1);
    } else if (existingIndex !== -1) {
      next[existingIndex] = override;
    } else {
      next.push(override);
    }

    await saveBaseOverrides(next);
    cancelEditBase();
  };

  const toggleHideBase = async (exerciseId: string) => {
    const existingIndex = baseOverrides.findIndex((ov) => ov.id === exerciseId);
    const base = BASE_EXERCISES.find((ex) => ex.id === exerciseId);
    if (!base) return;
    const next = [...baseOverrides];
    const current = existingIndex !== -1 ? next[existingIndex] : { id: exerciseId };
    const deleted = !current.deleted;
    const updated: BaseExerciseOverride = { ...current, deleted };
    if (!updated.name && !updated.details && updated.timerSeconds === undefined && !deleted) {
      if (existingIndex !== -1) next.splice(existingIndex, 1);
    } else if (existingIndex !== -1) {
      next[existingIndex] = updated;
    } else {
      next.push(updated);
    }
    await saveBaseOverrides(next);
  };

  // --- Memoized data ---
  const groupedCustom = useMemo(() => {
    const bySection: Record<string, CustomExercise[]> = {};
    for (const ex of customExercises) {
      if (!bySection[ex.sectionId]) bySection[ex.sectionId] = [];
      bySection[ex.sectionId].push(ex);
    }
    return bySection;
  }, [customExercises]);

  const totalBaseBySection = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const ex of BASE_EXERCISES) counts[ex.sectionId] = (counts[ex.sectionId] ?? 0) + 1;
    return counts;
  }, []);

  const overridesById = useMemo(() => {
    const map: Record<string, BaseExerciseOverride> = {};
    for (const ov of baseOverrides) map[ov.id] = ov;
    return map;
  }, [baseOverrides]);

  // --- Render ---
  return (
    <SafeAreaView className="flex-1 bg-slate-950">
      {/* Header */}
      <View className="px-5 pb-4">
        <Text className="text-slate-100 text-3xl font-extrabold tracking-tight">Settings</Text>
        <Text className="text-slate-400 mt-1 text-sm">Customize your plan with your own exercises.</Text>
        <Text className="text-slate-500 mt-1 text-xs">
          New exercises will show up in the main workout under the section you choose.
        </Text>
      </View>

      <ScrollView className="flex-1" contentContainerClassName="pb-10 px-5" showsVerticalScrollIndicator={false}>
        {/* Add new exercise */}
        <NewExerciseForm
          name={name}
          setName={setName}
          details={details}
          setDetails={setDetails}
          useTimer={useTimer}
          setUseTimer={setUseTimer}
          timerInput={timerSecondsInput}
          setTimerInput={setTimerSecondsInput}
          selectedSection={selectedSectionId}
          setSelectedSection={setSelectedSectionId}
          onAdd={handleAdd}
        />

        {/* Your exercises */}
        <View className="rounded-2xl bg-slate-900/80 border border-slate-800">
          <View className="px-4 py-3 border-b border-slate-800">
            <Text className="text-slate-100 font-semibold text-sm">Your exercises</Text>
            <Text className="text-slate-500 text-xs mt-1">Edit the built-in plan or add your own exercises.</Text>
          </View>

          {isLoading ? (
            <View className="py-6 items-center">
              <Text className="text-slate-400 text-sm">Loading settings…</Text>
            </View>
          ) : (
            WORKOUT_SECTIONS.map((section) => {
              const list = groupedCustom[section.id] ?? [];
              const baseCount = totalBaseBySection[section.id] ?? 0;
              if (baseCount === 0 && list.length === 0) return null;

              return (
                <View key={section.id} className="border-t border-slate-800">
                  <View className="px-4 py-3 flex-row items-center justify-between">
                    <View>
                      <Text className="text-slate-100 text-sm">{section.emoji} {section.title}</Text>
                      <Text className="text-slate-500 text-xs">{baseCount} base · {list.length} custom</Text>
                    </View>
                  </View>

                  {/* Base exercises */}
                  {BASE_EXERCISES.filter((ex) => ex.sectionId === section.id).map((ex) => (
                    <BaseExerciseItem
                      key={ex.id}
                      exercise={ex}
                      override={overridesById[ex.id]}
                      isEditing={editingBaseId === ex.id}
                      editingState={{
                        name: editName,
                        setName: setEditName,
                        details: editDetails,
                        setDetails: setEditDetails,
                        useTimer: editUseTimer,
                        setUseTimer: setEditUseTimer,
                        timerInput: editTimerSecondsInput,
                        setTimerInput: setEditTimerSecondsInput,
                      }}
                      beginEdit={() => beginEditBase(ex.id)}
                      cancelEdit={cancelEditBase}
                      saveEdit={saveEditBase}
                      toggleHide={() => void toggleHideBase(ex.id)}
                    />
                  ))}

                  {/* Custom exercises */}
                  {list.map((ex) => (
                    <View key={ex.id} className="flex-row items-center justify-between px-4 py-3 border-t border-slate-900">
                      <View className="flex-1 pr-3">
                        <Text className="text-slate-100 text-sm">{ex.name}</Text>
                        <Text className="text-slate-500 text-xs mt-0.5">{ex.details}</Text>
                      </View>
                      <Pressable onPress={() => void handleRemove(ex.id)} className="px-2 py-1 rounded-full border border-slate-700">
                        <Text className="text-[11px] text-slate-400">Remove</Text>
                      </Pressable>
                    </View>
                  ))}
                </View>
              );
            })
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};