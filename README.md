# Alhirak Archive

Internal archive platform for browsing, searching, and filtering historical articles.

---

## Tech Stack

- Frontend: Next.js (App Router)
- Backend: NestJS
- Database: MongoDB (Mongoose)

---

## Features

- Authentication (login/logout with cookies)
- Search with ranking (title + content)
- Filtering (category, author, date, published)
- Sorting (newest / oldest)
- Pagination
- Article details page (blocks rendering)
- Multilingual UI (English / Arabic)
- Clean modern UI

---

## Project Structure

alhirak-archive/
│
├── backend/     # NestJS API
├── frontend/    # Next.js app
└── README.md

---

## Setup

### Backend

cd backend  
npm install  
npm run start:dev  

Runs on: http://localhost:3001

---

### Frontend

cd frontend  
npm install  
npm run dev  

Runs on: http://localhost:3000

---

## Environment Variables

Create a .env file inside the backend folder:

MONGO_URI=your_mongodb_uri  
JWT_SECRET=your_secret  
PORT=3001  
FRONTEND_URL=http://localhost:3000  

---

## API Endpoints

### Authentication

POST /auth/login  
POST /auth/signup  
GET /auth/me  
POST /auth/logout  

### Articles

GET /articles  
GET /articles/:id  
GET /articles/search  

---

## Query Parameters

search → keyword search  
category → filter by category  
author → filter by author  
dateFrom → start date  
dateTo → end date  
published → true / false  
sort → newest / oldest  
page → pagination page  
limit → items per page  

---

## Database Structure

Article:
- _id  
- title  
- date  
- category  
- author  
- thumbnail  
- featured  
- published  
- blocks[]  

Block:
- type (text | image)  
- content (HTML text or image URL)  
- contentNew (optional image URL)  

---

## Notes

- Uses a test database during development  
- Ready to connect to production archive database  
- Frontend is fully connected to backend API  
- Archive data is read-only (no modifications)  

---

## Author

Developed as part of an internship project.
