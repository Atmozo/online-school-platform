import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
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
import CookieConsent from './components/CookieConsent';


// Protect routes by checking authentication with Clerk
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isLoaded, isSignedIn, user } = useUser();
if (!isLoaded) {
  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-r from-gray-50 to-gray-100">
      <div className="relative flex flex-col items-center">
        {/* Outer container with shadow */}
        <div className="p-4 rounded-xl bg-white shadow-lg">
          {/* Spinner container */}
          <div className="relative">
            {/* Base circle */}
            <div className="w-16 h-16 rounded-full border-4 border-gray-100"></div>
            {/* Multiple spinning layers for depth */}
            <div className="absolute top-0 left-0 w-16 h-16 rounded-full border-4 border-transparent border-t-blue-600 animate-spin"></div>
            <div className="absolute top-0 left-0 w-16 h-16 rounded-full border-4 border-transparent border-l-indigo-500 animate-spin animate-delay-150"></div>
          </div>
        </div>
        {/* Loading text with subtle animation */}
        <div className="mt-4 text-gray-700 font-medium animate-pulse">
          Loading<span className="animate-pulse">.</span><span className="animate-pulse delay-150">.</span><span className="animate-pulse delay-300">.</span>
        </div>
      </div>
    </div>
  );
}
  // Redirect if not authenticated
  if (!isSignedIn) {
    return <Navigate to="/auth" replace />;
  }
      
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
  const { isSignedIn, isLoaded } = useUser();
  const [showCookieBanner, setShowCookieBanner] = useState(false);

  // Show cookie banner after authentication is confirmed
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      const hasConsented = localStorage.getItem('cookieConsentStatus');
      if (!hasConsented) {
        // Slight delay to ensure authentication is complete
        const timer = setTimeout(() => {
          setShowCookieBanner(true);
        }, 1000);
        
        return () => clearTimeout(timer);
      }
    }
  }, [isLoaded, isSignedIn]);

  const handleAcceptCookies = () => {
    console.log('Cookies accepted');
    // You can add analytics initialization or other cookie-dependent code here
  };

  const handleDeclineCookies = () => {
    console.log('Cookies declined');
    // Handle limited functionality or alternative tracking here
  };

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/auth" element={
          isSignedIn ? <Navigate to="/dashboard" replace /> : <AuthForms />
        } />
  
        <Route path="/sso-callback" element={<div>Processing authentication...</div>} />
        
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
      
      {/* Cookie Consent Banner */}
      {showCookieBanner && (
        <CookieConsent 
          onAccept={handleAcceptCookies}
          onDecline={handleDeclineCookies}
        />
      )}
    </Router>
  );
};

export default App;
