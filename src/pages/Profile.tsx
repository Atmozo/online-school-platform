// import React, { useState } from 'react';
// import { toast } from 'react-toastify';

// const Profile: React.FC = () => {
//   const [profile, setProfile] = useState({
//     name: '',
//     email: '',
//     phone: '',
//   });

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setProfile({ ...profile, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     // Save profile data logic here
//     toast.success('Profile saved successfully!', {
//       position: toast.POSITION.TOP_CENTER,
//       autoClose: 2000,
//     });
//   };

//   return (
//     <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-lg">
//       <h1 className="text-3xl font-semibold text-gray-800 mb-6">Profile</h1>
//       <form onSubmit={handleSubmit} className="space-y-4">
//         <div>
//           <label htmlFor="name" className="block text-gray-700 font-medium mb-2">
//             Name
//           </label>
//           <input
//             type="text"
//             id="name"
//             name="name"
//             value={profile.name}
//             onChange={handleChange}
//             placeholder="Enter name"
//             className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//           />
//         </div>

//         <div>
//           <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
//             Email
//           </label>
//           <input
//             type="email"
//             id="email"
//             name="email"
//             value={profile.email}
//             onChange={handleChange}
//             placeholder="Enter email"
//             className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//           />
//         </div>

//         <div>
//           <label htmlFor="phone" className="block text-gray-700 font-medium mb-2">
//             Phone
//           </label>
//           <input
//             type="tel"
//             id="phone"
//             name="phone"
//             value={profile.phone}
//             onChange={handleChange}
//             placeholder="Enter phone"
//             className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//           />
//         </div>

//         <div className="flex justify-end">
//           <button
//             type="submit"
//             className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
//           >
//             Save
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// };

// export default Profile;
// import React, { useState, useEffect } from "react";
// import axios from "axios";

// const Profile: React.FC = () => {
//   const [user, setUser] = useState({ name: "", email: "", password: "" });

//   useEffect(() => {
//     // Fetch user profile data
//     const fetchUserProfile = async () => {
//       try {
//         const response = await axios.get("http://localhost:5000/api/user/profile");
//         setUser(response.data);
//       } catch (error) {
//         console.error("Error fetching profile data:", error);
//       }
//     };

//     fetchUserProfile();
//   }, []);

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setUser({ ...user, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     try {
//       await axios.put("http://localhost:5000/api/user/profile", user);
//       alert("Profile updated successfully!");
//     } catch (error) {
//       console.error("Error updating profile:", error);
//     }
//   };

//   return (
//     <div className="max-w-lg mx-auto mt-10 p-6 bg-white shadow-md rounded-md">
//       <h2 className="text-2xl font-bold mb-4">Edit Profile</h2>
//       <form onSubmit={handleSubmit}>
//         <label className="block mb-2">Name</label>
//         <input
//           type="text"
//           name="name"
//           value={user.name}
//           onChange={handleChange}
//           className="w-full p-2 border border-gray-300 rounded mb-4"
//         />

//         <label className="block mb-2">Email</label>
//         <input
//           type="email"
//           name="email"
//           value={user.email}
//           onChange={handleChange}
//           className="w-full p-2 border border-gray-300 rounded mb-4"
//         />

//         <label className="block mb-2">New Password</label>
//         <input
//           type="password"
//           name="password"
//           value={user.password}
//           onChange={handleChange}
//           className="w-full p-2 border border-gray-300 rounded mb-4"
//         />

//         <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">Save Changes</button>
//       </form>
//     </div>
//   );
// };

// export default Profile;
import { useState, useEffect } from "react";
import axios from "axios";

const Profile = () => {
  const [user, setUser] = useState({ username: "", email: "" });
  const [newPassword, setNewPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const { data } = await axios.get("http://localhost:5000/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser({ username: data.username, email: data.email });
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };

    fetchProfile();
  }, []);

  const handleProfileUpdate = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.put("https://online-school-platform.onrender.com/profile", user, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Profile updated!");
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const handleChangePassword = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        "http://localhost:5000/change-password",
        { currentPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Password changed!");
    } catch (error) {
      console.error("Error changing password:", error);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Profile</h1>

      <div className="mt-4">
        <label className="block">Username</label>
        <input
          type="text"
          value={user.username}
          onChange={(e) => setUser({ ...user, username: e.target.value })}
          className="border p-2 w-full"
        />

        <label className="block mt-2">Email</label>
        <input
          type="email"
          value={user.email}
          onChange={(e) => setUser({ ...user, email: e.target.value })}
          className="border p-2 w-full"
        />

        <button onClick={handleProfileUpdate} className="mt-4 bg-blue-500 text-white px-4 py-2">
          Update Profile
        </button>
      </div>

      <div className="mt-6">
        <h2 className="text-xl font-semibold">Change Password</h2>
        <label className="block">Current Password</label>
        <input
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          className="border p-2 w-full"
        />
        

        <label className="block mt-2">New Password</label>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="border p-2 w-full"
        />
        

        <button onClick={handleChangePassword} className="mt-4 bg-red-500 text-white px-4 py-2">
          Change Password
        </button>
      </div>
    </div>
  );
};

export default Profile;
