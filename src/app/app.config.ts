import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes), provideFirebaseApp(() => initializeApp({ projectId: "csua-intrams", appId: "1:750994193369:web:4e14951627373b6c7377c8", storageBucket: "csua-intrams.firebasestorage.app", apiKey: "AIzaSyDMkCece45r8TPpTFmWSkU6z-1h2d9Pzio", authDomain: "csua-intrams.firebaseapp.com", messagingSenderId: "750994193369" })), provideAuth(() => getAuth()), provideFirestore(() => getFirestore())
  ]
};
