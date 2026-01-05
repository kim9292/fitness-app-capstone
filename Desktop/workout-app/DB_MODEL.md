# Database Model Planning

## User

- \_id
- name
- email
- passwordHash
- createdAt

## Workout

- \_id
- userId (ref User)
- title
- date
- exercises: [ { name, sets, reps, weight? } ]
- notes

## Habit

- \_id
- userId (ref User)
- name
- icon
- target
- unit

## HabitLog

- \_id
- habitId (ref Habit)
- userId (ref User)
- date
- completed
- value

## Meal

- \_id
- userId (ref User)
- name
- date
- calories
- macros: { protein, carbs, fat }
- foods: [ { name, amount, calories } ]

## ChatHistory

- \_id
- userId (ref User)
- messages: [ { role, content, timestamp } ]
