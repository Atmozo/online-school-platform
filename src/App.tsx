
// import React from "react";
// import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import LandingPage from "./pages/LandingPage";
// import CoursePage from "./pages/CoursePage";
// import Dashboard from "./pages/Dashboard";
// import Profile from "./pages/Profile";
// import LessonPage from "./pages/LessonPage";
// import Sidebar from "./components/layout/Sidebar";
// import AuthForms from "./pages/AuthForms";
// import 'plyr/dist/plyr.css';
// import 'video.js/dist/video-js.css';

// const App: React.FC = () => {
//   return (
    
//     <Router>
     
//       <div className="flex">
//         <Sidebar />
//         <div className="flex-1 p-4"></div>
//       <Routes>
//         <Route path="/auth" element={<AuthForms />} />
//         <Route path="/" element={<LandingPage />} />
//         <Route path="/courses/:id" element={<CoursePage />} />
//         <Route path="/courses/:id/lessons" element={<LessonPage />} />
//         <Route path="/dashboard" element={<Dashboard />} />
//         <Route path="/profile" element={<Profile />} />
//       </Routes>
//       </div>   
//     </Router>
    
//   );
// };

// export default App;
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AuthForms from './pages/AuthForms';
import Sidebar from './components/layout/Sidebar';
import LandingPage from './pages/LandingPage';
import CoursePage from './pages/CoursePage';
import LessonPage from './pages/LessonPage';
import Dashboard from './pages/Dashboard';

import QuizCreation from './pages/QuizCreation';
import QuizzesPage from './pages/QuizzesPage';
import LiveClass from './pages/LiveClass';
import TaskManagementSystem from './pages/TaskManagementSystem';
import ProjectsDashboard from './pages/ProjectsDashboard';

const PrivateLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="flex">
    {/* Sidebar is fixed and always visible */}
    <Sidebar brandName="Learn" />
    {/* Main content has left margin matching the sidebar's width (w-80) and some padding */}
    <div className="flex-1 ml-80">
      {children}
    </div>
  </div>
);

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" 
        element={
        <PrivateLayout>
        <LandingPage />
        </PrivateLayout>
        } />
        <Route path="/auth" element={<AuthForms />} />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <PrivateLayout>
              <Dashboard />
            </PrivateLayout>
          }
        />
        <Route
          path="/courses/:id"
          element={
            <PrivateLayout>
              <CoursePage />
            </PrivateLayout>
          }
        />
        <Route
          path="/courses/:id/lessons"
          element={
            <PrivateLayout>
              <LessonPage />
            </PrivateLayout>
          }
        />
        <Route
          path="/task"
          element={
            <PrivateLayout>
              <TaskManagementSystem />
            </PrivateLayout>
          }
        />
        <Route
          path="/quiz/create"
          element={
            <PrivateLayout>
              <QuizCreation />
            </PrivateLayout>
          }
        />
        <Route
          path="/live"
          element={
            <PrivateLayout>
              <LiveClass roomId={''} userId={''} userName={''} role={'instructor'} />
            </PrivateLayout>
          }
        />
        <Route
          path="/quizzes"
          element={
            <PrivateLayout>
              <QuizzesPage />
            </PrivateLayout>
          }
        />
          <Route
          path="/projects"
          element={
            <PrivateLayout>
              <ProjectsDashboard />
            </PrivateLayout>
          }
        />

      </Routes>
    
    </Router>
  );
};

export default App;
