# Cascade Rewards - Production-Grade Next.js & Firebase App

This repository contains the source code for Cascade Rewards, a production-ready web application built with Next.js, Firebase, and Tailwind CSS. The application is architected to be scalable, maintainable, and provide a seamless real-time user experience.

## Table of Contents

- [Core Technologies](#core-technologies)
- [Project Architecture](#project-architecture)
  - [Folder Structure](#folder-structure)
  - [Authentication Flow](#authentication-flow)
  - [State Management](#state-management)
  - [Data Synchronization](#data-synchronization)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Environment Variables](#environment-variables)
  - [Installation and Running the App](#installation-and-running-the-app)
- [Firebase Setup](#firebase-setup)
  - [Firestore Schema](#firestore-schema)
  - [Security Rules](#security-rules)

---

## Core Technologies

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Authentication**: [Firebase Authentication](https://firebase.google.com/docs/auth) (Google Sign-In)
- **Database**: [Cloud Firestore](https://firebase.google.com/docs/firestore) (Real-time, NoSQL)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with [shadcn/ui](https://ui.shadcn.com/)
- **Deployment**: Firebase Hosting / Vercel

---

## Project Architecture

The application is built around a modular, scalable architecture that separates concerns and promotes reusability.

### Folder Structure

Here is a high-level overview of the most important files and directories:

```
.
├── src
│   ├── app/                # Next.js App Router: Pages and layouts
│   │   ├── (pages)/        # Page routes like /dashboard, /redeem
│   │   ├── layout.tsx      # Root layout
│   │   └── page.tsx        # Login page (root)
│   ├── components/         # Reusable React components (UI and logic)
│   │   ├── ui/             # shadcn/ui components
│   │   └── dashboard/      # Components specific to the dashboard
│   ├── context/            # Global React contexts (e.g., AppContext)
│   ├── firebase/           # Firebase configuration and core hooks
│   │   ├── auth/           # Authentication-related hooks
│   │   ├── firestore/      # Firestore-specific hooks (useDoc, useCollection)
│   │   ├── config.ts       # Firebase configuration object
│   │   └── index.ts        # Barrel file for exporting Firebase modules
│   ├── hooks/              # Custom, reusable React hooks (e.g., useUser)
│   ├── lib/                # Utility functions, types, and static data
│   │   ├── types.ts        # TypeScript type definitions
│   │   └── utils.ts        # General utility functions (e.g., cn)
│   └── services/           # Business logic and external service interactions
│       └── user.service.ts # Handles Firestore user document logic
├── public/                 # Static assets (images, manifest.json)
├── docs/                   # Project documentation
│   └── backend.json        # Schema definition for Firestore entities
├── firestore.rules         # Firestore security rules
└── next.config.ts          # Next.js configuration
```

### Authentication Flow

1.  **Login Page (`src/app/page.tsx`)**: The user starts at the login page and clicks "Sign In with Google".
2.  **Firebase Auth**: The `signInWithPopup` function from the Firebase SDK is called.
3.  **State Change**: Firebase Auth notifies the app of the user's new authentication state.
4.  **Context Update**: The `FirebaseProvider` catches this change and updates the `AppContext`.
5.  **User Document Sync (`user.service.ts`)**:
    *   If it's the user's first login, a new document is created in the `/users/{uid}` collection in Firestore with default values.
    *   If it's a returning user, the `lastLogin` timestamp and other syncable profile fields are updated.
6.  **Redirection**: The login page, using the `useUser` hook, detects the authenticated user and redirects them to the `/dashboard`.

### State Management

Global user state is managed via React Context to avoid prop-drilling and ensure data consistency.

-   **`src/firebase/provider.tsx`**: This is the low-level provider that manages the raw Firebase Auth state.
-   **`src/context/app-context.tsx`**: This is the core of the state management. It consumes the auth state and combines it with the real-time user profile data from Firestore (`useDoc`). It provides a single, unified context with `user`, `userProfile`, `isUserLoading`, and `error`.
-   **`src/hooks/use-user.ts`**: This is the hook that all components should use to access user data. It provides a simple and consistent interface to the `AppContext`, abstracting away the implementation details.

### Data Synchronization

All user data displayed in the UI is sourced from the `userProfile` object provided by the `useUser` hook. This object is a real-time subscription to the user's document in Firestore.

-   The `useDoc` hook (`src/firebase/firestore/use-doc.tsx`) creates a live listener to a Firestore document.
-   When the data changes in Firestore (either by a client action or directly in the console), the listener fires.
-   This updates the state within `AppContext`, which causes all components using the `useUser` hook to re-render with the fresh data automatically.

---

## Getting Started

### Prerequisites

-   [Node.js](https://nodejs.org/) (v18 or later)
-   [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
-   A Firebase project.

### Environment Variables

You need to create a `.env.local` file in the root of the project and populate it with your Firebase project's configuration.

```
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=...
```

You can get these values from your Firebase project settings in the Firebase Console.

### Installation and Running the App

1.  **Install dependencies:**
    ```bash
    npm install
    ```
2.  **Run the development server:**
    ```bash
    npm run dev
    ```
    The app will be available at `http://localhost:9002`.

---

## Firebase Setup

### Firestore Schema

The primary collection is `users`, where each document ID is the user's Firebase Auth `uid`. The schema for a user document is defined in `docs/backend.json` and looks like this:

-   `uid` (string)
-   `displayName` (string)
-   `email` (string)
-   `photoURL` (string)
-   `provider` (string)
-   `points` (number)
-   `credits` (number)
-   `level` (number)
-   `referralCode` (string)
-   `referredBy` (string | null)
-   `createdAt` (Timestamp)
-   `lastLogin` (Timestamp)
-   `totalLogins` (number)
-   `settings` (map)
    -   `notificationsEnabled` (boolean)
    -   `darkMode` (boolean)

### Security Rules

The `firestore.rules` file ensures that users can only read and write their own data. It's a critical security measure.

-   **Read/Update**: Allowed only if `request.auth.uid == userId`.
-   **Create**: Allowed only if the user is creating their own document with valid data.
-   **Delete/List**: Disallowed for data integrity and security.

This architecture provides a robust, secure, and scalable foundation for the Cascade Rewards application.