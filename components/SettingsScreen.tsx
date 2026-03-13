import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, Text, TextInput, View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CUSTOM_EXERCISES_KEY } from 'lib/workoutStorage';
import { BASE_EXERCISES, WORKOUT_SECTIONS, WorkoutExercise, WorkoutSectionId } from 'config/workoutData';

type CustomExercise = WorkoutExercise;

export const SettingsScreen: React.FC = () => {
  const [selectedSectionId, setSelectedSectionId] = useState<WorkoutSectionId>('warmup');
  const [name, setName] = useState('');
  const [details, setDetails] = useState('');
  const [useTimer, setUseTimer] = useState(false);
  const [timerSecondsInput, setTimerSecondsInput] = useState('');
  const [customExercises, setCustomExercises] = useState<CustomExercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const stored = await AsyncStorage.getItem(CUSTOM_EXERCISES_KEY);
        if (stored) {
          const parsed: CustomExercise[] = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            setCustomExercises(parsed);
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    void load();
  }, []);

  const saveCustomExercises = async (next: CustomExercise[]) => {
    setCustomExercises(next);
    await AsyncStorage.setItem(CUSTOM_EXERCISES_KEY, JSON.stringify(next));
  };

  const handleAdd = async () => {
    if (!name.trim()) return;
    const trimmedDetails = details.trim();
    const seconds = useTimer ? Number.parseInt(timerSecondsInput || '0', 10) : 0;
    const id = `custom_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const exercise: CustomExercise = {
      id,
      sectionId: selectedSectionId,
      name: name.trim(),
      details:
        trimmedDetails ||
        (seconds > 0 ? `${seconds}s timer` : 'Custom exercise'),
      timerSeconds: seconds > 0 ? seconds : undefined,
    };
    const next = [...customExercises, exercise];
    await saveCustomExercises(next);
    setName('');
    setDetails('');
    setUseTimer(false);
    setTimerSecondsInput('');
  };

  const handleRemove = async (id: string) => {
    const next = customExercises.filter((ex) => ex.id !== id);
    await saveCustomExercises(next);
  };

  const sectionOptions = WORKOUT_SECTIONS;

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
    for (const ex of BASE_EXERCISES) {
      counts[ex.sectionId] = (counts[ex.sectionId] ?? 0) + 1;
    }
    return counts;
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-slate-950">
      <View className="px-5 pt-6 pb-4">
        <Text className="text-slate-100 text-3xl font-extrabold tracking-tight">
          Settings
        </Text>
        <Text className="text-slate-400 mt-1 text-sm">
          Customize your plan with your own exercises.
        </Text>
        <Text className="text-slate-500 mt-1 text-xs">
          New exercises will show up in the main workout under the section you choose.
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="pb-10 px-5"
        showsVerticalScrollIndicator={false}
      >
        <View className="rounded-2xl bg-slate-900/80 p-4 border border-slate-800 mb-4">
          <Text className="text-slate-100 font-semibold text-sm mb-3">
            Add a new exercise
          </Text>

          <Text className="text-slate-400 text-xs mb-1">Section</Text>
          <View className="flex-row flex-wrap gap-2 mb-3">
            {sectionOptions.map((section) => {
              const isActive = section.id === selectedSectionId;
              return (
                <Pressable
                  key={section.id}
                  onPress={() => setSelectedSectionId(section.id)}
                  className={`px-3 py-1 rounded-full border ${
                    isActive ? 'border-emerald-400 bg-emerald-500/10' : 'border-slate-700'
                  }`}
                >
                  <Text
                    className={`text-xs ${
                      isActive ? 'text-emerald-300' : 'text-slate-300'
                    }`}
                  >
                    {section.emoji} {section.title}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text className="text-slate-400 text-xs mb-1">Exercise name</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="e.g. Diamond Push-ups"
            placeholderTextColor="#64748b"
            className="text-slate-100 text-sm px-3 py-2 rounded-lg border border-slate-700 bg-slate-900 mb-3"
          />

          <Text className="text-slate-400 text-xs mb-1">
            Details (reps, time, notes)
          </Text>
          <TextInput
            value={details}
            onChangeText={setDetails}
            placeholder="e.g. 3 × 10, slow and controlled"
            placeholderTextColor="#64748b"
            className="text-slate-100 text-sm px-3 py-2 rounded-lg border border-slate-700 bg-slate-900 mb-4"
          />

          <View className="mb-3">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-slate-400 text-xs">Timer (long-press to use)</Text>
              <Pressable
                onPress={() => setUseTimer((prev) => !prev)}
                className={`px-3 py-1 rounded-full border ${
                  useTimer ? 'border-emerald-400 bg-emerald-500/10' : 'border-slate-700'
                }`}
              >
                <Text
                  className={`text-xs ${
                    useTimer ? 'text-emerald-300' : 'text-slate-300'
                  }`}
                >
                  {useTimer ? 'Timer on' : 'No timer'}
                </Text>
              </Pressable>
            </View>
            {useTimer && (
              <TextInput
                value={timerSecondsInput}
                onChangeText={setTimerSecondsInput}
                keyboardType="numeric"
                placeholder="Seconds (e.g. 30)"
                placeholderTextColor="#64748b"
                className="text-slate-100 text-sm px-3 py-2 rounded-lg border border-slate-700 bg-slate-900"
              />
            )}
          </View>

          <Pressable
            onPress={handleAdd}
            className={`mt-1 rounded-lg px-4 py-2 items-center ${
              name.trim() ? 'bg-emerald-500' : 'bg-slate-700'
            }`}
            disabled={!name.trim()}
          >
            <Text
              className={`text-sm font-semibold ${
                name.trim() ? 'text-slate-950' : 'text-slate-400'
              }`}
            >
              Add exercise
            </Text>
          </Pressable>
        </View>

        <View className="rounded-2xl bg-slate-900/80 border border-slate-800">
          <View className="px-4 py-3 border-b border-slate-800">
            <Text className="text-slate-100 font-semibold text-sm">
              Your custom exercises
            </Text>
            <Text className="text-slate-500 text-xs mt-1">
              These are added on top of the base plan.
            </Text>
          </View>

          {isLoading ? (
            <View className="py-6 items-center">
              <Text className="text-slate-400 text-sm">Loading settings…</Text>
            </View>
          ) : customExercises.length === 0 ? (
            <View className="py-6 items-center px-6">
              <Text className="text-slate-400 text-sm text-center">
                You haven&apos;t added any custom exercises yet. Start by adding one above.
              </Text>
            </View>
          ) : (
            sectionOptions.map((section) => {
              const list = groupedCustom[section.id] ?? [];
              if (list.length === 0) return null;
              const baseCount = totalBaseBySection[section.id] ?? 0;
              return (
                <View key={section.id} className="border-t border-slate-800">
                  <View className="px-4 py-3 flex-row items-center justify-between">
                    <View>
                      <Text className="text-slate-100 text-sm">
                        {section.emoji} {section.title}
                      </Text>
                      <Text className="text-slate-500 text-xs">
                        {baseCount} base · {list.length} custom
                      </Text>
                    </View>
                  </View>
                  {list.map((ex) => (
                    <View
                      key={ex.id}
                      className="flex-row items-center justify-between px-4 py-3 border-t border-slate-900"
                    >
                      <View className="flex-1 pr-3">
                        <Text className="text-slate-100 text-sm">{ex.name}</Text>
                        <Text className="text-slate-500 text-xs mt-0.5">
                          {ex.details}
                        </Text>
                      </View>
                      <Pressable
                        onPress={() => void handleRemove(ex.id)}
                        className="px-2 py-1 rounded-full border border-slate-700"
                      >
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

