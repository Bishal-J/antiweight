import React from 'react';
import { View, Text, TextInput, Pressable } from 'react-native';
import { BaseExerciseOverride, WorkoutExercise } from 'config/workoutData';

type Props = {
  exercise: WorkoutExercise;
  override?: BaseExerciseOverride;
  isEditing: boolean;
  editingState: {
    name: string;
    details: string;
    useTimer: boolean;
    timerInput: string;
    setName: (val: string) => void;
    setDetails: (val: string) => void;
    setUseTimer: (val: boolean) => void;
    setTimerInput: (val: string) => void;
  };
  beginEdit: () => void;
  cancelEdit: () => void;
  saveEdit: () => void;
  toggleHide: () => void;
};

export const BaseExerciseItem: React.FC<Props> = ({
  exercise,
  override,
  isEditing,
  editingState,
  beginEdit,
  cancelEdit,
  saveEdit,
  toggleHide,
}) => {
  const name = override?.name ?? exercise.name;
  const details = override?.details ?? exercise.details;
  const timer = override?.timerSeconds ?? exercise.timerSeconds;
  const deleted = override?.deleted;

  return (
    <View className="px-4 py-3 border-t border-slate-900">
      <View className="flex-row items-center justify-between">
        <View className="flex-1 pr-3">
          <Text className={`text-slate-100 text-sm ${deleted ? 'line-through text-slate-500' : ''}`}>
            {name}
          </Text>
          <Text className="text-slate-500 text-xs mt-0.5">
            {details}
            {timer ? ` · ${timer}s timer` : ''}
          </Text>
          {deleted && <Text className="text-[11px] text-amber-300 mt-0.5">Hidden from workout</Text>}
        </View>
        <View className="flex-row">
          <Pressable onPress={beginEdit} className="px-2 py-1 rounded-full border border-slate-700 mr-2">
            <Text className="text-[11px] text-slate-300">{isEditing ? 'Editing' : 'Edit'}</Text>
          </Pressable>
          <Pressable onPress={toggleHide} className="px-2 py-1 rounded-full border border-slate-700">
            <Text className="text-[11px] text-slate-400">{deleted ? 'Unhide' : 'Hide'}</Text>
          </Pressable>
        </View>
      </View>

      {isEditing && (
        <View className="mt-3">
          <Text className="text-slate-400 text-xs mb-1">Name</Text>
          <TextInput
            value={editingState.name}
            onChangeText={editingState.setName}
            className="text-slate-100 text-sm px-3 py-2 rounded-lg border border-slate-700 bg-slate-900 mb-2"
          />
          <Text className="text-slate-400 text-xs mb-1">Details</Text>
          <TextInput
            value={editingState.details}
            onChangeText={editingState.setDetails}
            className="text-slate-100 text-sm px-3 py-2 rounded-lg border border-slate-700 bg-slate-900 mb-2"
          />
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-slate-400 text-xs">Timer</Text>
            <Pressable
              onPress={() => editingState.setUseTimer(!editingState.useTimer)}
              className={`px-3 py-1 rounded-full border ${
                editingState.useTimer ? 'border-emerald-400 bg-emerald-500/10' : 'border-slate-700'
              }`}
            >
              <Text className={`text-xs ${editingState.useTimer ? 'text-emerald-300' : 'text-slate-300'}`}>
                {editingState.useTimer ? 'Timer on' : 'No timer'}
              </Text>
            </Pressable>
          </View>
          {editingState.useTimer && (
            <TextInput
              value={editingState.timerInput}
              onChangeText={editingState.setTimerInput}
              keyboardType="numeric"
              placeholder="Seconds (e.g. 30)"
              placeholderTextColor="#64748b"
              className="text-slate-100 text-sm px-3 py-2 rounded-lg border border-slate-700 bg-slate-900 mb-2"
            />
          )}
          <View className="flex-row justify-end mt-1">
            <Pressable onPress={cancelEdit} className="px-3 py-1 rounded-full border border-slate-700 mr-2">
              <Text className="text-[11px] text-slate-300">Cancel</Text>
            </Pressable>
            <Pressable onPress={saveEdit} className="px-3 py-1 rounded-full bg-emerald-500">
              <Text className="text-[11px] font-semibold text-slate-950">Save</Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
};