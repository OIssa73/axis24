import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.axis24.mediahub',
  appName: 'Axis24',
  webDir: 'dist',
  plugins: {
    CapacitorUpdater: {
      appId: '86af18fc-21d4-4adb-aebb-b3bf1aa8f7ed',
      autoUpdate: true,
      statsUrl: 'https://capgo.app/api/stats'
    }
  }
};

export default config;
