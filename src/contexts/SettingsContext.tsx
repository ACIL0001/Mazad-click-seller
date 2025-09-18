import { createContext, ReactNode, useState } from 'react';

// ----------------------------------------------------------------------

type SettingsContextProps = {
  themeMode: 'light' | 'dark';
  themeDirection: 'ltr' | 'rtl';
  themeColorPresets: string;
  themeLayout: string;
  themeStretch: boolean;
  onChangeMode: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onChangeDirection: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onChangeColor: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onChangeLayout: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onToggleStretch: () => void;
};

const initialState: SettingsContextProps = {
  themeMode: 'light',
  themeDirection: 'ltr',
  themeColorPresets: 'default',
  themeLayout: 'horizontal',
  themeStretch: false,
  onChangeMode: () => {},
  onChangeDirection: () => {},
  onChangeColor: () => {},
  onChangeLayout: () => {},
  onToggleStretch: () => {},
};

export const SettingsContext = createContext(initialState);

type SettingsProviderProps = {
  children: ReactNode;
};

export function SettingsProvider({ children }: SettingsProviderProps) {
  const [settings, setSettings] = useState({
    themeMode: initialState.themeMode,
    themeDirection: initialState.themeDirection,
    themeColorPresets: initialState.themeColorPresets,
    themeLayout: initialState.themeLayout,
    themeStretch: initialState.themeStretch,
  });

  const onChangeMode = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSettings({
      ...settings,
      themeMode: event.target.value as 'light' | 'dark',
    });
  };

  const onChangeDirection = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSettings({
      ...settings,
      themeDirection: event.target.value as 'ltr' | 'rtl',
    });
  };

  const onChangeColor = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSettings({
      ...settings,
      themeColorPresets: event.target.value,
    });
  };

  const onChangeLayout = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSettings({
      ...settings,
      themeLayout: event.target.value,
    });
  };

  const onToggleStretch = () => {
    setSettings({
      ...settings,
      themeStretch: !settings.themeStretch,
    });
  };

  return (
    <SettingsContext.Provider
      value={{
        ...settings,
        onChangeMode,
        onChangeDirection,
        onChangeColor,
        onChangeLayout,
        onToggleStretch,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}
