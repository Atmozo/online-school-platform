
import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import LiveClass from './LiveClass'; // Adjust the import path as needed

const JoinClassroom = () => {
  const [userName, setUserName] = useState('');
  const [role, setRole] = useState('student');
  const [roomId, setRoomId] = useState('');
  const [userId] = useState(`user-${Math.random().toString(36).substr(2, 9)}`);
  const [hasJoined, setHasJoined] = useState(false);

  const roomOptions = [
    { id: 'manual-testing', name: 'Manual Testing' },
    { id: 'automation-testing', name: 'Automation Testing' },
    { id: 'java-basics', name: 'Java Basics' },
    { id: 'js-basics', name: 'JS Basics' },
    { id: 'python-basics', name: 'Python Basics' }
  ];

  const handleJoin = () => {
    if (userName.trim() && roomId) {
      setHasJoined(true);
    }
  };

  if (hasJoined) {
    return (
      <LiveClass 
        roomId={roomId} 
        userId={userId} 
        userName={userName} 
        role={role as 'instructor' | 'student'} 
      />
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Join Virtual Classroom</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Your Name</Label>
            <Input 
              id="username" 
              placeholder="Enter your name" 
              value={userName} 
              onChange={(e) => setUserName(e.target.value)} 
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label>Select Role</Label>
            <RadioGroup value={role} onValueChange={setRole} className="flex space-x-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="student" id="student" />
                <Label htmlFor="student">Student</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="instructor" id="instructor" />
                <Label htmlFor="instructor">Instructor</Label>
              </div>
            </RadioGroup>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="room">Select Room</Label>
            <Select value={roomId} onValueChange={setRoomId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a room" />
              </SelectTrigger>
              <SelectContent>
                {roomOptions.map(room => (
                  <SelectItem key={room.id} value={room.id}>{room.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            className="w-full" 
            onClick={handleJoin}
            disabled={!userName.trim() || !roomId}
          >
            Join Classroom
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default JoinClassroom;
