# Ubeer - Backend

## Overview
This project is a backend application that serves as an API for managing resources. It includes middleware for handling requests, models for data representation, and routes for defining endpoints.

## Project Structure
```
backend-project
├── middleware          # Contains middleware functions
│   └── index.js
├── models             # Contains data models
│   └── index.js
├── routes             # Contains route definitions
│   └── index.js
├── uploads            # Directory for file uploads
│   └── .gitkeep
├── server.js          # Entry point of the application
└── README.md          # Project documentation
```

## Setup Instructions
1. Clone the repository:
   ```
   git clone <repository-url>
   ```
2. Navigate to the project directory:
   ```
   cd backend-project
   ```
3. Install the dependencies:
   ```
   npm install
   ```

## Usage
To start the server, run:
```
node server.js
```

The server will be running on `http://localhost:3000` (or the specified port in your configuration).

## Seance 16/05
Nous avons utilisé deepface, un repo open source dispo en module python qui permet de faire de la reconnaissance faciale et de la vérification des ages, il manque à lié cela au front pour faire de la reconnaissance.
Nous sommes en train de migrer la BDD vers une base MongoDB 
URL front : https://ubeers.netlify.app/
URL back : https://ubeer-backend.onrender.com/
