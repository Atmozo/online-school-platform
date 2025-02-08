import React, { useState, useEffect } from 'react';
import {
  Calendar,
  MessageSquare,
  UserCheck,
  CheckSquare,
  Plus,
  X
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const TaskManagementSystem = () => {
  // Calendar State
  const [events, setEvents] = useState([
    { id: 1, title: 'Java Class', date: '2025-02-06', time: '10:00' },
    { id: 2, title: 'Python Lab', date: '2025-02-07', time: '14:00' },
  ]);
  
  // Messages State
  const [messages, setMessages] = useState([
    { id: 1, sender: 'Aldrine', content: 'When is the next assignment due?', time: '09:30' },
    { id: 2, sender: 'Teacher', content: 'Next Friday at 5 PM', time: '09:35' },
  ]);
  
  // Attendance State
  const [attendance, setAttendance] = useState([
    { id: 1, student: 'Fran mozo', present: true, date: '2025-02-06' },
    { id: 2, student: 'Brian Ryn', present: false, date: '2025-02-06' },
  ]);
  
  // Tasks State
  const [tasks, setTasks] = useState([
    { id: 1, title: 'Complete java001 Assignment', status: 'pending', due: '2025-02-10' },
    { id: 2, title: 'Submit Matlib Report', status: 'completed', due: '2025-02-08' },
  ]);

  // New Event/Message/Task Form States
  const [newEvent, setNewEvent] = useState({ title: '', date: '', time: '' });
  const [newMessage, setNewMessage] = useState('');
  const [newTask, setNewTask] = useState({ title: '', due: '' });

  const addEvent = () => {
    if (newEvent.title && newEvent.date && newEvent.time) {
      setEvents([...events, { id: events.length + 1, ...newEvent }]);
      setNewEvent({ title: '', date: '', time: '' });
    }
  };

  const addMessage = () => {
    if (newMessage) {
      setMessages([
        ...messages,
        {
          id: messages.length + 1,
          sender: 'You',
          content: newMessage,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      setNewMessage('');
    }
  };

  const addTask = () => {
    if (newTask.title && newTask.due) {
      setTasks([
        ...tasks,
        {
          id: tasks.length + 1,
          ...newTask,
          status: 'pending'
        }
      ]);
      setNewTask({ title: '', due: '' });
    }
  };

  const toggleTaskStatus = (taskId: number) => {
    setTasks(tasks.map(task => 
      task.id === taskId 
        ? { ...task, status: task.status === 'completed' ? 'pending' : 'completed' }
        : task
    ));
  };

  const toggleAttendance = (studentId: number) => {
    setAttendance(attendance.map(record =>
      record.id === studentId
        ? { ...record, present: !record.present }
        : record
    ));
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <Tabs defaultValue="calendar">
        <TabsList className="grid w-full grid-cols-4 mb-4">
          <TabsTrigger value="calendar">
            <Calendar className="h-4 w-4 mr-2" />
            Calendar
          </TabsTrigger>
          <TabsTrigger value="messages">
            <MessageSquare className="h-4 w-4 mr-2" />
            Messages
          </TabsTrigger>
          <TabsTrigger value="attendance">
            <UserCheck className="h-4 w-4 mr-2" />
            Attendance
          </TabsTrigger>
          <TabsTrigger value="tasks">
            <CheckSquare className="h-4 w-4 mr-2" />
            Tasks
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calendar">
          <Card>
            <CardHeader>
              <CardTitle>Calendar</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex gap-2">
                <Input
                  placeholder="Event Title"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                />
                <Input
                  type="date"
                  value={newEvent.date}
                  onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                />
                <Input
                  type="time"
                  value={newEvent.time}
                  onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                />
                <Button onClick={addEvent}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-2">
                {events.map(event => (
                  <div key={event.id} className="flex items-center justify-between p-2 border rounded">
                    <div>
                      <h3 className="font-medium">{event.title}</h3>
                      <p className="text-sm text-gray-500">
                        {new Date(event.date).toLocaleDateString()} at {event.time}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEvents(events.filter(e => e.id !== event.id))}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="messages">
          <Card>
            <CardHeader>
              <CardTitle>Messages</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="h-64 overflow-y-auto space-y-2 mb-4">
                  {messages.map(message => (
                    <div
                      key={message.id}
                      className={`p-2 rounded ${
                        message.sender === 'You' 
                          ? 'bg-blue-100 ml-auto' 
                          : 'bg-gray-100'
                      } max-w-[80%] ${
                        message.sender === 'You' ? 'ml-auto' : ''
                      }`}
                    >
                      <p className="text-sm font-medium">{message.sender}</p>
                      <p>{message.content}</p>
                      <p className="text-xs text-gray-500">{message.time}</p>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addMessage()}
                  />
                  <Button onClick={addMessage}>Send</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendance">
          <Card>
            <CardHeader>
              <CardTitle>Attendance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {attendance.map(record => (
                  <div key={record.id} className="flex items-center justify-between p-2 border rounded">
                    <div>
                      <h3 className="font-medium">{record.student}</h3>
                      <p className="text-sm text-gray-500">
                        {new Date(record.date).toLocaleDateString()}
                      </p>
                    </div>
                    <Button
                      variant={record.present ? 'default' : 'outline'}
                      onClick={() => toggleAttendance(record.id)}
                    >
                      {record.present ? 'Present' : 'Absent'}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks">
          <Card>
            <CardHeader>
              <CardTitle>Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex gap-2">
                <Input
                  placeholder="Task Title"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                />
                <Input
                  type="date"
                  value={newTask.due}
                  onChange={(e) => setNewTask({ ...newTask, due: e.target.value })}
                />
                <Button onClick={addTask}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-2">
                {tasks.map(task => (
                  <div key={task.id} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleTaskStatus(task.id)}
                      >
                        <CheckSquare className={`h-4 w-4 ${
                          task.status === 'completed' ? 'text-green-500' : ''
                        }`} />
                      </Button>
                      <div>
                        <h3 className={`font-medium ${
                          task.status === 'completed' ? 'line-through text-gray-500' : ''
                        }`}>
                          {task.title}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Due: {new Date(task.due).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Badge variant={task.status === 'completed' ? 'default' : 'outline'}>
                      {task.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TaskManagementSystem;