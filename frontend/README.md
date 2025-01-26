# ReassurED Frontend

ReassurED is a mobile application designed to help users find and access mental health care services efficiently. The app provides real-time wait times, hospital recommendations, and manages user care pathways.

## Features

- **Authentication**: Secure user authentication using Auth0
- **Location Services**: Find nearby hospitals and care facilities
- **Symptom Checker**: Initial assessment of user symptoms
- **Wait Time Tracking**: Real-time hospital wait time information
- **User Profiles**: Manage personal and medical information
- **Care Status**: Track your position in the care queue

## Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v14 or higher)
- [Yarn](https://yarnpkg.com/) (v1.22 or higher)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- iOS Simulator (for Mac users) or Android Studio (for Android development)

## Environment Setup

1. Create a `.env` file in the root directory with the following variables:

2. Create an `auth0-configuration.js` file in the root directory:

## Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/reassured-frontend.git
cd reassured-frontend
```

2. Install dependencies:
```bash
yarn install
```

3. Start the development server:
```bash
yarn start
```

## Running the App

- **iOS Simulator**:
```bash
yarn ios
```

- **Android Emulator**:
```bash
yarn android
```

- **Web Browser**:
```bash
yarn web
```

## Project Structure

```
reassured-frontend/
├── src/
│   ├── components/       # Reusable UI components
│   ├── screens/         # Screen components
│   ├── navigation/      # Navigation configuration
│   ├── context/         # React Context providers
│   ├── services/        # API and service functions
│   ├── hooks/           # Custom React hooks
│   └── config/          # Configuration files
├── assets/             # Images, fonts, and other static files
├── App.js              # Root component
└── babel.config.js     # Babel configuration
```

## Key Dependencies

- **React Native**: Mobile app framework
- **Expo**: Development platform
- **React Navigation**: Navigation library
- **Auth0**: Authentication service
- **Firebase**: Backend services
- **React Native Maps**: Maps integration
- **Expo Location**: Location services
- **AsyncStorage**: Local storage solution

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please email support@reassured.com or open an issue in the repository.

## Acknowledgments

- Auth0 for authentication services
- Firebase for backend services
- Google Maps for location services
- The Expo team for their excellent development platform