# Bloggera 📝

Bloggera is a full-stack blogging and social posting web application that allows users to create, publish, and interact with blog posts. It provides authentication, public feed access, and social interactions like likes and comments with a clean and responsive UI.

🌐 **Live Demo:** [https://bloggeraaaa.netlify.app/](https://bloggeraaaa.netlify.app/)

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** React (Vite) / Next.js
- **HTTP Client:** Axios

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB (Mongoose)
- **Auth:** JWT Authentication

---

## 📂 Project Structure

```text
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── vite.config.js
│   └── .env.example
| 
├── backend/
│   ├── routes/
│   ├── controllers/
│   ├── models/
│   ├── middlewares/
│   ├── server.js
│   ├── package.json
│   └── .env.example
|
└── README.md

```
## 🔐 Environment Variables
This project uses environment variables for configuration. We have included .env.example files in the directories.

### Steps
- Create a **.env** file in both the frontend and backend directories.
- Copy contents from the respective **.env.example** files.
- Fill in your own credentials (DB URL, Secret Keys, etc.).

## Clone this repo in local and...

## Backend Setup
Open a terminal and navigate to the backend folder:

```text
cd backend
npm install
npm run dev
```
The Backend server will start on: http://localhost:5000 (or your configured port).

## Frontend Setup
Open a new terminal tab/window and navigate to the frontend folder:

```text
cd frontend
npm install
npm run dev
```
The Frontend will start on: http://localhost:5173 (default Vite port).

## Features
- User Authentication: Secure JWT-based login and signup.
- Create and Publish Blog Posts
- Public Feed (All Users Posts Visible)
- Like and Comment System
- User Profile Management
- Search and Content Discovery
- Responsive UI: Optimized for both desktop and mobile devices.

## Scripts

### Frontend:
```text
npm run dev - Start development server
npm run build - Build for production
npm run preview - Preview the production build
```

### Backend:
```text
npm run dev - Start development server (nodemon)
npm start - Start production server
```
