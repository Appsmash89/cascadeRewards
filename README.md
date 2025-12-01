# Cascade Rewards - Production-Grade Next.js & Firebase App

This repository contains the source code for Cascade Rewards, a production-ready web application built with Next.js, Firebase, and Tailwind CSS. The application is architected to be scalable, maintainable, and provide a seamless real-time user experience with non-blocking UI updates.

## Table of Contents

- [Core Technologies](#core-technologies)
- [Project Architecture](#project-architecture)
  - [Folder Structure](#folder-structure)
  - [Authentication Flow](#authentication-flow)
  - [State Management](#state-management)
  - [Data Synchronization & Non-Blocking UI](#data-synchronization--non-blocking-ui)
- [Key Features](#key-features)
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
- **Authentication**: [Firebase Authentication](https://firebase.google.com/docs/auth) (Google Sign-In & Email/Password for Admin)
- **Database**: [Cloud Firestore](https://firebase.google.com/docs/firestore) (Real-time, NoSQL)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with [shadcn/ui](https://ui.shadcn.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
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
│   │   ├── (app)/          # Authenticated page routes (/dashboard, /redeem)
│   │   ├── (auth)/         # Unauthenticated page routes (login)
│   │   ├── layout.tsx      # Root layout
│   │   └── page.tsx        # Root page (redirects to login)
│   ├── components/         # Reusable React components
│   │   ├── ui/             # shadcn/ui components
│   │   ├── dashboard/      # Components specific to the dashboard & core features
│   │   └── devtools/       # Components for the admin developer tools
│   ├── context/            # Global React contexts (app-context.tsx)
│   ├── firebase/           # Firebase configuration and core hooks
│   │   ├── auth/           # Authentication-related hooks
│   │   ├── firestore/      # Firestore-specific hooks (useDoc, useCollection)
│   │   ├── config.ts       # Firebase configuration object
│   │   ├── index.ts        # Barrel file for exporting Firebase modules
│   │   ├── non-blocking-updates.tsx # Firestore writes that don't block UI
│   │   └── provider.tsx    # Core Firebase Context provider
│   ├── hooks/              # Custom, reusable React hooks (useUser, useToast)
│   ├── lib/                # Utility functions, types, and static data
│   │   ├── types.ts        # TypeScript type definitions
│   │   └── utils.ts        # General utility functions (e.g., cn)
│   └── services/           # Business logic (user creation, task seeding)
│       └── user.service.ts # Handles Firestore user document logic
├── public/                 # Static assets (images, manifest.json)
├── docs/                   # Project documentation
│   └── backend.json        # Schema definition for Firestore entities
├── firestore.rules         # Firestore security rules
└── next.config.ts          # Next.js configuration
```

### Authentication Flow

1.  **Login Page (`src/app/(auth)/page.tsx`)**: The user starts at the login page.
2.  **Sign-In**: The user can either "Sign In with Google" or sign in as an "Admin" (using hardcoded credentials for a special developer guest account).
3.  **Firebase Auth**: The `signInWithPopup` (Google) or `signInWithEmailAndPassword` (Admin) function is called. These are handled in a non-blocking way to keep the UI responsive.
4.  **State Change & Context Update**: The `FirebaseProvider` detects the new authentication state and updates the global `AppContext`.
5.  **User Document Sync (`user.service.ts`)**:
    *   On first login, a new document is created in the `/users/{uid}` collection in Firestore with default values.
    *   On subsequent logins, the `lastLogin` timestamp and other profile fields are updated.
6.  **Redirection**: The login page, using the `useUser` hook, detects the authenticated user and redirects them to `/dashboard`.

### State Management

Global user state is managed via React Context to avoid prop-drilling and ensure data consistency.

-   **`src/firebase/provider.tsx`**: A low-level provider that manages the raw Firebase Auth state and service instances.
-   **`src/context/app-context.tsx`**: This is the core of the state management. It consumes the auth state and combines it with the real-time user profile data from Firestore (`useDoc`). It provides a single, unified context with `user`, `userProfile`, `isUserLoading`, and `error`.
-   **`src/hooks/use-user.ts`**: This is the hook that all components should use to access user data. It provides a simple and consistent interface to the `AppContext`.

### Data Synchronization & Non-Blocking UI

To provide a snappy, optimistic UI, the application avoids `await` on most Firestore write operations.

-   **Non-Blocking Writes**: The files `non-blocking-updates.tsx` and `non-blocking-login.tsx` contain helper functions that initiate a Firebase operation and immediately return, allowing the UI to remain responsive. The operation completes in the background. This "fire-and-forget" approach is crucial for a fluid user experience.
-   **Real-time Reads**: All user data displayed in the UI is sourced from the `userProfile` object provided by the `useUser` hook. This object is a real-time subscription to the user's document in Firestore.
-   The `useDoc` and `useCollection` hooks create live listeners to Firestore. When data changes in the backend, the listener fires, updates the `AppContext`, and causes all components using the `useUser` hook to re-render automatically with fresh data.

---

## Key Features

- **Gamified Dashboard**: Includes a leveling system with a progress bar, animated stats, and a dynamic task list.
- **Task System**: Users can complete tasks to earn points. Tasks are managed globally and tracked per user.
- **Rewards Store**: A "Redeem" page where users can spend their points on gift cards.
- **Referral System**: A dedicated page for users to find their referral code and track their network (currently with static data).
- **Admin Developer Tools**: A special section (`/devtools`) available only to the admin user (`guest.dev@cascade.app`).
  - **Task Management**: Create, edit, and delete global tasks.
  - **User Management**: View all users, manage their task progress, award points, and reset their data.
  - **Global Settings**: Adjust application-wide settings like font size.

---

## Getting Started

### Prerequisites

-   [Node.js](https://nodejs.org/) (v18 or later)
-   [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
-   A Firebase project.

### Environment Variables

You need to create a `.env` file in the root of the project and populate it with your Firebase project's configuration.

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

The application uses several collections, defined in `docs/backend.json`:

-   **/users/{userId}**: Stores each user's profile, including points, level, and settings.
    -   **/tasks/{taskId}**: A subcollection tracking the user's progress for each individual task.
-   **/tasks/{taskId}**: A global collection of all available tasks in the app.
-   **/app-settings/{settingId}**: A collection for storing global app settings (e.g., in a document named 'global').

### Security Rules

The `firestore.rules` file defines the access control logic:

-   **User Data**: Users can only read and write their own data in their `/users/{userId}` document.
-   **Tasks**: Any signed-in user can read the global tasks, but only the admin (`guest.dev@cascade.app`) can write to them.
-   **User Tasks**: Users can update the status of their own tasks. The admin can modify any user's task data for debugging and management.
-   **Admin Access**: A special admin user (`guest.dev@cascade.app`) has broader read/write permissions across the database for management purposes.
