import React from 'react';
import { View, Pressable, Text } from 'react-native';
import { WorkoutSectionId, WORKOUT_SECTIONS } from 'config/workoutData';

type Props = {
  selectedSectionId: WorkoutSectionId;
  onSelect: (id: WorkoutSectionId) => void;
};

export const ExerciseSectionSelector: React.FC<Props> = ({ selectedSectionId, onSelect }) => (
  <View className="flex-row flex-wrap gap-2 mb-3">
    {WORKOUT_SECTIONS.map((section) => {
      const isActive = section.id === selectedSectionId;
      return (
        <Pressable
          key={section.id}
          onPress={() => onSelect(section.id)}
          className={`px-3 py-1 rounded-full border ${
            isActive ? 'border-emerald-400 bg-emerald-500/10' : 'border-slate-700'
          }`}
        >
          <Text className={`text-xs ${isActive ? 'text-emerald-300' : 'text-slate-300'}`}>
            {section.emoji} {section.title}
          </Text>
        </Pressable>
      );
    })}
  </View>
);