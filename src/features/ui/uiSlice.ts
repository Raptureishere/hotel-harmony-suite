import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type ColorTheme = 'gold' | 'blue' | 'green' | 'purple' | 'rose';

export interface HotelSettings {
  hotelName: string;
  hotelEmail: string;
  hotelPhone: string;
  hotelAddress: string;
  currency: string;
  timezone: string;
  checkInTime: string;
  checkOutTime: string;
  taxRate: string;
  cancellationPolicy: string;
}

const DEFAULT_HOTEL_SETTINGS: HotelSettings = {
  hotelName: 'Grand Hotel',
  hotelEmail: 'info@grandhotel.com',
  hotelPhone: '+1 (555) 000-0000',
  hotelAddress: '123 Grand Avenue, New York, NY 10001',
  currency: 'USD',
  timezone: 'America/New_York',
  checkInTime: '15:00',
  checkOutTime: '11:00',
  taxRate: '10',
  cancellationPolicy: '24h',
};

const getInitialHotelSettings = (): HotelSettings => {
  try {
    const stored = localStorage.getItem('hms_hotelSettings');
    if (stored) return { ...DEFAULT_HOTEL_SETTINGS, ...JSON.parse(stored) };
  } catch { /* ignore */ }
  return DEFAULT_HOTEL_SETTINGS;
};

interface UiState {
  sidebarCollapsed: boolean;
  darkMode: boolean;
  colorTheme: ColorTheme;
  notificationsPanelOpen: boolean;
  mobileMenuOpen: boolean;
  hotelSettings: HotelSettings;
}

const getInitialDarkMode = (): boolean => {
  const stored = localStorage.getItem('hms_darkMode');
  if (stored !== null) return stored === 'true';
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

const getInitialTheme = (): ColorTheme => {
  return (localStorage.getItem('hms_colorTheme') as ColorTheme) || 'gold';
};

/** CSS variable overrides per theme — applied directly on <html> */
const THEME_VARS: Record<ColorTheme, Record<string, string>> = {
  gold: {
    '--accent': '38 92% 50%',
    '--accent-foreground': '222 47% 10%',
    '--primary': '38 92% 50%',
    '--primary-foreground': '222 47% 10%',
    '--ring': '38 92% 50%',
    '--sidebar-primary': '38 92% 50%',
    '--sidebar-ring': '38 92% 50%',
  },
  blue: {
    '--accent': '217 91% 60%',
    '--accent-foreground': '0 0% 100%',
    '--primary': '217 91% 60%',
    '--primary-foreground': '0 0% 100%',
    '--ring': '217 91% 60%',
    '--sidebar-primary': '217 91% 60%',
    '--sidebar-ring': '217 91% 60%',
  },
  green: {
    '--accent': '152 69% 42%',
    '--accent-foreground': '0 0% 100%',
    '--primary': '152 69% 42%',
    '--primary-foreground': '0 0% 100%',
    '--ring': '152 69% 42%',
    '--sidebar-primary': '152 69% 42%',
    '--sidebar-ring': '152 69% 42%',
  },
  purple: {
    '--accent': '262 83% 58%',
    '--accent-foreground': '0 0% 100%',
    '--primary': '262 83% 58%',
    '--primary-foreground': '0 0% 100%',
    '--ring': '262 83% 58%',
    '--sidebar-primary': '262 83% 58%',
    '--sidebar-ring': '262 83% 58%',
  },
  rose: {
    '--accent': '346 77% 55%',
    '--accent-foreground': '0 0% 100%',
    '--primary': '346 77% 55%',
    '--primary-foreground': '0 0% 100%',
    '--ring': '346 77% 55%',
    '--sidebar-primary': '346 77% 55%',
    '--sidebar-ring': '346 77% 55%',
  },
};

export const applyColorTheme = (theme: ColorTheme) => {
  const vars = THEME_VARS[theme];
  const root = document.documentElement;
  Object.entries(vars).forEach(([key, val]) => root.style.setProperty(key, val));
};

const initialState: UiState = {
  sidebarCollapsed: false,
  darkMode: getInitialDarkMode(),
  colorTheme: getInitialTheme(),
  notificationsPanelOpen: false,
  mobileMenuOpen: false,
  hotelSettings: getInitialHotelSettings(),
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => { state.sidebarCollapsed = !state.sidebarCollapsed; },
    setSidebarCollapsed: (state, action: PayloadAction<boolean>) => { state.sidebarCollapsed = action.payload; },
    toggleDarkMode: (state) => {
      state.darkMode = !state.darkMode;
      localStorage.setItem('hms_darkMode', String(state.darkMode));
      if (state.darkMode) document.documentElement.classList.add('dark');
      else document.documentElement.classList.remove('dark');
    },
    setDarkMode: (state, action: PayloadAction<boolean>) => {
      state.darkMode = action.payload;
      localStorage.setItem('hms_darkMode', String(state.darkMode));
      if (state.darkMode) document.documentElement.classList.add('dark');
      else document.documentElement.classList.remove('dark');
    },
    setColorTheme: (state, action: PayloadAction<ColorTheme>) => {
      state.colorTheme = action.payload;
      localStorage.setItem('hms_colorTheme', action.payload);
      applyColorTheme(action.payload);
    },
    toggleNotificationsPanel: (state) => { state.notificationsPanelOpen = !state.notificationsPanelOpen; },
    setNotificationsPanelOpen: (state, action: PayloadAction<boolean>) => { state.notificationsPanelOpen = action.payload; },
    toggleMobileMenu: (state) => { state.mobileMenuOpen = !state.mobileMenuOpen; },
    setMobileMenuOpen: (state, action: PayloadAction<boolean>) => { state.mobileMenuOpen = action.payload; },
    setHotelSettings: (state, action: PayloadAction<Partial<HotelSettings>>) => {
      state.hotelSettings = { ...state.hotelSettings, ...action.payload };
      try { localStorage.setItem('hms_hotelSettings', JSON.stringify(state.hotelSettings)); } catch { /* ignore */ }
    },
  },
});

export const {
  toggleSidebar,
  setSidebarCollapsed,
  toggleDarkMode,
  setDarkMode,
  setColorTheme,
  toggleNotificationsPanel,
  setNotificationsPanelOpen,
  toggleMobileMenu,
  setMobileMenuOpen,
  setHotelSettings,
} = uiSlice.actions;

export default uiSlice.reducer;
