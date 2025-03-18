// import React, { useState } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { 
//   BookOpen, 
//   LayoutDashboard, 
//   FolderKanban, 
//   BrainCircuit, 
//   Settings, 
//   ChevronLeft,
//   Menu,
//   GraduationCap,
//   LogOut
// } from 'lucide-react';

// interface SidebarProps {
//   brandName?: string;
// }

// const menuItems = [
//   { icon: BookOpen, title: 'Courses', path: '/' },
//   { icon: LayoutDashboard, title: 'Dashboard', path: '/dashboard' },
//   { icon: FolderKanban, title: 'Projects', path: '/projects' },
//   { icon: BrainCircuit, title: 'Quizzes', path: '/quizzes' },
//   { icon: Settings, title: 'Settings', path: '/settings' }
// ];

// const Sidebar: React.FC<SidebarProps> = ({ brandName = 'EduLearn' }) => {
//   const [isOpen, setIsOpen] = useState(false);

//   const sidebarVariants = {
//     open: {
//       x: 0,
//       transition: { type: "spring", stiffness: 200, damping: 24 }
//     },
//     closed: {
//       x: "-100%",
//       transition: { type: "spring", stiffness: 300, damping: 35 }
//     }
//   };

//   const menuItemVariants = {
//     open: {
//       x: 0,
//       opacity: 1,
//       transition: { type: "spring", stiffness: 250, damping: 24 }
//     },
//     closed: { x: -20, opacity: 0 }
//   };

//   return (
//     <div className="relative">
//       {/* Mobile Header */}
//       <div className="md:hidden flex items-center p-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
//         <GraduationCap className="w-6 h-6" />
//         <h2 className="text-lg font-bold ml-2">{brandName}</h2>
//         <button 
//           onClick={() => setIsOpen(!isOpen)}
//           className="ml-auto rounded-full p-2 hover:bg-blue-500 transition-colors"
//         >
//           <Menu className="w-6 h-6" />
//         </button>
//       </div>

//       {/* Sidebar */}
//       <motion.div
//         initial={false}
//         animate={isOpen ? "open" : "closed"}
//         variants={sidebarVariants}
//         className="fixed top-0 left-0 h-screen w-72 bg-gradient-to-b from-blue-600 to-blue-700 text-white p-6 shadow-2xl md:translate-x-0 md:relative z-50"
//       >
//         <div className="flex items-center justify-between mb-8">
//           <motion.div className="flex items-center" initial={{ x: 0 }} animate={{ x: 0 }}>
//             <GraduationCap className="w-8 h-8" />
//             <h2 className="text-xl font-bold ml-2">{brandName}</h2>
//           </motion.div>
//           <button 
//             onClick={() => setIsOpen(false)}
//             className="md:hidden p-2 rounded-full hover:bg-blue-500 transition-colors"
//           >
//             <ChevronLeft className="w-6 h-6" />
//           </button>
//         </div>

//         <nav>
//           <motion.ul className="space-y-2">
//             {menuItems.map((item, index) => (
//               <motion.li
//                 key={item.path}
//                 variants={menuItemVariants}
//                 custom={index}
//                 whileHover={{ x: 5 }}
//                 className="md:opacity-100 md:translate-x-0"
//               >
//                 <a 
//                   href={item.path}
//                   className="flex items-center p-3 rounded-lg hover:bg-blue-500 transition-all duration-200 group"
//                 >
//                   <item.icon className="w-5 h-5 mr-3 transition-transform group-hover:scale-110" />
//                   <span className="font-medium">{item.title}</span>
//                 </a>
//               </motion.li>
//             ))}
//           </motion.ul>
//         </nav>

//         <motion.div 
//           className="absolute bottom-8 left-6 right-6"
//           initial={{ opacity: 1 }}
//           animate={{ opacity: 1 }}
//         >
//           <button className="flex items-center w-full p-3 rounded-lg hover:bg-blue-500 transition-colors text-red-200 hover:text-white group">
//             <LogOut className="w-5 h-5 mr-3 transition-transform group-hover:scale-110" />
//             <span className="font-medium">Logout</span>
//           </button>
//         </motion.div>
//       </motion.div>

