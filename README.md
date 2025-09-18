# Fucci Expo App

A React Native Expo application built with TypeScript for football/soccer match tracking and debate features.

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- Yarn package manager
- Expo CLI (`npm install -g @expo/cli`)
- Expo Go app on your phone

### Initial Setup

```bash
# Clone and install dependencies
yarn install

# Set up development environment
yarn env:dev

# Start development server
yarn dev
```

## 📱 Running on Your Phone

1. **Install Expo Go** on your phone from App Store (iOS) or Google Play (Android)
2. **Start the development server:**
   ```bash
   yarn dev
   ```
3. **Connect your phone:**
   - Scan the QR code with your phone's camera or Expo Go app
   - Make sure both devices are on the same WiFi network

## 🛠️ Development Commands

### Environment Management

```bash
# Set development environment
yarn env:dev

# Set staging environment
yarn env:staging

# Set production environment
yarn env:prod
```

### Development Server

```bash
# Start development server (default)
yarn start
yarn dev

# Start with specific platform
yarn dev:android
yarn dev:ios
yarn web
```

### Building & Deployment

```bash
# Build for production
yarn build:android
yarn build:ios

# Deploy to staging
yarn staging

# Deploy to production
yarn prod
```

### Development Tools

```bash
# Type checking
yarn type-check

# Clean and reset
yarn clean
yarn reset

# Run development checks
node scripts/dev.js check
```

## 🔧 Automation Scripts

### Development Automation

```bash
# Complete project setup
node scripts/dev.js setup

# Start development server
node scripts/dev.js start

# Build for production
node scripts/dev.js build [android|ios]

# Deploy to environment
node scripts/dev.js deploy [staging|production]

# Run all checks
node scripts/dev.js check
```

### Environment Script

```bash
# Switch environments
node scripts/set-env.js development
node scripts/set-env.js staging
node scripts/set-env.js production
```

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
├── screens/            # Screen components
├── services/           # API services
├── types/              # TypeScript type definitions
└── config/             # Configuration files
    └── environment.ts  # Environment variables
```

## 🌍 Environment Variables

Environment variables are managed through:

- `.env` - Local development variables
- `app.json` - Production environment variables (in `extra` section)
- `src/config/environment.ts` - TypeScript configuration

### Available Variables

- `API_BASE_URL` - Backend API URL
- `APP_NAME` - Application name
- `APP_VERSION` - Application version
- `NODE_ENV` - Environment (development/production)
- `DEBUG` - Debug mode flag

## 📱 Features

- **Match Tracking** - View upcoming and live matches
- **Lineup Display** - Team lineups and formations
- **Debate System** - Pre-match and post-match discussions
- **News Integration** - Latest football news
- **Camera Integration** - Photo capture functionality
- **Responsive Design** - Works on phones and tablets

## 🛠️ Tech Stack

- **React Native** - Mobile app framework
- **Expo** - Development platform
- **TypeScript** - Type safety
- **React Navigation** - Navigation library
- **React Native Paper** - UI components
- **Expo Camera** - Camera functionality

## 📝 Development Workflow

1. **Start development:**

   ```bash
   yarn dev
   ```

2. **Make changes** to your code

3. **Test on device** using Expo Go

4. **Type check** before committing:

   ```bash
   yarn type-check
   ```

5. **Commit changes:**
   ```bash
   git add .
   git commit -m "Your commit message"
   ```

## 🚀 Deployment

### Staging

```bash
yarn env:staging
expo publish
```

### Production

```bash
yarn env:prod
expo build:android
expo build:ios
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and type checking
5. Submit a pull request

## 📄 License

This project is private and proprietary.
