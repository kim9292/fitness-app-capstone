# API Planning

## Auth
- `POST /api/auth/register` — Register new user
- `POST /api/auth/login` — Login
- `POST /api/auth/check-email` — Check if email exists
- `POST /api/auth/reset-password` — Reset password

## Workouts
- `GET /api/workouts` — List user workouts
- `POST /api/workouts` — Create workout
- `GET /api/workouts/:id` — Get workout details
- `PUT /api/workouts/:id` — Update workout
- `DELETE /api/workouts/:id` — Delete workout

## Habits
- `GET /api/user/habits` — List user habits/logs
- `POST /api/user/habits` — Log or update habit

## Meals
- `GET /api/meals` — List meals
- `POST /api/meals` — Add meal
- `GET /api/meals/:id` — Get meal details
- `PUT /api/meals/:id` — Update meal
- `DELETE /api/meals/:id` — Delete meal

## AI Assistant
- `POST /api/ai-assistant` — Ask AI a question
- `GET/POST /api/user/chat-history` — Get/save chat history
