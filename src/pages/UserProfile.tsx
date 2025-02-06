import React, { useState } from 'react';
import { Button, TextField, Box, Typography, Avatar, Paper } from '@mui/material';

const UserProfile: React.FC = () => {
  const [username, setUsername] = useState(localStorage.getItem('username') || 'Guest');
  const [email, setEmail] = useState(localStorage.getItem('email') || '');
  const [profilePicture, setProfilePicture] = useState(localStorage.getItem('profilePicture') || '');

  const handleSave = () => {
    localStorage.setItem('username', username);
    localStorage.setItem('email', email);
    localStorage.setItem('profilePicture', profilePicture);
    alert('Profile updated successfully!');
  };

  const handleProfilePictureChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setProfilePicture(result);
      };
      reader.readAsDataURL(event.target.files[0]);
    }
  };

  return (
    <Box className="p-6 bg-gray-100 min-h-screen">
      <Typography variant="h4" className="text-center text-blue-700 mb-6">
        User Profile
      </Typography>
      <Paper elevation={3} className="p-6 bg-white max-w-md mx-auto rounded-lg shadow-md">
        <Box className="flex flex-col items-center mb-4">
          <Avatar
            src={profilePicture}
            alt="Profile"
            className="w-24 h-24 mb-4"
          />
          <Button variant="outlined" component="label">
            Upload Picture
            <input
              type="file"
              hidden
              accept="image/*"
              onChange={handleProfilePictureChange}
            />
          </Button>
        </Box>
        <TextField
          label="Username"
          variant="outlined"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          fullWidth
          className="mb-4"
        />
        <TextField
          label="Email"
          variant="outlined"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          fullWidth
          className="mb-4"
        />
        <Button variant="contained" color="primary" onClick={handleSave} fullWidth>
          Save Changes
        </Button>
      </Paper>
    </Box>
  );
};

export default UserProfile;
