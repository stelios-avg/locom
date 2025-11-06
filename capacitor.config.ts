import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.locom.app',
  appName: 'Locom',
  webDir: 'out',
  server: {
    androidScheme: 'https',
    iosScheme: 'https',
    // If you're using a custom domain, uncomment:
    // url: 'https://your-domain.com',
    // cleartext: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#16a34a',
      showSpinner: true,
      spinnerColor: '#ffffff',
    },
    StatusBar: {
      style: 'default',
      backgroundColor: '#16a34a',
    },
    Keyboard: {
      resize: 'body',
      style: 'dark',
      resizeOnFullScreen: true,
    },
  },
};

export default config;


