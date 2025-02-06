import React from 'react';
import SideNav from './SideNav';

const Layout: React.FC = ({ children }) => {
  return (
    <div className="flex">
      <SideNav />
      <div className="flex-grow p-6 bg-gray-50 min-h-screen">{children}</div>
    </div>
  );
};

export default Layout;