//       {/* Overlay */}
//       <AnimatePresence>
//         {isOpen && (
//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             transition={{ duration: 0.2 }}
//             className="fixed inset-0 bg-black/50 z-40 md:hidden"
//             onClick={() => setIsOpen(false)}
//           />
//         )}
//       </AnimatePresence>
//     </div>
//   );
// };

// export default Sidebar;
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  LayoutDashboard,
  FolderKanban,
  BrainCircuit,
  GraduationCap,
  LogOut,
  WifiHigh,
  NotepadTextIcon,
  Menu,
  X
} from 'lucide-react';

interface SidebarProps {
  brandName?: string;
}

const menuItems = [
  { icon: BookOpen, title: 'Courses', path: '/' },
  { icon: LayoutDashboard, title: 'Dashboard', path: '/dashboard' },
  { icon: FolderKanban, title: 'Projects', path: '/projects' },
  { icon: BrainCircuit, title: 'Quizzes', path: '/quizzes' },
  { icon: NotepadTextIcon, title: 'Tasks', path: '/task' },
  { icon: WifiHigh, title: 'Live', path: '/live' },
];

const sidebarVariants = {
  open: {
    x: 0,
    transition: {
      type: 'spring',
      stiffness: 200,
      damping: 24,
      when: 'beforeChildren',
      staggerChildren: 0.1
    },
  },
  closed: {
    x: '-100%',
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 30,
      when: 'afterChildren',
    },
  }
};

const menuItemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 300, damping: 20 } },
};

const Sidebar: React.FC<SidebarProps> = ({ brandName = 'Learn' }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const SidebarContent = () => (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={sidebarVariants}
      className="flex flex-col h-full"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center">
          <GraduationCap className="w-10 h-10" />
          <h2 className="text-2xl font-bold ml-3">{brandName}</h2>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1">
        <motion.ul className="space-y-4">
          {menuItems.map((item) => (
            <motion.li key={item.path} variants={menuItemVariants}>
              <a
                href={item.path}
                className="flex items-center p-4 rounded-lg hover:bg-blue-700 transition-all duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <item.icon className="w-6 h-6 mr-4 transition-transform hover:scale-110" />
                <span className="text-lg font-medium">{item.title}</span>
              </a>
            </motion.li>
          ))}
        </motion.ul>
      </nav>

      {/* Logout Section */}
      <div className="mt-auto pt-8 border-t border-blue-500">
        <button className="flex items-center w-full p-4 rounded-lg hover:bg-blue-700 transition-colors text-red-300 hover:text-white">
          <LogOut className="w-6 h-6 mr-4 transition-transform hover:scale-110" />
          <span className="text-lg font-medium">LOGOUT
        </span>
        </button>
      </div>
    </motion.div>
  );

  return (
    <>
      {/* Mobile Burger Menu Button */}
<button
  onClick={toggleMobileMenu}
  className="fixed top-4 right-4 z-50 p-2 rounded-1g bg-blue-500 text-white m d:hidden hover:bg-blue-700 transition-colors flex items-center"
>
{/*   <span className="mr-2">MENU</span> */}
  {isMobileMenuOpen ? (
    <X className="w-6 h-6" />
  ) : (
    <Menu className="w-8 h-8" />
  )}
  
</button>



      {/* Desktop Sidebar */}
      <div className="hidden md:block fixed top-0 left-0 h-screen w-80 bg-blue-600 text-white p-8 shadow-2xl z-40">
        <SidebarContent />
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/50 z-30 md:hidden"
            />
            
            {/* Mobile Menu */}
            <motion.div
              initial="closed"
              animate="open"
              exit="closed"
              variants={sidebarVariants}
              className="fixed top-0 left-0 h-screen w-[280px] bg-blue-600 text-white p-8 shadow-2xl z-40 md:hidden"
            >
              <SidebarContent />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
