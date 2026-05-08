import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.nexfood.app',
  appName: 'NexFood',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#fff8f6',
      showSpinner: true,
      androidSpinnerStyle: 'large',
      spinnerColor: '#d24200'
    }
  }
};

export default config;
