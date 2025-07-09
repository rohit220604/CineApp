
# 🎬 CineApp

![Vercel](https://img.shields.io/badge/Deployed-Vercel-brightgreen)
![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)

[Live Demo](https://cine-app-phi.vercel.app) 🚀

👉 **Tip:** Use Google login to sign up instantly — no manual OTP needed.


CineApp is a full-stack social movie tracking web app. It uses **React + Vite** for the frontend and **Apollo backend (GraphQL)** with **Node.js + Express** for the backend. The app connects to **TMDB (The Movie Database)** to fetch real-time movie data.

Users can:
- Browse movies
- Save movies for later
- Mark movies as watched
- Get **personalized movie recommendations** based on saved and watched lists
- Write reviews
- **Login with Google OAuth**
- Follow other users
- Accept/reject follow requests
- View followers and following
- See followers’ saved and watched movies if approved
- Control privacy of their lists
- Register and verify accounts via OTP sent by email
- Reset passwords securely
- Use the live deployed version hosted on **Vercel** (frontend) and **Render** (backend)

---

## 📌 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [GraphQL Operations](#graphql-operations)
  - [Queries](#queries)
  - [Mutations](#mutations)
- [Authentication](#authentication)
- [Setup Instructions](#setup-instructions)
- [Environment Variables](#environment-variables)
- [API Keys](#api-keys)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)
- [Author](#author)
- [Contact](#contact)

---

## 🚀 Features

- ✅ **TMDB Integration** – Fetch movies dynamically
- ✅ **Save For Later** – Save any movie to watch later
- ✅ **Mark As Watched** – Keep track of watched movies
- ✅ **Personalized Recommendations** – Get recommended movies based on your activity
- ✅ **Write Reviews** – Review watched movies
- ✅ **User Profiles** – Each user has a unique profile
- ✅ **Followers & Following** – Follow others, accept/reject requests
- ✅ **Privacy Control** – Only approved followers can view saved/watched movies
- ✅ **Google OAuth** – Secure login with your Google account
- ✅ **Email Verification** – Register and verify via OTP
- ✅ **Forgot Password** – Reset password securely via OTP
- ✅ **Search Users** – Find other users by username
- ✅ **Live Deployment** – Hosted on **Vercel** (frontend) and **Render** (backend)

---

## 🗂️ Tech Stack

| Layer | Technology |
|-------|-------------|
| **Frontend** | React, Vite |
| **Backend** | Node.js, Express, Apollo backend (GraphQL) |
| **Database** | MongoDB with Mongoose |
| **Authentication** | JWT, bcryptjs, OTP via nodemailer, Google OAuth |
| **API** | TMDB |

---

## 🗂️ Project Structure

```
cineapp/
 ├── frontend/                # React + Vite frontend
 │   └── src/
 │       ├── components/
 │       │   ├── AboutUs.jsx
 │       │   ├── AuthContext.jsx
 │       │   ├── Followers.jsx
 │       │   ├── Footer.jsx
 │       │   ├── ForgotPassword.jsx
 │       │   ├── Home.jsx
 │       │   ├── Login.jsx
 │       │   ├── MovieDetail.jsx
 │       │   ├── Navbar.jsx
 │       │   ├── NotFound.jsx
 │       │   ├── Profile.jsx
 │       │   ├── Recommended.jsx
 │       │   ├── Register.jsx
 │       │   └── UserProfile.jsx
 │       └── App.jsx
 │   ├── public/
 │   ├── vite.config.js
 │   ├── .env
 ├── backend/
 │   ├── models/            # Mongoose models
 │      ├── User.js
 │      └── Review.js
 │   ├── Schema/            # GraphQL schema and resolvers
 │      ├── resolvers.js
 │      └── typeDefs.js
 │   ├── utils/             # Utility modules (e.g., mailer)
 │      └── mailer.js
 │   ├── index.js           # Express + Apollo backend entry point
 │   ├── .env
```

---

## ⚙️ GraphQL Operations

### 🔍 Queries

- `me` → Get the authenticated user’s details.
- `myReviews` → Get reviews written by the logged-in user.
- `myWatchedMovies` → Get movies marked as watched.
- `mySavedMovies` → Get movies saved for later.
- `reviewsForMovie(tmdbId)` → Get all reviews for a movie.
- `followers(username)` → Get a list of followers for a user.
- `following(username)` → Get a list of users someone is following.
- `pendingFollowRequests` → Get pending follow requests.
- `userWatchedMovies(username)` → Get watched movies of another user (if following).
- `userSavedMovies(username)` → Get saved movies of another user (if following).
- `isUsernameAvailable(username)` → Check if username is available.
- `searchUsers(query)` → Search for users by username.
- `userProfile(username)` → Get profile info for a user.

### ✍️ Mutations

- `register` → Register a new account.
- `verifyOTP` → Verify OTP sent via email.
- `login` → Login and receive JWT.
- `forgotPassword` → Send OTP to reset password.
- `resetPassword` → Reset password using OTP.
- `saveForLater` → Save a movie.
- `markAsWatched` → Mark a movie as watched.
- `removeFromSaved` → Remove a movie from saved list.
- `removeFromWatched` → Remove a movie from watched list.
- `addReview` → Add a review for a movie.
- `sendFollowRequest` → Send follow request to another user.
- `acceptFollowRequest` → Accept a follow request.
- `rejectFollowRequest` → Reject a follow request.
- `unfollow` → Unfollow a user.
- `removeFollower` → Remove a follower.

---

## 🔐 Authentication

- **Password Hashing:** User passwords are hashed with bcryptjs.
- **JWT:** On login, a JWT token is generated and used for protected routes.
- **OTP:** Used for verifying email and resetting passwords.
- **Email:** OTPs are sent using NodeMailer.

---

## ⚙️ Setup Instructions

### 1️⃣ Clone Repo

```
git clone https://github.com/rohit220604/CineApp.git
cd cineapp
```

### 2️⃣ Install Dependencies

**Backend:**

```
cd backend
npm install
```

**Frontend:**

```
cd ../frontend
npm install
```

### 3️⃣ Setup Environment Variables

Create `.env` in `backend/`:

```
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_password
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
CLIENT_URL=http://localhost:5173
PORT=4000
```

Create `.env` in `frontend/`:

```
VITE_TMDB_API_KEY=your_tmdb_api_key
VITE_BACKEND_URL=http://localhost:4000
```

### 4️⃣ Run Backend

```
npm run dev
```

### 5️⃣ Run Frontend

```
npm run dev
```

---

## 🔑 API Keys

- **TMDB API Key:** Required for fetching movies.
  - [TMDB](https://www.themoviedb.org/) → Create account → Get API key → Add to `frontend/.env`.

- **Google OAuth Credentials:** Required for Google login.
  - [Google Cloud Console](https://console.cloud.google.com/) → Create a project → Enable OAuth consent screen → Create OAuth 2.0 Client ID → Add `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` to `backend/.env`.


---

## 🚀 Deployment

- **Frontend:** [https://cine-app-phi.vercel.app](https://cine-app-phi.vercel.app)
- **Backend:** Hosted securely on **Render**

---

## 🤝 Contributing

1. Fork this repository.
2. Create a new branch: `git checkout -b my-feature-branch`
3. Make your changes.
4. Commit changes: `git commit -m "Add new feature"`
5. Push to branch: `git push origin my-feature-branch`
6. Open a pull request.

---

## 📜 License

This project is licensed under the MIT License.

---

## 👤 Author

**Rohit Jaliminchi**  
[GitHub](https://github.com/rohit220604)

---

## 📬 Contact

For suggestions, issues, or feature requests, open an issue or email: **rjrohit2264@gmail.com**

---

🍿 **Enjoy CineApp!**
