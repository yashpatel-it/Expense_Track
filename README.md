Expense_Tracker..

A modern and fully interactive Expense Tracker web application that helps users manage income and expenses efficiently.  
Built with a clean UI, real-time updates, and responsive design.

<<<<<<< HEAD
This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/79296df6-fe01-4273-9486-e14ce277c0f9

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   `npm install`
2. Create `.env` file with at least `JWT_SECRET` (and other env vars as needed).
3. Run the app for development:
   `npm run dev`

## Deployment 🚀

The project consists of a React front‑end built with Vite and an Express API for authentication and transactions. When deploying to Vercel or another static host, you must ensure the backend routes are available. The `/api` path is implemented as a serverless function using `server.ts`.

To deploy on Vercel:

1. Commit the `vercel.json` configuration added to the repo. It tells Vercel to build the static site and to route `/api/*` requests into the Node function.
2. In the Vercel dashboard set environment vars (e.g. `JWT_SECRET`, `VERCEL=true` is automatically set).
3. Push to the GitHub repo; Vercel will run `npm run build` and expose both the frontend and API.

> 📝 The 404 logs you previously saw (`GET /api/auth/signup` etc.) occurred because the Express server wasn’t deployed. With the configuration above the endpoints will resolve correctly and the errors disappear.

If you do not want to use Vercel’s serverless functions, host the backend separately and update `src/contexts/AuthContext.tsx` (and other fetch calls) to point to the external API base URL.
=======
-<img width="1866" height="904" alt="image" src="https://github.com/user-attachments/assets/64552126-c972-477b-a5e1-578b5c9f11ec" />


## 🚀 Features

- ➕ Add income and expense transactions
- ✏️ Edit and delete transactions
- 📊 Dashboard with total balance, income, and expense
- 📈 Interactive charts (monthly & category-wise)
- 🗂 Category-based tracking (Food, Travel, Bills, Shopping, etc.)
- 🔎 Search and filter transactions
- 🌙 Light / Dark mode toggle
- 💾 Data stored in browser (localStorage)
- 📱 Fully responsive design

---

## 🛠 Tech Stack

- HTML
- CSS / Tailwind CSS
- JavaScript (or React)
- Chart.js (for graphs)

---

## 📂 Project Structure
expense-tracker/
│
├── index.html
├── style.css
├── script.js
├── assets/
└── README.md
>>>>>>> 6f1b191675a948168949c61c33b0e879893833a5
