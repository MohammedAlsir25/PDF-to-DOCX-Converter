import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.pdf2docx.converter',
  appName: 'PDF to DOCX Converter',
  webDir: 'dist',
  server: {
    url: 'https://ais-pre-zydmbkq7m3kom7na4dqk6o-184704633091.europe-west1.run.app',
    cleartext: true
  }
};

export default config;
