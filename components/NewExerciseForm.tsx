import React from 'react';
import { View, Text, TextInput, Pressable } from 'react-native';
import { WorkoutSectionId } from 'config/workoutData';
import { ExerciseSectionSelector } from './ExerciseSectionSelector';
import { ExerciseTimerInput } from './ExerciseTimerInput';

type Props = {
  name: string;
  setName: (val: string) => void;
  details: string;
  setDetails: (val: string) => void;
  useTimer: boolean;
  setUseTimer: (val: boolean) => void;
  timerInput: string;
  setTimerInput: (val: string) => void;
  selectedSection: WorkoutSectionId;
  setSelectedSection: (id: WorkoutSectionId) => void;
  onAdd: () => void;
};

export const NewExerciseForm: React.FC<Props> = ({
  name,
  setName,
  details,
  setDetails,
  useTimer,
  setUseTimer,
  timerInput,
  setTimerInput,
  selectedSection,
  setSelectedSection,
  onAdd,
}) => (
  <View className="rounded-2xl bg-slate-900/80 p-4 border border-slate-800 mb-4">
    <Text className="text-slate-100 font-semibold text-sm mb-3">Add a new exercise</Text>

    <Text className="text-slate-400 text-xs mb-1">Section</Text>
    <ExerciseSectionSelector selectedSectionId={selectedSection} onSelect={setSelectedSection} />

    <Text className="text-slate-400 text-xs mb-1">Exercise name</Text>
    <TextInput
      value={name}
      onChangeText={setName}
      placeholder="e.g. Diamond Push-ups"
      placeholderTextColor="#64748b"
      className="text-slate-100 text-sm px-3 py-2 rounded-lg border border-slate-700 bg-slate-900 mb-3"
    />

    <Text className="text-slate-400 text-xs mb-1">Details (reps, time, notes)</Text>
    <TextInput
      value={details}
      onChangeText={setDetails}
      placeholder="e.g. 3 × 10, slow and controlled"
      placeholderTextColor="#64748b"
      className="text-slate-100 text-sm px-3 py-2 rounded-lg border border-slate-700 bg-slate-900 mb-4"
    />

    <ExerciseTimerInput
      useTimer={useTimer}
      setUseTimer={setUseTimer}
      timerInput={timerInput}
      setTimerInput={setTimerInput}
    />

    <Pressable
      onPress={onAdd}
      className={`mt-1 rounded-lg px-4 py-2 items-center ${name.trim() ? 'bg-emerald-500' : 'bg-slate-700'}`}
      disabled={!name.trim()}
    >
      <Text className={`text-sm font-semibold ${name.trim() ? 'text-slate-950' : 'text-slate-400'}`}>
        Add exercise
      </Text>
    </Pressable>
  </View>
);