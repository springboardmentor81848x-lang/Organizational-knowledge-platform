importScripts(
  "https://www.gstatic.com/firebasejs/12.1.0/firebase-app-compat.js"
);

importScripts(
  "https://www.gstatic.com/firebasejs/12.1.0/firebase-messaging-compat.js"
);

firebase.initializeApp({
  apiKey: "AIzaSyBWe3gIi1-2ZAFySZnSgAHveCZsbuXg3fE",
  authDomain: "okgip-f05d3.firebaseapp.com",
  projectId: "okgip-f05d3",
  storageBucket: "okgip-f05d3.firebasestorage.app",
  messagingSenderId: "673345388323",
  appId: "1:673345388323:web:2ab0e374e79386febed696"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log("[OKGIP] Background FCM message:", payload);

  const title =
    payload.notification?.title ||
    payload.data?.title ||
    "OKGIP Notification";

  const options = {
    body:
      payload.notification?.body ||
      payload.data?.body ||
      "You have a new OKGIP notification.",

    icon: "/favicon.ico",

    badge: "/favicon.ico",

    data: {
      url:
        payload.data?.url ||
        "/employee/notifications"
    }
  };

  self.registration.showNotification(title, options);
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const url =
    event.notification?.data?.url ||
    "/employee/notifications";

  event.waitUntil(
    clients.matchAll({
      type: "window",
      includeUncontrolled: true
    }).then((clientList) => {
      for (const client of clientList) {
        if ("focus" in client) {
          client.navigate(url);
          return client.focus();
        }
      }

      return clients.openWindow(url);
    })
  );
});