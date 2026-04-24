# TaskTracker — Personal Daily Task Tracker

A full-stack task tracking app with monthly planning, daily completion tracking, and analytics.

## Tech Stack
- **Frontend**: React, Tailwind CSS, Recharts
- **Backend**: Node.js, Express.js
- **Database**: MongoDB

## Prerequisites
- Node.js v16+
- MongoDB running locally on port 27017 (or update `MONGO_URI` in `server/.env`)

## Setup & Run

### 1. Install dependencies
```bash
npm run install:all
```

### 2. Configure environment
Edit `server/.env`:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/tasktracker
JWT_SECRET=change_this_to_a_strong_secret
```

### 3. Start both servers
```bash
npm run dev
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Features
- JWT authentication (signup/login)
- Monthly task planning with color labels
- Daily completion tracking via interactive grid
- Analytics: line chart, bar chart, calendar heatmap
- Streak tracking (current & longest)
- Responsive sidebar layout

## API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/signup | Register |
| POST | /api/auth/login | Login |
| GET | /api/tasks | Get tasks (filter by month/year) |
| POST | /api/tasks | Create task |
| PUT | /api/tasks/:id | Update task |
| DELETE | /api/tasks/:id | Delete task |
| GET | /api/logs | Get task logs |
| POST | /api/logs/toggle | Toggle daily completion |
| GET | /api/analytics/monthly | Monthly % per task |
| GET | /api/analytics/daily | Daily completion counts |
| GET | /api/analytics/heatmap | Heatmap data |
| GET | /api/analytics/streak | Streak info |
