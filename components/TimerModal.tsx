import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { WorkoutExercise } from 'config/workoutData';

type TimerModalProps = {
  exercise: WorkoutExercise;
  initialSeconds: number;
  remainingSeconds: number;
  running: boolean;
  completed: boolean;
  onClose: () => void;
  onStartPause: () => void;
  onReset: () => void;
};

export const TimerModal: React.FC<TimerModalProps> = ({
  exercise,
  initialSeconds,
  remainingSeconds,
  running,
  completed,
  onClose,
  onStartPause,
  onReset,
}) => {
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;

  const progressPercent =
    initialSeconds > 0
      ? Math.max(0, Math.min(100, ((initialSeconds - remainingSeconds) / initialSeconds) * 100))
      : 0;

  const primaryLabel = completed ? 'Done' : running ? 'Pause' : 'Start';

  return (
    <View className="absolute inset-0 bg-slate-950/80 items-center justify-center px-6">
      <View className="w-full rounded-3xl bg-slate-900 border border-slate-700 p-5 shadow-lg">
        <View className="flex-row items-center justify-between mb-3">
          <View>
            <Text className="text-slate-400 text-[11px] uppercase tracking-[0.18em]">
              Timer
            </Text>
            <Text className="text-slate-100 text-lg font-semibold mt-1">
              {exercise.name}
            </Text>
          </View>
          <Pressable
            onPress={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 items-center justify-center border border-slate-600"
          >
            <Text className="text-slate-300 text-xs font-semibold">✕</Text>
          </Pressable>
        </View>

        <View className="mb-4">
          <View className="flex-row items-baseline justify-between">
            <Text className="text-slate-50 text-4xl font-extrabold tracking-tight">
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </Text>
            {initialSeconds > 0 && (
              <Text className="text-slate-500 text-[11px] ml-2">
                of {initialSeconds}s
              </Text>
            )}
          </View>

          {initialSeconds > 0 && (
            <View className="mt-3 h-2 rounded-full bg-slate-800 overflow-hidden">
              <View
                className="h-full rounded-full bg-emerald-400"
                style={{ width: `${progressPercent}%` }}
              />
            </View>
          )}

          {completed && (
            <Text className="text-emerald-400 text-xs mt-3 font-semibold">
              Completed · Marked as done for today
            </Text>
          )}
        </View>

        <View className="flex-row items-center justify-between">
          <Pressable
            onPress={completed ? onClose : onStartPause}
            className={`flex-1 rounded-full px-4 py-2.5 items-center mr-2 ${
              completed ? 'bg-emerald-500' : running ? 'bg-slate-800' : 'bg-emerald-500'
            }`}
          >
            <Text
              className={`text-sm font-semibold ${
                completed || !running ? 'text-slate-950' : 'text-slate-100'
              }`}
            >
              {primaryLabel}
            </Text>
          </Pressable>

          <Pressable
            onPress={onReset}
            className="px-4 py-2.5 rounded-full border border-slate-700 items-center ml-2"
          >
            <Text className="text-sm font-semibold text-slate-200">Reset</Text>
          </Pressable>
        </View>

        <Text className="text-slate-500 text-[11px] mt-3 text-center">
          Long-press any exercise with a time to open this timer. This only tracks time, not reps.
        </Text>
      </View>
    </View>
  );
};

