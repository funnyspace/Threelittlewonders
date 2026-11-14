# ThreeLittleWonders Cloud Login Setup

The website includes a Firebase Authentication + Cloud Firestore integration layer, but cloud mode stays disabled until a Firebase project is configured.

## 1. Create a Firebase project

Open Firebase Console and create a project for ThreeLittleWonders.

## 2. Add a Web app

Register the GitHub Pages site as a Web app and copy the Firebase configuration values.

## 3. Enable Authentication

In Firebase Authentication, enable **Email/Password** sign-in.

Add the GitHub Pages domain as an authorized domain:

- funnyspace.github.io

## 4. Create Cloud Firestore

Create the default Firestore database.

Deploy the repository's `firestore.rules` before using the public site.

The rules allow each authenticated user to read and write only their own `users/{uid}` document tree.

## 5. Configure the website

Edit `cloud-config.js`:

```js
window.TLW_CLOUD_CONFIG = {
  enabled: true,
  provider: 'firebase',
  firebase: {
    apiKey: '...',
    authDomain: '...',
    projectId: '...',
    storageBucket: '...',
    messagingSenderId: '...',
    appId: '...'
  }
};
```

Firebase Web configuration values identify the Firebase project. They are not a substitute for Firestore Security Rules.

## 6. Data model

```
users/{uid}
  displayName
  grade
  parentEmail
  createdAt
  updatedAt

users/{uid}/learning/state
  progress
  studyData
    topicStats
    testAttempts
    mistakes
    revision schedule
    timeByDate
  badges
  updatedAt
```

The Parent Dashboard is derived from the authenticated student's learning state.

## 7. Migration behavior

When cloud mode is first enabled:

- A newly created cloud account starts with the browser's existing local learning data if no cloud learning document exists.
- An existing cloud account loads its cloud learning state on sign-in.
- Local storage remains as a device cache and fallback.
- Future progress changes are written to both local storage and Firestore.

## 8. Production notes

For a public child-focused education service, keep the student profile minimal, use a parent or guardian email, review applicable privacy/consent requirements, and do not rely on client-side UI checks for authorization.
