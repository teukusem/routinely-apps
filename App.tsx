import { StatusBar } from 'expo-status-bar';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClientProvider } from '@tanstack/react-query';

import { DatePickerModalProvider, DatePickerSheetHost } from './src/contexts/DatePickerModalContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import { queryClient } from './src/data/api/query-client';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <DatePickerModalProvider>
            <BottomSheetModalProvider>
              <AppNavigator />
              <DatePickerSheetHost />
              <StatusBar style="light" />
            </BottomSheetModalProvider>
          </DatePickerModalProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
