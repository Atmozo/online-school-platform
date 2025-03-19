import React, { useState, useEffect } from 'react';

interface CookieConsentProps {
  onAccept: () => void;
  onDecline: () => void;
}

const CookieConsent: React.FC<CookieConsentProps> = ({ onAccept, onDecline }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    // Check if user has previously interacted with the banner
    const consentStatus = localStorage.getItem('cookieConsentStatus');
    
    if (!consentStatus) {
      // Slight delay before showing the banner for better UX
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    setIsVisible(false);
    setHasInteracted(true);
    localStorage.setItem('cookieConsentStatus', 'accepted');
    onAccept();
  };

  const handleDecline = () => {
    setIsVisible(false);
    setHasInteracted(true);
    localStorage.setItem('cookieConsentStatus', 'declined');
    onDecline();
  };

  // If user has interacted or banner shouldn't be visible, don't render
  if (hasInteracted || !isVisible) {
    return null;
  }

  return (
    <div 
      className={`fixed bottom-0 left-0 right-0 transition-all duration-700 ease-in-out z-50 ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-0">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-t-xl shadow-2xl">
          <div className="px-6 py-6 sm:px-8 flex flex-col sm:flex-row items-center justify-between">
            <div className="flex items-start sm:items-center mb-5 sm:mb-0 sm:mr-8">
              <div className="flex-shrink-0 mr-4 hidden sm:block">
                <svg className="h-8 w-8 text-blue-100" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-medium text-white">Cookie Consent</h3>
                <p className="mt-1 text-sm text-blue-100">
                  We use cookies to enhance your experience, analyze site traffic, and personalize content.
                  By continuing to browse, you consent to our use of cookies as described in our{' '}
                  <a href="/privacy-policy" className="text-white underline hover:text-blue-200 font-medium">
                    Privacy Policy
                  </a>.
                </p>
              </div>
            </div>
            <div className="flex flex-shrink-0 space-x-3">
              <button
                onClick={handleDecline}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-indigo-700 focus:ring-white transition-colors duration-150"
              >
                Decline
              </button>
              <button
                onClick={handleAccept}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-500 hover:bg-indigo-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-indigo-700 focus:ring-indigo-400 shadow-sm transition-colors duration-150"
              >
                Accept All Cookies
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
