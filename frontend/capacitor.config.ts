import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.shahinsha.yumm',
  appName: 'Yumm Delivery',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    iosScheme: 'https',
    hostname: 'localhost',
    cleartext: true
  }
};

export default config;
