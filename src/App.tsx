import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react'; // Use the useUser hook instead of useAuth
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

// Protect routes by checking authentication with Clerk
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isLoaded, isSignedIn, user } = useUser();
  
  // Show loading state while Clerk is initializing
  if (!isLoaded) {
    return <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
    </div>;
      
  console.log("Auth state:", { isSignedIn, userId: user?.id });
  
  return <>{children}</>;
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
        
        <Route path="/auth" element={
          isSignedIn ? <Navigate to="/dashboard" replace /> : <AuthForms />
        } />
  

        <Route  path="/sso-callback" element={<div>Processing authentication...</div>} />
        
        {/* Protected Routes */}
        <Route path="/" element={
          <ProtectedRoute>
            <PrivateLayout>
              <LandingPage />
            </PrivateLayout>
          </ProtectedRoute>
        } />

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
