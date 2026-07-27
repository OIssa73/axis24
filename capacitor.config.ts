import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.axis24.mediahub',
  appName: 'Axis24',
  webDir: 'dist',
  server: {
    url: 'https://axis24media.vercel.app',
    cleartext: true
  }
};

export default config;
