import React, { createContext, useState, useEffect, useContext } from 'react';

type UserProfile = {
  name: string;
  email: string;
  phone: string;
};

type UserPreferences = {
  theme: string;
  notifications: boolean;
  language: string;
};

type UserContextType = {
  profile: UserProfile;
  preferences: UserPreferences;
  updateProfile: (updatedProfile: UserProfile) => void;
  updatePreferences: (updatedPreferences: UserPreferences) => void;
};

const defaultProfile: UserProfile = {
  name: 'John Doe',
  email: 'johndoe@example.com',
  phone: '123-456-7890',
};

const defaultPreferences: UserPreferences = {
  theme: 'light',
  notifications: true,
  language: 'en',
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<UserProfile>(() => {
    const savedProfile = localStorage.getItem('userProfile');
    return savedProfile ? JSON.parse(savedProfile) : defaultProfile;
  });

  const [preferences, setPreferences] = useState<UserPreferences>(() => {
    const savedPreferences = localStorage.getItem('userPreferences');
    return savedPreferences ? JSON.parse(savedPreferences) : defaultPreferences;
  });

  const updateProfile = (updatedProfile: UserProfile) => {
    setProfile(updatedProfile);
    localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
  };

  const updatePreferences = (updatedPreferences: UserPreferences) => {
    setPreferences(updatedPreferences);
    localStorage.setItem('userPreferences', JSON.stringify(updatedPreferences));
  };

  return (
    <UserContext.Provider value={{ profile, preferences, updateProfile, updatePreferences }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser must be used within a UserProvider');
  return context;
};
