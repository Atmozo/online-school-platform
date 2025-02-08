// import React, { useState } from 'react';
// import { NavLink } from 'react-router-dom';
// import { Drawer, List, ListItem, ListItemText, ListItemIcon,  IconButton, Box } from '@mui/material';
// import { Dashboard, History, Person, Settings, Menu } from '@mui/icons-material';

// const SideNav: React.FC = () => {
//   const [isOpen, setIsOpen] = useState(false);

//   const toggleDrawer = () => {
//     setIsOpen(!isOpen);
//   };

//   const navItems = [
//     { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
//     { text: 'Task History', icon: <History />, path: '/history' },
//     { text: 'User Profile', icon: <Person />, path: '/profile' },
//     { text: 'Preferences', icon: <Settings />, path: '/preferences' },
//   ];

//   return (
//     <Box>
//       {/* Hamburger Icon for Small Screens */}
//       <IconButton className="block md:hidden" onClick={toggleDrawer}>
//         <Menu />
//       </IconButton>

//       {/* Drawer for Small Screens */}
//       <Drawer anchor="left" open={isOpen} onClose={toggleDrawer}>
//         <Box className="w-60">
//           <List>
//             {navItems.map((item) => (
//               <NavLink
//                 to={item.path}
//                 key={item.text}
//                 className="no-underline text-gray-700 hover:text-blue-700"
//               >
//                 <ListItem button>
//                   <ListItemIcon>{item.icon}</ListItemIcon>
//                   <ListItemText primary={item.text} />
//                 </ListItem>
//               </NavLink>
//             ))}
//           </List>
//         </Box>
//       </Drawer>

//       {/* Sidebar for Larger Screens */}
//       <Box
//         className="hidden md:flex flex-col h-screen w-60 bg-gray-100 shadow-md"
//         role="navigation"
//       >
//         <List>
//           {navItems.map((item) => (
//             <NavLink
//               to={item.path}
//               key={item.text}
//               className={({ isActive }) =>
//                 `no-underline p-4 flex items-center ${
//                   isActive ? 'text-blue-700 font-bold' : 'text-gray-700'
//                 } hover:text-blue-500`
//               }
//             >
//               <ListItemIcon>{item.icon}</ListItemIcon>
//               <ListItemText primary={item.text} />
//             </NavLink>
//           ))}
//         </List>
//       </Box>
//     </Box>
//   );
// };

// export default SideNav;
