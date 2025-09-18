// ----------------------------------------------------------------------

const useSettings = () => {
  // Return a simple object with the themeStretch property
  return {
    themeStretch: false,
    themeMode: 'light',
    themeDirection: 'ltr',
    themeColorPresets: 'default',
    themeLayout: 'horizontal',
    onChangeMode: () => {},
    onChangeDirection: () => {},
    onChangeColor: () => {},
    onChangeLayout: () => {},
    onToggleStretch: () => {},
  };
};

export default useSettings;
