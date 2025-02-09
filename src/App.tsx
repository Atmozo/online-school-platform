
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
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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

// Protect routes by checking authentication
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  // Replace this with your actual auth check
  const isAuthenticated = localStorage.getItem('token') !== null;
  
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }
  
  return children;
};

const PrivateLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <div className="w-full md:w-80 flex-shrink-0">
        <Sidebar brandName="Learn" />
      </div>
      <main className="flex-grow p-4 md:p-6">
        {children}
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/auth" element={<AuthForms />} />
        
        {/* Redirect root to auth if not authenticated */}
        <Route path="/" element={
          <ProtectedRoute>
            <PrivateLayout>
              <LandingPage />
            </PrivateLayout>
          </ProtectedRoute>
        } />

        {/* Protected Routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <PrivateLayout>
              <Dashboard />
            </PrivateLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/courses/:id" element={
          <ProtectedRoute>
            <PrivateLayout>
              <CoursePage />
            </PrivateLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/courses/:id/lessons" element={
          <ProtectedRoute>
            <PrivateLayout>
              <LessonPage />
            </PrivateLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/task" element={
          <ProtectedRoute>
            <PrivateLayout>
              <TaskManagementSystem />
            </PrivateLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/quiz/create" element={
          <ProtectedRoute>
            <PrivateLayout>
              <QuizCreation />
            </PrivateLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/live" element={
          <ProtectedRoute>
            <PrivateLayout>
              <LiveClass 
                roomId={''} 
                userId={''} 
                userName={''} 
                role={'instructor'} 
              />
            </PrivateLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/quizzes" element={
          <ProtectedRoute>
            <PrivateLayout>
              <QuizzesPage />
            </PrivateLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/projects" element={
          <ProtectedRoute>
            <PrivateLayout>
              <ProjectsDashboard />
            </PrivateLayout>
          </ProtectedRoute>
        } />

        {/* Catch all redirect to auth */}
        <Route path="*" element={<Navigate to="/auth" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
// import React from 'react';
// import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';


// import AuthForms from './pages/AuthForms';
// import Sidebar from './components/layout/Sidebar';
// import LandingPage from './pages/LandingPage';
// import CoursePage from './pages/CoursePage';
// import LessonPage from './pages/LessonPage';
// import Dashboard from './pages/Dashboard';
// import QuizCreation from './pages/QuizCreation';
// import QuizzesPage from './pages/QuizzesPage';
// import LiveClass from './pages/LiveClass';
// import TaskManagementSystem from './pages/TaskManagementSystem';
// import ProjectsDashboard from './pages/ProjectsDashboard';

// // Simulating authentication (replace with real auth logic)
// const isAuthenticated = () => {
//   return localStorage.getItem("userToken") !== null; // Example: check token in localStorage
// };

// // Protected Route Wrapper
// const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
//   return isAuthenticated() ? children : <Navigate to="/auth" replace />;
// };

// // Layout with Sidebar for private pages
// const PrivateLayout = ({ children }: { children: React.ReactNode }) => (
//   <div className="flex">
//     <Sidebar brandName="Learn" />
//     <div className="flex-1 ml-80">
//       {children}
//     </div>
//   </div>
// );

// const App: React.FC = () => {
//   return (
//     <Router>
//       <Routes>
//         {/* Redirect users to /auth first if not logged in */}
//         <Route path="/" element={<Navigate to="/landing" replace />} />

//         {/* Public Routes */}
//         <Route path="/auth" element={<AuthForms />} />
//         <Route path="/landing" element={<LandingPage />} />

//         {/* Protected Routes (Require Authentication) */}
//         <Route
//           path="/dashboard"
//           element={
//             <PrivateRoute>
//               <PrivateLayout>
//                 <Dashboard />
//               </PrivateLayout>
//             </PrivateRoute>
//           }
//         />
//         <Route
//           path="/courses/:id"
//           element={
//             <PrivateRoute>
//               <PrivateLayout>
//                 <CoursePage />
//               </PrivateLayout>
//             </PrivateRoute>
//           }
//         />
//         <Route
//           path="/courses/:id/lessons"
//           element={
//             <PrivateRoute>
//               <PrivateLayout>
//                 <LessonPage />
//               </PrivateLayout>
//             </PrivateRoute>
//           }
//         />
//         <Route
//           path="/task"
//           element={
//             <PrivateRoute>
//               <PrivateLayout>
//                 <TaskManagementSystem />
//               </PrivateLayout>
//             </PrivateRoute>
//           }
//         />
//         <Route
//           path="/quiz/create"
//           element={
//             <PrivateRoute>
//               <PrivateLayout>
//                 <QuizCreation />
//               </PrivateLayout>
//             </PrivateRoute>
//           }
//         />
//         <Route
//           path="/live"
//           element={
//             <PrivateRoute>
//               <PrivateLayout>
//                 <LiveClass roomId={''} userId={''} userName={''} role={'instructor'} />
//               </PrivateLayout>
//             </PrivateRoute>
//           }
//         />
//         <Route
//           path="/quizzes"
//           element={
//             <PrivateRoute>
//               <PrivateLayout>
//                 <QuizzesPage />
//               </PrivateLayout>
//             </PrivateRoute>
//           }
//         />
//         <Route
//           path="/projects"
//           element={
//             <PrivateRoute>
//               <PrivateLayout>
//                 <ProjectsDashboard />
//               </PrivateLayout>
//             </PrivateRoute>
//           }
//         />

//         {/* 404 Page for unknown routes */}
//         <Route path="*" element={<Navigate to="/auth" replace />} />
//       </Routes>
//     </Router>
//   );
// };

// export default App;
