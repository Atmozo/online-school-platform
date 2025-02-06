import  { useState } from 'react';
import { PieChart, Pie, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { User, Book, Calendar, Settings, ChevronRight, Edit2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';


const UserDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  
  // Sample data - replace with actual data from your backend
  const progressData = [
    { name: 'Completed', value: 65 , fill: 'green'},
    { name: 'In Progress', value: 25, fill: 'blue' },
    { name: 'Not Started', value: 10 , fill:'lightred' }];
  const weeklyProgressData = [
    { week: 'Week 1', progress: 20 },
    { week: 'Week 2', progress: 35 },
    { week: 'Week 3', progress: 45 },
    { week: 'Week 4', progress: 65 }
  ];

  const enrolledCourses = [
    { id: 1, name: 'Javascript Basics', progress: 75, nextLesson: ' Arrays Basics' },
    { id: 2, name: 'Advanced Javascript', progress: 45, nextLesson: 'Data Structres' },
    { id: 3, name: 'Python Basics', progress: 90, nextLesson: 'Arithmetics' }
  ];

  return (
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gray-50">
    
      
      {/* Top Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold">Student Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 rounded-full hover:bg-gray-100">
                <Settings className="h-5 w-5" />
              </button>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
                  <User className="h-5 w-5" />
                </div>
                <span className="font-medium">Ashely Mozo</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Progress Overview */}
          <div className="lg:col-span-2 space-y-6">
            {/* Progress Charts */}
            <Card>
              <CardHeader>
                <CardTitle>Learning Progress</CardTitle>
                <CardDescription>Your overall course completion status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={progressData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          // fill="#8884d8"
                          dataKey="value"
                          label
                        >
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={weeklyProgressData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="week" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="progress" stroke="#8884d8" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Enrolled Courses */}
            <Card>
              <CardHeader>
                <CardTitle>Enrolled Courses</CardTitle>
                <CardDescription>Your active courses and progress</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {enrolledCourses.map(course => (
                    <div key={course.id} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-medium">{course.name}</h3>
                          <p className="text-sm text-gray-500">Next: {course.nextLesson}</p>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <span className="text-sm font-medium">{course.progress}%</span>
                            <div className="w-32 h-2 bg-gray-200 rounded-full mt-1">
                              <div
                                className="h-2 bg-blue-500 rounded-full"
                                style={{ width: `${course.progress}%` }}
                              />
                            </div>
                          </div>
                          <ChevronRight className="h-5 w-5 text-gray-400" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Profile & Quick Actions */}
          <div className="space-y-6">
            {/* Profile Card */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Profile</CardTitle>
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="p-2 hover:bg-gray-100 rounded-full"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                </div>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <form className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Full Name</label>
                      <input
                        type="text"
                        defaultValue="Ashely Mozo"
                        className="w-full mt-1 p-2 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Email</label>
                      <input
                        type="email"
                        defaultValue="mozo@example.com"
                        className="w-full mt-1 p-2 border rounded-lg"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Save Changes
                    </button>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center text-white">
                        <User className="h-8 w-8" />
                      </div>
                      <div>
                        <h3 className="font-medium">Ashely mozorandi</h3>
                        <p className="text-sm text-gray-500">Student</p>
                      </div>
                    </div>
                    <div className="pt-4 border-t">
                      <div className="space-y-2">
                        <div>
                          <label className="text-sm text-gray-500">Email</label>
                          <p>test@example.com</p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-500">Joined</label>
                          <p>January 2024</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <Book className="h-5 w-5 text-blue-500" />
                      <span>Courses</span>
                    </div>
                    <span className="font-medium">3</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-5 w-5 text-green-500" />
                      <span>Hours Spent</span>
                    </div>
                    <span className="font-medium">45h</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        
      </div>
    </div>
  </div>
  );
};

export default UserDashboard;

// import React, { useState, useEffect } from "react";
// import { PieChart, Pie, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
// import { User, Book, Calendar, Settings, ChevronRight, Edit2 } from "lucide-react";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// interface Course {
//   id: number;
//   title: string;
//   completed_lessons: number;
//   total_lessons: number;
// }

// const UserDashboard = () => {
//   const [isEditing, setIsEditing] = useState(false);
//   const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);

//   useEffect(() => {
//     const fetchEnrollments = async () => {
//       try {
//         const response = await fetch("http://localhost:5000/api/courses/enrollments/1"); // Replace with actual user ID
//         const data = await response.json();
//         setEnrolledCourses(data);
//       } catch (error) {
//         console.error("Error fetching enrollments:", error);
//       }
//     };

//     fetchEnrollments();
//   }, []);

//   // Calculate progress data for the pie chart
//   const completed = enrolledCourses.reduce((sum, course) => sum + course.completed_lessons, 0);
//   const totalLessons = enrolledCourses.reduce((sum, course) => sum + course.total_lessons, 1);
//   const progressData = [
//     { name: "Completed", value: (completed / totalLessons) * 100, fill: "green" },
//     { name: "Remaining", value: 100 - (completed / totalLessons) * 100, fill: "red" }
//   ];

//   return (
//     <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gray-50">
//       {/* Top Navigation */}
//       <nav className="bg-white shadow-sm">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex justify-between h-16">
//             <div className="flex items-center">
//               <h1 className="text-xl font-semibold">Student Dashboard</h1>
//             </div>
//             <div className="flex items-center space-x-4">
//               <button className="p-2 rounded-full hover:bg-gray-100">
//                 <Settings className="h-5 w-5" />
//               </button>
//               <div className="flex items-center space-x-2">
//                 <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
//                   <User className="h-5 w-5" />
//                 </div>
//                 <span className="font-medium">Ashely Mozo</span>
//               </div>
//             </div>
//           </div>
//         </div>
//       </nav>

//       {/* Main Content */}
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//           {/* Left Column - Progress Overview */}
//           <div className="lg:col-span-2 space-y-6">
//             {/* Progress Charts */}
//             <Card>
//               <CardHeader>
//                 <CardTitle>Learning Progress</CardTitle>
//                 <CardDescription>Your overall course completion status</CardDescription>
//               </CardHeader>
//               <CardContent>
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                   <div className="h-64">
//                     <ResponsiveContainer width="100%" height="100%">
//                       <PieChart>
//                         <Pie data={progressData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} dataKey="value" label />
//                         <Tooltip />
//                         <Legend />
//                       </PieChart>
//                     </ResponsiveContainer>
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>

//             {/* Enrolled Courses */}
//             <Card>
//               <CardHeader>
//                 <CardTitle>Enrolled Courses</CardTitle>
//                 <CardDescription>Your active courses and progress</CardDescription>
//               </CardHeader>
//               <CardContent>
//                 <div className="space-y-4">
//                   {enrolledCourses.length > 0 ? (
//                     enrolledCourses.map((course) => (
//                       <div key={course.id} className="p-4 bg-gray-50 rounded-lg">
//                         <div className="flex justify-between items-center">
//                           <div>
//                             <h3 className="font-medium">{course.title}</h3>
//                             <p className="text-sm text-gray-500">
//                               Progress: {course.completed_lessons}/{course.total_lessons} lessons
//                             </p>
//                           </div>
//                           <div className="flex items-center space-x-4">
//                             <div className="text-right">
//                               <span className="text-sm font-medium">
//                                 {Math.round((course.completed_lessons / course.total_lessons) * 100)}%
//                               </span>
//                               <div className="w-32 h-2 bg-gray-200 rounded-full mt-1">
//                                 <div
//                                   className="h-2 bg-blue-500 rounded-full"
//                                   style={{ width: `${(course.completed_lessons / course.total_lessons) * 100}%` }}
//                                 />
//                               </div>
//                             </div>
//                             <ChevronRight className="h-5 w-5 text-gray-400" />
//                           </div>
//                         </div>
//                       </div>
//                     ))
//                   ) : (
//                     <p>No courses enrolled yet.</p>
//                   )}
//                 </div>
//               </CardContent>
//             </Card>
//           </div>

//           {/* Right Column - Profile & Quick Stats */}
//           <div className="space-y-6">
//             {/* Profile Card */}
//             <Card>
//               <CardHeader>
//                 <div className="flex justify-between items-center">
//                   <CardTitle>Profile</CardTitle>
//                   <button onClick={() => setIsEditing(!isEditing)} className="p-2 hover:bg-gray-100 rounded-full">
//                     <Edit2 className="h-4 w-4" />
//                   </button>
//                 </div>
//               </CardHeader>
//               <CardContent>
//                 {isEditing ? (
//                   <form className="space-y-4">
//                     <div>
//                       <label className="text-sm font-medium">Full Name</label>
//                       <input type="text" defaultValue="Ashely Mozo" className="w-full mt-1 p-2 border rounded-lg" />
//                     </div>
//                     <div>
//                       <label className="text-sm font-medium">Email</label>
//                       <input type="email" defaultValue="mozo@example.com" className="w-full mt-1 p-2 border rounded-lg" />
//                     </div>
//                     <button type="submit" className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
//                       Save Changes
//                     </button>
//                   </form>
//                 ) : (
//                   <div className="space-y-4">
//                     <div className="flex items-center space-x-4">
//                       <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center text-white">
//                         <User className="h-8 w-8" />
//                       </div>
//                       <div>
//                         <h3 className="font-medium">Ashely Mozo</h3>
//                         <p className="text-sm text-gray-500">Student</p>
//                       </div>
//                     </div>
//                   </div>
//                 )}
//               </CardContent>
//             </Card>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default UserDashboard;
