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
  
  // Show loading state while Clerk is initializing
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-64 h-64">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600">
            <style>
              {`
                @keyframes walkCycle {
                  0% { transform: translateX(-100px); }
                  100% { transform: translateX(700px); }
                }
                
                @keyframes bodyWalk {
                  0%, 100% { transform: translateY(0); }
                  50% { transform: translateY(-3px); }
                }
                
                @keyframes legSwing {
                  0%, 100% { transform: rotate(-20deg); }
                  50% { transform: rotate(20deg); }
                }
                
                @keyframes armSwing {
                  0%, 100% { transform: rotate(20deg); }
                  50% { transform: rotate(-10deg); }
                }
                
                @keyframes bookFlip {
                  0%, 100% { transform: rotateY(0deg); }
                  50% { transform: rotateY(8deg); }
                }
                
                @keyframes eyeBlink {
                  0%, 95%, 100% { transform: scaleY(1); }
                  97% { transform: scaleY(0.1); }
                }
                
                .student {
                  animation: walkCycle 10s linear infinite;
                }
                
                .body {
                  animation: bodyWalk 0.6s ease-in-out infinite;
                }
                
                .leg-left {
                  animation: legSwing 0.6s ease-in-out infinite;
                  transform-origin: top center;
                }
                
                .leg-right {
                  animation: legSwing 0.6s ease-in-out infinite reverse;
                  transform-origin: top center;
                }
                
                .arm-left {
                  animation: armSwing 0.6s ease-in-out infinite;
                  transform-origin: top center;
                }
                
                .arm-right {
                  animation: armSwing 0.6s ease-in-out infinite reverse;
                  transform-origin: top center;
                }
                
                .book-pages {
                  animation: bookFlip 3s ease-in-out infinite;
                  transform-origin: center left;
                }
                
                .eye {
                  animation: eyeBlink 3s ease-in-out infinite;
                  transform-origin: center center;
                }
                
                .cloud {
                  opacity: 0.8;
                  fill: white;
                }
                
                .cloud-1 {
                  animation: cloudMove1 25s linear infinite;
                }
                
                .cloud-2 {
                  animation: cloudMove2 20s linear infinite;
                }
                
                @keyframes cloudMove1 {
                  0% { transform: translateX(800px); }
                  100% { transform: translateX(-200px); }
                }
                
                @keyframes cloudMove2 {
                  0% { transform: translateX(800px); }
                  100% { transform: translateX(-200px); }
                }
              `}
            </style>
            
            {/* Background */}
            <rect x="0" y="0" width="800" height="600" fill="#f5f7fa" />
            
            {/* Clouds */}
            <g className="cloud cloud-1" transform="translate(600, 80)">
              <ellipse cx="0" cy="0" rx="40" ry="30" className="cloud" />
              <ellipse cx="-30" cy="10" rx="30" ry="20" className="cloud" />
              <ellipse cx="30" cy="10" rx="30" ry="25" className="cloud" />
            </g>
            
            <g className="cloud cloud-2" transform="translate(200, 120)">
              <ellipse cx="0" cy="0" rx="50" ry="30" className="cloud" />
              <ellipse cx="-40" cy="10" rx="30" ry="20" className="cloud" />
              <ellipse cx="40" cy="10" rx="30" ry="25" className="cloud" />
            </g>
            
            {/* Floor/ground */}
            <rect x="0" y="450" width="800" height="150" fill="#e8edf5" />
            <line x1="0" y1="450" x2="800" y2="450" stroke="#d0d7e3" strokeWidth="2" />
            
            {/* Student */}
            <g className="student" transform="translate(400, 450)">
              {/* Feet - to ensure proper grounding */}
              <ellipse className="leg-left" cx="-18" y="60" rx="8" ry="4" fill="#1a237e" />
              <ellipse className="leg-right" cx="18" y="60" rx="8" ry="4" fill="#1a237e" />
              
              {/* Legs */}
              <rect className="leg-left" x="-25" y="0" width="14" height="60" rx="5" fill="#3F51B5" />
              <rect className="leg-right" x="11" y="0" width="14" height="60" rx="5" fill="#3F51B5" />
              
              {/* Shadow under student */}
              <ellipse cx="0" cy="62" rx="30" ry="5" fill="#d0d7e3" opacity="0.5" />
              
              {/* Body */}
              <g className="body">
                {/* Torso */}
                <rect x="-28" y="-80" width="56" height="80" rx="10" fill="#FF5722" />
                
                {/* Arms */}
                <rect className="arm-left" x="-48" y="-75" width="12" height="45" rx="6" fill="#FFCCBC" />
                <rect className="arm-right" x="36" y="-75" width="12" height="45" rx="6" fill="#FFCCBC" />
                
                {/* Head */}
                <circle cx="0" cy="-100" r="25" fill="#FFCCBC" />
                
                {/* Eyes */}
                <ellipse className="eye" cx="-8" cy="-105" rx="3" ry="4" fill="#333" />
                <ellipse className="eye" cx="8" cy="-105" rx="3" ry="4" fill="#333" />
                
                {/* Mouth */}
                <path d="M-8 -90 Q0 -85 8 -90" fill="none" stroke="#333" strokeWidth="2" />
                
                {/* Hair */}
                <path d="M-25 -115 Q-10 -130 0 -125 Q10 -130 25 -115" fill="#4E342E" />
                
                {/* Book */}
                <g transform="translate(-10, -55) rotate(-20)">
                  <rect x="-15" y="-10" width="30" height="20" fill="#795548" />
                  <rect className="book-pages" x="-12" y="-9" width="24" height="18" fill="#FFFDE7" />
                  <line x1="-12" y1="-5" x2="12" y2="-5" stroke="#333" strokeWidth="0.5" />
                  <line x1="-12" y1="0" x2="12" y2="0" stroke="#333" strokeWidth="0.5" />
                  <line x1="-12" y1="5" x2="12" y2="5" stroke="#333" strokeWidth="0.5" />
                </g>
              </g>
            </g>
            
            {/* Loading text */}
            <text x="400" y="520" textAnchor="middle" fill="#3F51B5" fontFamily="Arial" fontSize="18" fontWeight="bold">Loading your content...</text>
          </svg>
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
