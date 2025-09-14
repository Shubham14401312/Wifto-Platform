# Wifto

Collaborative Educational Platform for Environmental Education

## Structure

- `frontend/` — The web app (HTML, JavaScript, CSS)
- `backend/` — Node.js/Express REST API server (MongoDB)
- `.env.example` — Sample environment config
- `.gitignore` — Git ignore rules

## Setup

### Backend

```bash
cd backend
npm install
cp ../.env.example .env # edit credentials
node app.js