# Fitness Tracking App (Springboard Capstone)

A full-stack fitness tracking application that allows users to sign up, log in, and track workouts over time.  
This project was built as my capstone for Springboard’s Software Engineering Career Track.

## Live Demo
https://fitness-app-capstone-project.onrender.com

## Tech Stack
- Frontend: React
- Backend: Node.js, Express
- Database: MongoDB
- Authentication: JSON Web Tokens (JWT)
- Deployment: Render

## Features
- User authentication (sign up / log in)
- Create, view, and manage workout logs
- Secure RESTful APIs for user and workout data
- Environment variable configuration for sensitive data
- Deployed production application

## Architecture Overview
- React frontend communicates with a Node.js / Express REST API
- Backend handles authentication and business logic
- MongoDB stores user and workout data
- Environment variables are used for secrets and configuration

## Getting Started (Local Setup)
```bash
git clone https://github.com/kim9292/fitness-app-capstone.git
cd fitness-app-capstone
npm install
npm run dev
