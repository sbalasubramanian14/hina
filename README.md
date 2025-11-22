# HINA - Helpful Interactive Neural Assistant

A smart, context-aware React Native task management app powered by Google's Gemini AI.

## 🎬 What's New

- **Animated Splash Screen**: Beautiful HINA acronym expansion animation on every app launch
- **Dark Mode Support**: Toggle between light, dark, and auto themes
- **Sleek UI**: Modern, clean interface with smooth animations
- **Enhanced Stability**: Fixed onboarding errors with better error handling

## 🚀 Features

- **Task Spaces**: Organize tasks into different contexts (Work, Personal, Learning, etc.)
- **Smart Calendar**: Daily and monthly views with intuitive task visualization  
- **AI-Powered Suggestions**: Gemini AI provides proactive notifications and suggestions
- **Context-Aware**: Adapts based on time, location, and your schedule
- **Recurring Tasks**: Set up repeating tasks with flexible rules
- **Free Time Optimization**: AI suggests learning content during breaks
- **Weekend Planner**: Get personalized activity suggestions

## 📱 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Android Studio (for Android emulator) OR physical Android device
- Expo Go app (for testing on physical device)

### Installation

1. **Install dependencies** (already done):
```bash
npm install
```

2. **Get Gemini API Key**:
   - Visit [https://ai.google.dev](https://ai.google.dev)
   - Sign in and create a free API key
   - You'll enter this during app onboarding

3. **Start the development server**:
```bash
npm start
```

4. **Run on Android**:
   - **Option A - Physical Device**:
     - Install **Expo Go** from Play Store
     - Scan the QR code shown in terminal
   
   - **Option B - Emulator**:
     ```bash
     npm run android
     ```

## 🎯 Usage Guide

### First Launch - Onboarding

1. **Welcome Screen**: Enter your name (optional)
2. **Select Interests**: Choose from predefined categories (Technology, Sports, Arts, etc.)
3. **API Key Setup**: Enter your Gemini API key
4. **Permissions**: Grant notifications and location permissions

### Managing Task Spaces

1. Go to **Spaces** tab
2. Tap "Create New Space"
3. Choose a name, icon, and color
4. Add tasks to each space

### Creating Tasks

1. On Home screen, tap the **+** button
2. Enter task details (currently showing Add Task screen placeholder - to be fully implemented)
3. Set start/end times
4. Choose task space
5. Configure recurrence if needed

### AI Features

The app will automatically:
- Send task reminders before start time
- Provide proactive suggestions (e.g., "Book tickets now while prices are low")
- Share interesting facts about your interests
- Suggest learning content during breaks
- Recommend weekend activities

## 🏗️ Project Structure

```
ai-app/
├── src/
│   ├── components/      # Reusable UI components
│   │   ├── DailyView.tsx
│   │   └── MonthlyView.tsx
│   ├── constants/       # Design system (colors, spacing)
│   ├── navigation/      # App navigation setup
│   ├── screens/         # Main app screens
│   │   ├── OnboardingScreen.tsx
│   │   ├── HomeScreen.tsx
│   │   ├── TaskSpacesScreen.tsx
│   │   └── SettingsScreen.tsx
│   ├── services/        # Core services
│   │   ├── ai/          # Gemini AI integration
│   │   ├── storage.ts   # AsyncStorage wrapper
│   │   └── notifications.tsx
│   ├── types/           # TypeScript definitions
│   └── utils/           # Helper functions
├── App.tsx              # Root component
└── package.json
```

## 🔧 API Integration

The app uses **Gemini 2.0 Flash** model for optimal cost/performance. Key features:

- **Token Optimization**: Compact JSON format for minimal API calls
- **Context Caching**: Reduces redundant API requests
- **Ultra-concise Prompts**: Maximizes free tier usage
- **Extensible**: Easy to add other LLM providers

## 🎨 Design Philosophy

- Clean, modern interface without gradients (as requested)
- Solid color palette for clarity
- Intuitive navigation with bottom tabs
- Card-based layouts for easy scanning
- Emoji icons for quick visual identification

## 📋 Development Notes

### Current Status

✅ Implemented:
- Onboarding flow with interest selection
- Task space management
- Daily/Monthly calendar views
- Settings with API key management
- AI integration layer (Gemini)
- Notification system
- Data storage (AsyncStorage)

⚠️ To Be Completed:
- Task creation/editing forms
- Recurring task UI
- Background AI suggestion processor
- APK build and deployment

### Next Steps

1. **Complete task creation forms** - Add detailed task input screens
2. **Test AI features** - Verify Gemini API integration works
3. **Build background processor** - Schedule periodic AI checks
4. **Generate APK** - Build for production testing

## 🛠️ Building APK

To create an APK for installation on Android devices:

```bash
# Install EAS CLI (if not installed)
npm install -g eas-cli

# Login to Expo
eas login

# Configure build
eas build:configure

# Build APK
eas build --platform android --profile preview
```

## 📱 Testing on Your Android Device

1. Enable "Install from Unknown Sources" in Android settings
2. Download the APK from the build link
3. Install and test
4. Grant all required permissions for full functionality

## 🔐 Privacy & Security

- **API Key**: Stored locally on device using AsyncStorage
- **User Data**: All data stays on your device
- **Permissions**: Only requests necessary permissions (notifications, location)

## 🤝 Contributing

This is a personal project, but feel free to fork and customize for your needs!

## 📄 License

MIT License - Feel free to use and modify as needed.

---

**Happy Task Tracking! 🎯**
