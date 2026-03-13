import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import './global.css';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { WorkoutScreen } from 'components/WorkoutScreen';
import { ProgressScreen } from 'components/ProgressScreen';

type TabKey = 'workout' | 'progress';

export default function App() {
  const [tab, setTab] = useState<TabKey>('workout');

  return (
    <SafeAreaProvider>
      <SafeAreaView className="flex-1 bg-slate-950" edges={['top', 'bottom']}>
        <View className="px-4 pb-4">
          <View className="flex-row bg-slate-900/80 rounded-full p-1 border border-slate-800 mt-1">
            {(['workout', 'progress'] as TabKey[]).map((key) => {
              const isActive = tab === key;
              const label = key === 'workout' ? 'Workout' : 'Progress';
              return (
                <Pressable
                  key={key}
                  onPress={() => setTab(key)}
                  className={`flex-1 rounded-full py-2 items-center ${
                    isActive ? 'bg-slate-800' : ''
                  }`}
                >
                  <Text
                    className={`text-xs font-semibold ${
                      isActive ? 'text-slate-50' : 'text-slate-500'
                    }`}
                  >
                    {label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View className="flex-1">
          {tab === 'workout' ? <WorkoutScreen /> : <ProgressScreen />}
        </View>
      </SafeAreaView>
      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
}
