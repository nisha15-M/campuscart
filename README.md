# 🎓 CampusCart — The Student Exchange

A full-stack MERN marketplace built for a single campus: students buy, sell,
exchange, or give away items to each other, with two features that set it
apart from a typical marketplace clone.

## What makes this different

- **CampusLoop** — every listing carries its full ownership history. The
  product page shows a timeline of everyone who has owned the item, how many
  times it's been reused, and an estimated amount of waste avoided. This is
  driven by real data: creating a listing starts its journey, and completing
  an order transfers ownership and appends to the chain.
- **CampusMatch** — instead of a plain keyword search, students describe what
  they need in one box ("DBMS book under 400 near library") and get scored,
  explainable matches across keyword, budget, category, condition, pickup
  point, and urgency — with a "why this match?" breakdown per result.
- **Trust score** — every account starts at a neutral 50% and moves with
  completed, rated exchanges, shown as a gauge on the profile page.
- **Campus Radar** — browse everything currently available grouped by pickup
  point, for when you're already headed that way.

## Stack

- **Backend:** Node.js, Express, MongoDB (Mongoose), JWT auth, bcrypt
- **Frontend:** React 18, Vite, React Router, Tailwind CSS, Axios

## Project structure

```
campuscart/
├── backend/     Express API (see backend/README below)
└── frontend/    React + Vite single-page app
```

## Running it locally

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env   # fill in MONGO_URI, JWT_SECRET, etc.
npm run dev             # starts on http://localhost:5000
```

Optional: seed some demo listings and activity so the marketplace isn't
empty on first run:

```bash
node seedDemoData.js
node seedActivity.js
```

Demo login after seeding: `campuscart.demo@gmail.com` / `Demo@12345`

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env   # VITE_API_URL defaults to http://localhost:5000/api
npm run dev             # starts on http://localhost:5173
```

Open http://localhost:5173, register with a college email (or leave
`ALLOWED_COLLEGE_DOMAINS` empty in the backend `.env` to allow any email),
and start listing items.

## Notes

- `ALLOWED_COLLEGE_DOMAINS` in the backend `.env` restricts registration to
  specific email domains (comma-separated, e.g. `@college.edu,@university.ac.in`).
  Leave it empty during development to allow any email.
- The "cart" is a local staging area — checkout sends an individual purchase
  request (an `Order`) to each seller; nothing is charged automatically.
- Rotate the `JWT_SECRET` and any database credentials in `.env` before
  deploying this anywhere public.
## Deployment

Live Application: https://campuscart-t1xl.onrender.comgit status