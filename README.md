# Learn - Online School Platform

EduLearn is a full-featured online learning platform that offers interactive courses, live classes, quizzes, and offline capabilities—all wrapped in a Progressive Web App (PWA). The platform provides a modern learning experience where students can enroll in courses, watch video lectures with advanced controls, take quizzes with auto-grading, and participate in live classes with real-time chat. Instructors can manage courses, create quizzes, and host live sessions.

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
