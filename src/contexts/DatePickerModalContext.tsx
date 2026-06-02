import { BottomSheetModal } from '@gorhom/bottom-sheet';
import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import { DatePickerSheetModal } from '../components/shared/DatePickerSheetModal';

export type DatePickerOpenConfig = {
  maxDate?: string;
  minDate?: string;
  onConfirm: (isoDate: string) => void;
  title?: string;
  value?: string;
};

type DatePickerModalContextValue = {
  openDatePicker: (config: DatePickerOpenConfig) => void;
};

const DatePickerModalContext = createContext<DatePickerModalContextValue | null>(null);

type DatePickerModalHostContextValue = {
  config: DatePickerOpenConfig | null;
  onCancel: () => void;
  onConfirm: (isoDate: string) => void;
  onDismiss: () => void;
  sheetRef: React.RefObject<BottomSheetModal | null>;
};

const DatePickerModalHostContext = createContext<DatePickerModalHostContextValue | null>(null);

export function DatePickerModalProvider({ children }: { children: ReactNode }) {
  const sheetRef = useRef<BottomSheetModal>(null);
  const configRef = useRef<DatePickerOpenConfig | null>(null);
  const [session, setSession] = useState<DatePickerOpenConfig | null>(null);

  const openDatePicker = useCallback((config: DatePickerOpenConfig) => {
    configRef.current = config;
    setSession(config);
    requestAnimationFrame(() => {
      sheetRef.current?.present();
    });
  }, []);

  const handleDismiss = useCallback(() => {
    configRef.current = null;
    setSession(null);
  }, []);

  const handleCancel = useCallback(() => {
    sheetRef.current?.dismiss();
    configRef.current = null;
    setSession(null);
  }, []);

  const handleConfirm = useCallback((isoDate: string) => {
    configRef.current?.onConfirm(isoDate);
    sheetRef.current?.dismiss();
    configRef.current = null;
    setSession(null);
  }, []);

  return (
    <DatePickerModalContext.Provider value={{ openDatePicker }}>
      <DatePickerModalHostContext.Provider
        value={{
          config: session,
          onCancel: handleCancel,
          onConfirm: handleConfirm,
          onDismiss: handleDismiss,
          sheetRef,
        }}
      >
        {children}
      </DatePickerModalHostContext.Provider>
    </DatePickerModalContext.Provider>
  );
}

/** Mount inside BottomSheetModalProvider (e.g. next to AppNavigator in App.tsx). */
export function DatePickerSheetHost() {
  const host = useContext(DatePickerModalHostContext);

  if (!host) {
    return null;
  }

  return (
    <DatePickerSheetModal
      ref={host.sheetRef}
      config={host.config}
      onCancel={host.onCancel}
      onConfirm={host.onConfirm}
      onDismiss={host.onDismiss}
    />
  );
}

export function useDatePickerModal() {
  const context = useContext(DatePickerModalContext);

  if (!context) {
    throw new Error('useDatePickerModal must be used within DatePickerModalProvider');
  }

  return context;
}
