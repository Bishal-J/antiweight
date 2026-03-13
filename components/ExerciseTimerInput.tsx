import React from 'react';
import { View, Pressable, Text, TextInput } from 'react-native';

type Props = {
  useTimer: boolean;
  setUseTimer: (value: boolean) => void;
  timerInput: string;
  setTimerInput: (val: string) => void;
};

export const ExerciseTimerInput: React.FC<Props> = ({
  useTimer,
  setUseTimer,
  timerInput,
  setTimerInput,
}) => (
  <View className="mb-3">
    <View className="flex-row items-center justify-between mb-2">
      <Text className="text-slate-400 text-xs">Timer (long-press to use)</Text>
      <Pressable
        onPress={() => setUseTimer(!useTimer)}
        className={`px-3 py-1 rounded-full border ${
          useTimer ? 'border-emerald-400 bg-emerald-500/10' : 'border-slate-700'
        }`}
      >
        <Text className={`text-xs ${useTimer ? 'text-emerald-300' : 'text-slate-300'}`}>
          {useTimer ? 'Timer on' : 'No timer'}
        </Text>
      </Pressable>
    </View>
    {useTimer && (
      <TextInput
        value={timerInput}
        onChangeText={setTimerInput}
        keyboardType="numeric"
        placeholder="Seconds (e.g. 30)"
        placeholderTextColor="#64748b"
        className="text-slate-100 text-sm px-3 py-2 rounded-lg border border-slate-700 bg-slate-900"
      />
    )}
  </View>
);