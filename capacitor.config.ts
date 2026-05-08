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
    },
    GoogleAuth: {
      scopes: ["profile", "email"],
      serverClientId: "946437330680-9r4mutghresee1heq36ailmtrh7drtv1.apps.googleusercontent.com",
      forceCodeForRefreshToken: true
    }
  }
};

export default config;
