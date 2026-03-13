import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.locom.app',
  appName: 'Locom',
  webDir: 'out',
  // Production: Remove server.url to use bundled web assets
  // Development: Uncomment below to use live reload
  // server: {
  //   androidScheme: 'https',
  //   iosScheme: 'https',
  //   url: 'http://YOUR_IP:3000',
  //   cleartext: true,
  // },
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


