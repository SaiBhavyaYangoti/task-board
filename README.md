# Task Board

A simple Kanban style task board for teams or personal use. Create tasks, drag them across columns, track priority and due dates, see charts on the Metrics page, and ask a small built in chatbot about your board.

## Features

* Login and signup with secure passwords
* Drag and drop tasks across columns
* Columns are fully customizable, add or delete your own beyond the default four
* Task priority levels (P0 to P3) and optional due dates with overdue highlighting
* Search and filter tasks by assignee or priority
* Metrics page with charts for status, priority, and assignee breakdown
* A small chatbot that answers questions like "what is overdue" or "how many tasks are in progress"
* Fully dockerized, runs the same on any machine

## Tech Stack

Frontend: React, TypeScript, Vite, Tailwind CSS, dnd kit for drag and drop, Recharts for charts

Backend: Node.js, Express, TypeScript, Mongoose

Database: MongoDB

Auth: JWT tokens with bcrypt password hashing

Containers: Docker and docker compose

## Project Structure

    task-board/
      backend/            Express API, talks to MongoDB
      frontend/           React app, the actual UI
      docker-compose.yml  runs mongo, backend, and frontend together

## Environment Files

Both `backend` and `frontend` need a small `.env` file for local settings like the database URL, the login secret, and the API URL. These files are never committed to GitHub since they can hold sensitive values. Instead, create your own based on the variables below.

`backend/.env`

    PORT=4100
    MONGO_URI=mongodb://localhost:27018/task-board
    JWT_SECRET=replace_this_with_a_real_secret

`frontend/.env`

    VITE_API_URL=http://localhost:4100/api

## Running Locally

Start MongoDB in Docker.

    docker run -d --name task-board-mongo -p 27018:27017 mongo:7

Start the backend.

    cd backend
    npm install
    npm run dev

Start the frontend in a new terminal.

    cd frontend
    npm install
    npm run dev

Then open the app at `http://localhost:5273`.

## Running With Docker

Once your `.env` files are set up, the whole app can run as containers with one command.

    docker compose up --build

This starts MongoDB, the backend, and the frontend together, all connected.
