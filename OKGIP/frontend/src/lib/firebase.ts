import { initializeApp } from "firebase/app";

import {
  getAuth,
  GoogleAuthProvider,
  OAuthProvider,
  signInWithPopup,
} from "firebase/auth";

import {
  getMessaging,
  getToken,
  isSupported,
  onMessage,
} from "firebase/messaging";

import notificationService from "@/services/notificationService";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const firebaseApp = initializeApp(firebaseConfig);

/* =========================
   FIREBASE AUTH
========================= */

export const firebaseAuth = getAuth(firebaseApp);

/* =========================
   GOOGLE LOGIN
========================= */

export const googleProvider = new GoogleAuthProvider();

googleProvider.setCustomParameters({
  prompt: "select_account",
});

export async function signInWithGoogle() {
  const result = await signInWithPopup(
    firebaseAuth,
    googleProvider
  );

  const idToken = await result.user.getIdToken();

  return {
    user: result.user,
    idToken,
  };
}

/* =========================
   MICROSOFT LOGIN
========================= */

export const microsoftProvider =
  new OAuthProvider("microsoft.com");

microsoftProvider.setCustomParameters({
  prompt: "select_account",
});

export async function signInWithMicrosoft() {
  const result = await signInWithPopup(
    firebaseAuth,
    microsoftProvider
  );

  const idToken = await result.user.getIdToken();

  return {
    user: result.user,
    idToken,
  };
}

/* =========================
   PUSH NOTIFICATIONS
========================= */

export async function initializePushNotifications(): Promise<boolean> {
  try {
    if (!("Notification" in window)) {
      console.warn(
        "Browser notifications are not supported."
      );
      return false;
    }

    const supported = await isSupported();

    if (!supported) {
      console.warn(
        "Firebase Messaging is not supported in this browser."
      );
      return false;
    }

    const permission =
      await Notification.requestPermission();

    if (permission !== "granted") {
      console.warn(
        "Notification permission denied."
      );
      return false;
    }

    const registration =
      await navigator.serviceWorker.register(
        "/firebase-messaging-sw.js"
      );

    const messaging =
      getMessaging(firebaseApp);

    const token = await getToken(messaging, {
      vapidKey:
        import.meta.env.VITE_FIREBASE_VAPID_KEY,
      serviceWorkerRegistration: registration,
    });

    if (!token) {
      console.warn(
        "FCM registration token was not generated."
      );
      return false;
    }

    console.log(
      "FCM REGISTRATION TOKEN:",
      token
    );

    await notificationService.registerFid(token);

    console.log(
      "FCM token registered with OKGIP backend."
    );

    onMessage(messaging, (payload) => {
      console.log(
        "Foreground FCM message:",
        payload
      );

      const title =
        payload.notification?.title ||
        payload.data?.title ||
        "OKGIP Notification";

      const body =
        payload.notification?.body ||
        payload.data?.body ||
        "You have a new OKGIP notification.";

      if (
        Notification.permission === "granted"
      ) {
        new Notification(title, {
          body,
          icon: "/favicon.ico",
        });
      }
    });

    return true;
  } catch (error) {
    console.error(
      "Firebase push notification initialization failed:",
      error
    );

    return false;
  }
}