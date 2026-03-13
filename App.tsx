import { StatusBar } from 'expo-status-bar';

import './global.css';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { WorkoutScreen } from 'components/WorkoutScreen';

export default function App() {
  return (
    <SafeAreaProvider>
      <WorkoutScreen />
      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
}
