import React from 'react';

const Navbar: React.FC = () => {
  return (
    <nav className="w-full bg-white shadow-md fixed top-0 left-0 z-10">
      <div className="container mx-auto flex justify-between items-center p-4">
        <h1 className="text-xl font-bold text-gray-800">Secondary School Platform</h1>
        <div>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
