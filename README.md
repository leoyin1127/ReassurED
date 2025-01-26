# ReassurED

ReassurED is a mobile application (built with React Native and Expo) designed to help users find and access mental health care services efficiently. It provides real-time wait times, hospital recommendations, symptom checking, and care pathway tracking. This project integrates several services including Firebase for data storage, Auth0 for authentication, and OpenAI-based DeepSeek LLM for AI-driven triage and pathway recommendations. 

---

## Table of Contents
- [ReassurED](#reassured)
  - [Table of Contents](#table-of-contents)
  - [Project Structure](#project-structure)
  - [Features](#features)
  - [Prerequisites](#prerequisites)
  - [Environment Setup](#environment-setup)
  - [Installation](#installation)
  - [Running the App](#running-the-app)
  - [Key Dependencies](#key-dependencies)
  - [Folder \& File Highlights](#folder--file-highlights)
  - [Contributing](#contributing)
  - [License](#license)
  - [Support](#support)
  - [Acknowledgments](#acknowledgments)

---

## Project Structure

.
├── README.md # (This File)
└── frontend/
    ├── App.js
    ├── index.js
    ├── metro.config.js
    ├── package.json
    ├── app.json
    ├── babel.config.js
    ├── .gitignore
    ├── assets/
    ├── src/
    │   ├── components/  # Reusable UI components
    │   ├── config/      # Configuration files (Firebase, environment validation, etc.)
    │   ├── context/     # React Context providers for Auth and Hospital data
    │   ├── hooks/       # Custom React hooks
    │   ├── navigation/  # Navigation setup for tabs and stacks
    │   ├── screens/     # Screen components (Login, Symptom Checker, Triage Results, etc.)
    │   └── services/    # API interactions, including DeepSeek AI calls
    ├── README.md        # Frontend-specific README
    └── ...

## Features

- **Authentication (Auth0)**: Secure user authentication.  
- **Location Services (Expo Location)**: Find nearby hospitals or care facilities.  
- **Symptom Checker**: Initial assessment of user symptoms to help triage.  
- **AI-Driven Triage**: Uses DeepSeek LLM to refine triage levels.  
- **Hospital Recommendations**: Provide multiple hospital options sorted by estimated total wait times + travel.  
- **Care Pathway Tracking**: Track your position in the care journey with dynamic step editing.  

---

## Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v14 or higher)
- [Yarn](https://yarnpkg.com/) (v1.22 or higher)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- Mobile simulator (iOS or Android) or a physical device

---

## Environment Setup

1. Create a `.env` file (at the root of the "frontend" folder) for Firebase and other environment variables (listed under “src/config/firebase.js” and “src/config/validateEnv.js”).  
2. Create an `auth0-configuration.js` file in the root of "frontend" folder with your Auth0 domain and client ID.  

---

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

---

## Running the App

Once the development server has started, you can run the app in any of the following modes:

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

---

## Key Dependencies

- **React Native & Expo**: Core framework for cross-platform mobile development.  
- **React Navigation**: Handles multilevel navigation (tabs, stacks).  
- **Auth0**: Authentication handling services.  
- **Firebase (Firestore)**: Database to store and sync data.  
- **OpenAI/DeepSeek**: AI-based triage and pathway recommendation.  
- **React Native Maps** & **Expo Location**: Map integration and location-based services.  
- **AsyncStorage**: Local storage for lighter caching.  

---

## Folder & File Highlights

1. **App.js**  
   - Configures the Auth0 provider.  
   - Wraps the main app in the Context Providers for Auth and Hospital data.  
   - Sets up navigation.

2. **src/navigation**  
   - Contains stack and tab navigators.  
   - Defines the main user flow for login, symptom checking, hospital recommendations, and status tracking.

3. **src/screens**  
   - Various screens, such as:  
     - LoginScreen: Handles Auth0 login.  
     - SymptomCheckerScreen: Collects symptom input from the user.  
     - TriageResultsScreen: Displays triage level details.  
     - PathwayStatusScreen: Shows and edits the user’s care pathway.  
     - HospitalRecommendationScreen: Displays hospital list & map.  

4. **src/context**  
   - **AuthContext**: Tracks user’s authentication state.  
   - **HospitalContext**: Stores the selected hospital and user’s triage level.

5. **src/services**  
   - **deepseekApi.js**: Integrates with the AI model for triage and pathway guidance.  
   - **hospitalService.js**: Utility functions for hospital data & wait times.  
   - **locationService.js**: Checks device location services and retrieves location.  

6. **frontend/README.md**  
   - Frontend-specific instructions primarily focusing on how to run the Expo project.

---

## Contributing

1. Fork the repository  
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)  
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)  
4. Push to the branch (`git push origin feature/AmazingFeature`)  
5. Open a Pull Request  

---

## License

This project is licensed under the MIT License - see the [LICENSE](./frontend/../LICENSE) file for details.

---

## Support

For support, please email support@reassured.com or open an issue in the repository.

---

## Acknowledgments

- **Auth0** for authentication services  
- **Firebase** for backend services  
- **OpenAI** (DeepSeek) for AI-driven triage & care pathway generation  
- **Expo** & **React Native** for rapid development  
- **Google Maps** for location and map data  

---

**Happy coding!** If you have any questions about the project, feel free to reach out in the Issues section or contact us via email.