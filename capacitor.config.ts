import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.base69ca3c28f8f30cee64e1f21c.app',
  appName: 'Always Pause',
  webDir: 'dist',
  ios: {
    packageClassList: ['SubjectSegmentationPlugin', 'AppPlugin', 'CAPBrowserPlugin', 'FilesystemPlugin', 'PushNotificationsPlugin', 'SharePlugin', 'SocialLoginPlugin', 'PurchasesPlugin', 'AuraSegmentationPlugin']
  },
  plugins: {
    SocialLogin: {
      providers: {
        google: true,
        facebook: false,
        apple: true,
        twitter: false,
      }
    }
  }
};

export default config;
