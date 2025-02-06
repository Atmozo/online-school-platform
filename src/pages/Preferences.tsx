import React, { useState } from 'react';
import axios from 'axios';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/auth/login', { username, password });
      setToken(response.data.token);
      alert('Login successful');
    } catch (error) {
      console.error(error);
      alert('Invalid credentials');
    }
  };

  const handleLogout = () => {
    setToken(null);
    alert('Logged out successfully');
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      {!token ? (
        <form onSubmit={handleSubmit}>
          <h1 className="text-xl font-bold mb-4">Login</h1>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="block w-full p-2 mb-4 border border-gray-300 rounded"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="block w-full p-2 mb-4 border border-gray-300 rounded"
            required
          />
          <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">
            Login
          </button>
        </form>
      ) : (
        <div>
          <p className="text-lg mb-4">Welcome, {username}!</p>
          <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded">
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default Login;
