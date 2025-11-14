import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.millenniumpotter.app',
  appName: 'Millennium Potter',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;