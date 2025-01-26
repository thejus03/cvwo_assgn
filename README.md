# Forum page by Thejus Unnikrishnan
## A concept app for creating and managing forums.
- Live Demo: [Link](https://drive.google.com/file/d/1TfeNVJgalFSmdPfNIHab2mHLP12N4UPi/view?usp=sharing)
Note: Please download the video if it does not show in gdrive
- Mobile Demo: [Link](https://drive.google.com/file/d/17BFiwqlUPH27HsQJutssEqvITBcfCig7/view?usp=sharing)
## Features
- User registration and login
- Create, read, update posts
- Create, read, update, delete comments
- Global Search
- Reply to comments
- Upvote and downvote posts
- Tagging system
- Mobile responsive

## Technologies
- Go (Backend)
- Chi (Web framework)
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