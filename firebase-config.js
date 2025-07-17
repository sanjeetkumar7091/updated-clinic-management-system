// Firebase configuration and initialization
const firebaseConfig = {
  apiKey: "AIzaSyBSh_IzssX8riS5cKLavUr_bmCOiCzA15E",
  authDomain: "clinic-management-system-af32c.firebaseapp.com",
  projectId: "clinic-management-system-af32c",
  storageBucket: "clinic-management-system-af32c.firebasestorage.app",
  messagingSenderId: "1090324901147",
  appId: "1:1090324901147:web:4ca862cf23acfeb2d537be"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Enable Firestore offline persistence
db.enablePersistence()
  .catch((err) => {
    if (err.code == 'failed-precondition') {
      // Multiple tabs open, persistence can only be enabled
      // in one tab at a a time.
      console.warn('Persistence failed: Multiple tabs open');
    } else if (err.code == 'unimplemented') {
      // The current browser does not support all of the
      // features required to enable persistence
      console.warn('Persistence is not available');
    }
  });
