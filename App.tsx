import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import './global.css';
import {  SafeAreaView } from 'react-native-safe-area-context';
import { WorkoutScreen } from 'components/WorkoutScreen';
import { ProgressScreen } from 'components/ProgressScreen';
import { SettingsScreen } from 'components/SettingsScreen';

type TabKey = 'workout' | 'progress' | 'settings';

export default function App() {
  const [tab, setTab] = useState<TabKey>('workout');

  return (
   
      <SafeAreaView className="flex-1 bg-slate-950" edges={['top', 'bottom']}>
        <View className="flex-1 pt-6">
          {tab === 'workout' ? (
            <WorkoutScreen />
          ) : tab === 'progress' ? (
            <ProgressScreen />
          ) : (
            <SettingsScreen />
          )}
        </View>

        <View className="px-4 pb-2 pt-2 bg-slate-950 border-t border-slate-800">
          <View className="flex-row bg-slate-900/80 rounded-full p-1">
            {(['workout', 'progress', 'settings'] as TabKey[]).map((key) => {
              const isActive = tab === key;
              const label =
                key === 'workout' ? 'Workout' : key === 'progress' ? 'Progress' : 'Settings';
              return (
                <Pressable
                  key={key}
                  onPress={() => setTab(key)}
                  className={`flex-1 rounded-full py-2 items-center ${
                    isActive ? 'bg-slate-800' : ''
                  }`}
                >
                  <Text
                    className={`text-sm font-semibold ${
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
        <StatusBar style="auto" />
      </SafeAreaView>
   
  );
}
