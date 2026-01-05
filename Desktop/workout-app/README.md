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

- Easily deploy to [Vercel](https://vercel.com/) or your preferred platform
- Make sure to set all environment variables in your deployment settings

## Tech Stack

- Next.js 14 (App Router)
- React 19
- MongoDB & Mongoose
- Tailwind CSS
- Hugging Face Inference API (AI assistant)

## License

MIT

---

Feel free to customize this README for your submission or add screenshots and more details!
