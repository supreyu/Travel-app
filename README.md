
# Travel App

## Introduction

*Travel App* is a mobile application designed for travelers to share and explore travel experiences. Users can document their journeys with photos, videos, and narratives, creating a vivid digital diary of their adventures. The app also allows for exploration of places through the stories shared by others, offering inspiration and insights into different locales worldwide. Additionally, it features an "Emergency Contact" function for enhanced safety during travels.

## Key Features

- **Post Creation:** Users can create posts with text, images, and videos, capturing the essence of their travel experiences.
- **Media Integration:** The app supports capturing new photos and videos directly or selecting existing ones from the device's gallery.
- **Geolocation:** Posts can be tagged with geographical data, allowing users to share the exact locations of their adventures.
- **Interactive Map:** A map view displays posts based on their geolocation, enabling users to visually explore travels.
- **Direct Post Editing:** Users can edit their posts directly within the app, ensuring their stories remain accurate and up-to-date.
- **Local Storage:** The app utilizes AsyncStorage for storing posts locally, ensuring data persistence across sessions.
- **Emergency Contact Feature:** Offers users the ability to quickly access and dial stored emergency contacts directly from the app. This feature aims to enhance traveler safety by providing immediate access to help in case of emergencies.

## Technologies Used

- **React Native:** A framework for building native apps using React.
- **Expo:** An open-source platform used for building and serving React Native apps.
- **AsyncStorage:** For local storage of posts and related data.
- **React Navigation:** To handle navigation between different screens within the app.
- **Expo Image Picker:** For capturing and selecting photos and videos from the device.
- **Expo Location:** To fetch geolocation data for posts.
- **Expo Local Authentication:** Utilized for implementing the "Emergency Contact" feature, ensuring secure access through device authentication methods like biometrics or passcodes.

## Setup

To get the *Travel App* running locally, follow these steps:

### Clone the repository:

```sh
git clone https://github.com/yourusername/travel-app.git
cd travel-app
```

### Install dependencies:

Ensure you have Node.js installed, then run:

```sh
npm install
```

Or if you prefer using Yarn:

```sh
yarn install
```

### Start the app with Expo:

```sh
npx expo start
```

This will start the Expo CLI server. You can then run the app on your device using the Expo Go app or on a simulator/emulator.

