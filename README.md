# Learn - Online School Platform

Learn is a full-featured online learning platform that offers interactive courses, live classes, quizzes, and offline capabilities—all wrapped in a Progressive Web App (PWA). The platform provides a modern learning experience where students can enroll in courses, watch video lectures with advanced controls, take quizzes with auto-grading, and participate in live classes with real-time chat. Instructors can manage courses, create quizzes, and host live sessions.

preview  https://online-school-platform-51h8.vercel.app/
---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Installation & Setup](#installation--setup)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Running the Application](#running-the-application)
- [Testing the Backend with cURL](#testing-the-backend-with-curl)
- [PWA & Offline Functionality](#pwa--offline-functionality)
- 

---

## Overview

EduLearn is a full-stack online school platform that provides:
- **Students:** A way to enroll in courses, view interactive lessons (including advanced video playback with quality selection and progress tracking), take quizzes, and join live classes with real-time chat.
- **Instructors:** Tools to create courses, add lessons and resources, build quizzes, and host live video sessions.
- **PWA & Offline Support:** Offline access through service workers and IndexedDB with automatic sync when online.

---

## Features

- **User Authentication:** Secure sign-up and login using JWT.
- **Course Management:** Instructors can create courses, lessons, and upload various types of resources.
- **Interactive Quizzes:** Quiz creation and taking interfaces with timers, auto-grading, and detailed result analytics.
- **Live Classes:** Real-time video streaming (WebRTC) and chat (Socket.IO) for live learning sessions.
- **PWA & Offline Capabilities:** Service Worker caching, Web App Manifest, and IndexedDB for offline data storage with automatic synchronization.
- **Resource Management & Caching:** Efficient caching of course materials using node-cache and service workers to reduce network usage.
- **Advanced Video Playback:** Integration of Plyr (via plyr-react) for video controls, quality selection, and progress tracking.
- **Animated UI:** Smooth transitions and polished design using Framer Motion and shadcn-ui components.

---

## Technologies Used

- **Frontend:**
  - React with TypeScript
  - Vite as the build tool
  - Tailwind CSS for styling
  - shadcn-ui components for a modern UI
  - Framer Motion for animations
  - Plyr-react for video playback
- **Backend:**
  - Node.js with Express
  - MySQL (using mysql2)
  - Socket.IO for real-time communication (live streaming and chat)
  - WebRTC for live video conferencing
  - node-cache for server-side caching
- **PWA & Offline:**
  - Service Worker and Web App Manifest
  - IndexedDB (using idb) for offline data storage
- **Other Tools:**
  - cURL for API testing
  - npm & nvm for package and Node version management

---

## Installation & Setup

### Backend Setup

1. **Navigate to the server directory:**

   ```bash
   cd server
   npm install
   npm run dev

   frontent
   cd ..
   npm install
   npm run dev
Testing the Backend with cURL
Create a Test User
  curl -X POST http://localhost:5000/api/users \
     -H "Content-Type: application/json" \
     -d '{
           "name": "Test-User",
           "email": "test1@example.com",
           "password": "password123"
         }'
         Create a Quiz with 10 Questions

  Save the following JSON as quiz10.json:

  {
  "title": "JavaScript for Beginners Quiz - Batch 2",
  "created_by": 1,
  "questions": [
    {
      "question": "What does the 'var' keyword do in JavaScript?",
      "options": ["Declares a variable", "Declares a function", "Creates a constant", "None of the above"],
      "correctAnswer": "Declares a variable"
    },
    {
      "question": "Which keyword is used to declare a block-scoped variable?",
      "options": ["var", "let", "const", "block"],
      "correctAnswer": "let"
    },
    {
      "question": "What is the correct way to convert a string to an integer?",
      "options": ["parseInt()", "Number()", "toInteger()", "None of the above"],
      "correctAnswer": "parseInt()"
    },
    {
      "question": "Which operator is used for strict equality?",
      "options": ["==", "===", "=", "!="],
      "correctAnswer": "==="
    },
    {
      "question": "What does JSON.stringify() do?",
      "options": ["Converts an object to a JSON string", "Parses a JSON string", "Converts a number to a string", "None of the above"],
      "correctAnswer": "Converts an object to a JSON string"
    },
    {
      "question": "What will '2' + 2 evaluate to?",
      "options": ["4", "22", "NaN", "Error"],
      "correctAnswer": "22"
    },
    {
      "question": "Which method removes the last element from an array?",
      "options": ["shift()", "pop()", "slice()", "delete()"],
      "correctAnswer": "pop()"
    },
    {
      "question": "What is the output of typeof []?",
      "options": ["array", "object", "list", "undefined"],
      "correctAnswer": "object"
    },
    {
      "question": "What is a closure in JavaScript?",
      "options": ["A function with its lexical scope", "A new variable", "An object", "None of the above"],
      "correctAnswer": "A function with its lexical scope"
    },
    {
      "question": "Which method adds an element to the end of an array?",
      "options": ["push()", "pop()", "shift()", "unshift()"],
      "correctAnswer": "push()"
    }
  ]
}
curl -X POST http://localhost:5000/api/quizzes \
     -H "Content-Type: application/json" \
     -d @quiz10.json
     Course Endpoints


     curl -X GET http://localhost:5000/api/courses | jq .
     curl -X GET http://localhost:5000/api/courses/1/details | jq .
     
  Get All Lessons for a Course

      curl -X GET http://localhost:5000/api/courses/1/lessons | jq .

 Get Resources for a Lesson

      curl -X GET http://localhost:5000/api/lessons/1/resources | jq .
Quiz Endpoints

      curl -X GET http://localhost:5000/api/quizzes/1 | jq .

Enrollment & Progress Endpoints

      curl -X GET http://localhost:5000/enrollments/1 | jq .




   
