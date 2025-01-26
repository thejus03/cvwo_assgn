# Forum page
## A concept app for creating and managing forums.

## Features
- User registration and login
- Create, read, update posts
- Create, read, update, delete comments
- Global Search
- Reply to comments
- Upvote and downvote posts
- Tagging system

## Technologies
- Go (Backend)
- Gin (Web framework)
- ReactJS (Frontend)
- PostgreSQL (Database)
- MUI (UI library)
- JWT (Authentication)

## Installation
1. Clone the repository
2. Install the dependencies
3. Run the backend server (Backend running on port 8080)
```bash
cd backend 
go mod tidy
go run cmd/main.go
```
4. Run the frontend server (Frontend running on port 3000)
```bash
cd frontend
npm install 
npm start
```