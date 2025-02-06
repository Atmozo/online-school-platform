import React, { useState } from 'react';
import {
  BarChart,
  Star,
  Trophy,
  Clock,
  CheckCircle,
  Code,
  Database,
  Globe,
  TestTube,
  LineChart,
  Coffee
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import {
  BarChart as ReBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart as ReLineChart,
  Line
} from 'recharts';

const ProjectsDashboard = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // Sample data
  const projects = [
    {
      id: 1,
      title: "Machine Learning Image Classifier",
      category: "python",
      type: "milestone",
      status: "completed",
      progress: 100,
      rating: 4.8,
      reviews: [
        { teacher: "DR Samuel", comment: "Excellent implementation!", rating: 5 },
        { teacher: "Prof. Aldrine", comment: "Great documentation", rating: 4.5 }
      ],
      difficulty: "advanced",
      completedDate: "2025-01-15"
    },
    {
      id: 2,
      title: "E-commerce Platform",
      category: "web",
      type: "best",
      status: "in-progress",
      progress: 75,
      rating: 4.5,
      reviews: [
        { teacher: "Dr. Mvet", comment: "Good progress!", rating: 4.5 }
      ],
      difficulty: "intermediate",
      completedDate: null
    },
    // Add more sample projects...
  ];

  const analyticsData = [
    { month: 'Jan', completed: 4, started: 6 },
    { month: 'Feb', completed: 6, started: 8 },
    { month: 'Mar', completed: 8, started: 10 },
    { month: 'Apr', completed: 5, started: 7 },
  ];

  const categoryIcons = {
    python: <Code className="h-4 w-4" />,
    java: <Coffee className="h-4 w-4" />,
    web: <Globe className="h-4 w-4" />,
    data: <Database className="h-4 w-4" />,
    testing: <TestTube className="h-4 w-4" />,
  };

  const getProjectsByType = (type: string) => {
    return projects.filter(project => 
      (selectedCategory === 'all' || project.category === selectedCategory) &&
      (type === 'all' || project.type === type)
    );
  };

  interface Project {
    id: number;
    title: string;
    category: string;
    type: string;
    status: string;
    progress: number;
    rating: number;
    reviews: { teacher: string; comment: string; rating: number }[];
    difficulty: string;
    completedDate: string | null;
  }

  const ProjectCard = ({ project }: { project: Project }) => (
    <Card className="mb-4">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{project.title}</CardTitle>
            <div className="flex gap-2 mt-2">
              <Badge>{project.category}</Badge>
              <Badge variant={project.status === 'completed' ? 'default' : 'outline'}>
                {project.status}
              </Badge>
              <Badge variant="secondary">{project.difficulty}</Badge>
            </div>
          </div>
          <div className="flex items-center">
            <Star className="h-4 w-4 text-yellow-400 mr-1" />
            <span>{project.rating}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mt-2">
          <div className="flex justify-between mb-2">
            <span className="text-sm text-gray-500">Progress</span>
            <span className="text-sm font-medium">{project.progress}%</span>
          </div>
          <Progress value={project.progress} className="h-2" />
        </div>
        {project.reviews?.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium mb-2">Teacher Reviews</h4>
            <div className="space-y-2">
              {project.reviews.map((review: { teacher: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; rating: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; comment: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; }, idx: React.Key | null | undefined) => (
                <div key={idx} className="bg-gray-50 p-2 rounded">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">{review.teacher}</span>
                    <div className="flex items-center">
                      <Star className="h-3 w-3 text-yellow-400 mr-1" />
                      <span className="text-sm">{review.rating}</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{review.comment}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Projects Dashboard</h1>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="python">Python</SelectItem>
            <SelectItem value="java">Java</SelectItem>
            <SelectItem value="web">Web Development</SelectItem>
            <SelectItem value="data">Data Science</SelectItem>
            <SelectItem value="testing">QA Testing</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm text-gray-500">Total Projects</p>
              <p className="text-2xl font-bold">{projects.length}</p>
            </div>
            <Code className="h-8 w-8 text-blue-500" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm text-gray-500">Completed</p>
              <p className="text-2xl font-bold">
                {projects.filter(p => p.status === 'completed').length}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm text-gray-500">In Progress</p>
              <p className="text-2xl font-bold">
                {projects.filter(p => p.status === 'in-progress').length}
              </p>
            </div>
            <Clock className="h-8 w-8 text-orange-500" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm text-gray-500">Average Rating</p>
              <p className="text-2xl font-bold">
                {(projects.reduce((acc, curr) => acc + curr.rating, 0) / projects.length).toFixed(1)}
              </p>
            </div>
            <Star className="h-8 w-8 text-yellow-500" />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Project Completion Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <ReBarChart data={analyticsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="completed" fill="#4CAF50" name="Completed" />
                  <Bar dataKey="started" fill="#2196F3" name="Started" />
                </ReBarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Category Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <ReLineChart data={analyticsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="completed" stroke="#4CAF50" />
                </ReLineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all">
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Projects</TabsTrigger>
          <TabsTrigger value="milestone">Milestone Projects</TabsTrigger>
          <TabsTrigger value="best">Best Projects</TabsTrigger>
          <TabsTrigger value="completed">Completed Projects</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {getProjectsByType('all').map(project => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="milestone">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {getProjectsByType('milestone').map(project => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="best">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {getProjectsByType('best').map(project => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="completed">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projects
              .filter(p => p.status === 'completed' && 
                (selectedCategory === 'all' || p.category === selectedCategory))
              .map(project => (
                <ProjectCard key={project.id} project={project} />
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProjectsDashboard;