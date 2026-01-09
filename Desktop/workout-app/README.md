# Workout App

A modern fitness web application to help you build healthy habits, track workouts, plan meals, and get AI-powered coaching—all in one place.

## Features

- **User Authentication:** Register, login, and manage your account securely
- **Workout Library:** Browse, search, and learn about exercises
- **Workout Planner:** Generate custom workout plans with AI
- **Habits Tracker:** Build and track daily healthy habits
- **Meal Planner:** Log meals and get nutrition insights
- **AI Chat Assistant:** Friendly floating chat widget answers any fitness or app question
- **Progress Dashboard:** View your stats, streaks, and achievements

## Getting Started

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/workout-app.git
   cd workout-app
   ```
2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```
3. **Set up environment variables:**
   - Copy `.env.example` to `.env.local` and fill in required values (MongoDB URI, JWT secret, Hugging Face API key, etc.)
4. **Run the development server:**
   ```bash
   npm run dev
   # or
   yarn dev
   ```
5. **Open the app:**
   Visit [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

- **Sign up** for a new account or log in with your credentials
- **Explore workouts** and add them to your plan
- **Track your daily habits** and view your progress
- **Chat with the AI assistant** using the floating chat button (bottom right)
- **Plan meals** and log your nutrition

## Deployment

This app can be deployed on [Render](https://render.com/) or any equivalent platform (e.g., Vercel).

**Render Deployment Steps:**
1. Create a new Web Service on Render and connect your GitHub repository.
2. Set the build command to `npm run build` and the start command to `npm start`.
3. Add all required environment variables (see `.env.example` or `.env.local`).
4. After deployment, your app will be live at your Render URL (e.g., `https://workout-app.onrender.com`).

**Note:** Update this README with your actual Render URL after deployment.

## Tech Stack

- Next.js 14 (App Router)
- React 19
- MongoDB & Mongoose
- Tailwind CSS
- Hugging Face Inference API (AI assistant)

## External APIs & Data

This app uses the following external APIs:

- **Hugging Face Inference API**: Powers the AI chat assistant for fitness and app questions. See https://huggingface.co/inference-api for details.
- **MongoDB Atlas**: Cloud database for storing user, workout, habit, and meal data.

If you use additional APIs or data sources, please document them here.

## License

MIT

## Testing

### Automated Tests

This project includes automated tests using [Jest](https://jestjs.io/). To run all tests:

```bash
npm test
```

### Manual Feature Verification

Please verify the following features are implemented and working:

- Register a new user and log in
- Add, edit, and delete workouts
- Use the AI chat assistant for fitness questions
- Track and update daily habits
- Plan and log meals
- View your progress dashboard

All features listed in the project proposal should be present and functional. If you encounter any issues, please document them here or in your proposal.
