# Soul AI Mobile App 📱

An AI-powered mental health and wellness companion mobile application. Built with **React Native** and **Expo**, Soul AI delivers personalized support through real-time AI conversations, guided breathing exercises, sound healing, and seamless booking of certified human therapists.

---

## 🌟 Key Features

- **🤖 AI Conversation & Companion**: Real-time AI chat for immediate guidance, emotional support, and conversational logs.
- **🧘 Interactive Wellness Exercises**:
  - **Dynamic Breathing Visualizer**: Guided breathing cycles to help relieve anxiety.
  - **Sound Healing**: Curated therapeutic audio flows.
  - **Personality/Wellness Assessment**: Guided tests to personalize recommendations.
- **👥 Group Chat**: Chat rooms to connect with peers and share experiences.
- **🩺 Human Therapist Directory**:
  - Detailed profiles, reviews, and credentials of certified human therapists.
  - In-app scheduling, booking review, and payment processing.
- **💳 Razorpay Payment Integration**: Secure, in-app payment transactions for booking consultations.
- **🎥 Zoom Telehealth Session Integration**: Direct, secure video consulting sessions via Zoom Mobile Meeting SDK.
- **🔔 Push Notifications**: Stay updated with session reminders and alerts powered by Firebase Cloud Messaging (FCM).
- **🔒 Secure Authentication**: Email authentication, OTP verification, and Google Sign-in.
- **🆘 SOS Support**: Fast-access emergency helpline resources and crisis protocols.

---

## 🛠️ Technology Stack

- **Framework**: [Expo](https://expo.dev/) (SDK 54) & [React Native](https://reactnative.dev/) (0.81.x)
- **Routing & Navigation**: [Expo Router](https://docs.expo.dev/router/introduction) (File-based routing v6) & React Navigation (Drawer, Bottom Tabs)
- **State Management**: [Redux Toolkit](https://redux-toolkit.js.org/) (`@reduxjs/toolkit` & `react-redux`)
- **Styling**: Native StyleSheet with custom [responsive scaling utilities](file:///home/soulbuster/gravitons/SoulAIMobileApp/utils/responsive.ts)
- **Secure Storage**: `expo-secure-store` & local storage
- **Push Notifications & Cloud**: React Native Firebase (`@react-native-firebase/app`, `@react-native-firebase/messaging`)
- **Authentication**: `expo-auth-session`, `@react-native-google-signin/google-signin`
- **Video Conferencing**: `@zoom/meetingsdk-react-native`
- **Speech Recognition**: `expo-speech-recognition`

---

## 📁 Repository Structure

```plaintext
SoulAIMobileApp/
├── app/                  # Expo Router App directories & Screen components
│   ├── (drawer)/         # Main App navigation (Breathing, Chat, SOS, Therapist list)
│   ├── index.tsx         # App Entry / Splash router
│   ├── login.tsx         # Login Screen
│   ├── signup.tsx        # Signup Screen
│   ├── book-session.tsx  # Therapist booking flow
│   └── zoom-meeting.tsx  # Zoom Telehealth integration
├── components/           # Reusable UI & Feature-specific components
│   ├── ui/               # Core UI buttons, inputs, headers, avatars
│   └── auth/             # Authentication helper layouts
├── store/                # Redux store configuration & State slices
│   ├── index.ts          # Store setup
│   └── slices/           # Slices (auth, action sheets, confirmation dialogs)
├── utils/                # Utility classes & Helper functions
│   ├── api.ts            # Axios configuration & API interceptors
│   ├── firebase.ts       # Firebase app initialization
│   ├── notificationService.ts # FCM background/foreground handlers
│   └── responsive.ts     # Platform-dependent dimension scaling
├── plugins/              # Custom Expo Config Plugins (Gradle patches, signing configs)
├── assets/               # Local static images, fonts, and assets
└── app.json              # Main Expo application configuration
```

---

## 🚀 Getting Started

### 📋 Prerequisites

Ensure you have the following installed on your local development machine:
- **Node.js** (v18+ recommended)
- **npm** or **yarn**
- **Expo CLI** (`npm install -g expo-cli`)
- **Android Studio** (for Android Emulator) and/or **Xcode** (for iOS Simulator, macOS only)

### 🔧 Installation

1. Clone the repository and navigate into the root directory:
   ```bash
   cd SoulAIMobileApp
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create your local environment file:
   ```bash
   cp env.example .env
   ```
   *Fill in your Firebase, Google Sign-in client IDs, and Zoom API configurations in `.env`.*

### 🏃 Running the App

Start the Expo Development Server:
```bash
npx expo start
```

Use the following shortcuts in the terminal or Expo CLI UI to boot on platforms:
- Press `a` to run on **Android Emulator** / Connected Android Device.
- Press `i` to run on **iOS Simulator** (macOS only).
- Press `w` to run on **Web**.

For local development with custom native modules (like Razorpay or Zoom SDK), run the development build commands:
```bash
# For Android
npm run android

# For iOS
npm run ios
```

---

## ⚙️ Native Configuration Plugins

This repository features several custom Expo Config Plugins (in the [`plugins/`](file:///home/soulbuster/gravitons/SoulAIMobileApp/plugins) folder) to configure native builds without ejecting:
- **`withCustomGradleProperties`**: Configures custom Gradle properties for Android compilation.
- **`withDisableLint`**: Disables strict lint warnings during native builds.
- **`withZoomNetworkSecurity`**: Patches network security configurations for the Zoom SDK.
- **`withZoomResourcePatch`**: Corrects resources for Zoom SDK integration on Android.
- **`withAndroidSigningConfig`**: Dynamically signs release builds.
