import React, { useState } from 'react';
import { TextField, Button, List, ListItem, ListItemText, IconButton, Select, MenuItem } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';

interface Task {
  id: number;
  name: string;
  status: 'Pending' | 'Completed';
}

interface TaskManagerProps {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
}

const TaskManager: React.FC<TaskManagerProps> = ({ tasks, setTasks }) => {
  const [task, setTask] = useState('');

  const handleAddTask = async () => {
    if (!task.trim()) return;
    
    try {
      const { data } = await axios.post('/api/tasks', { name: task, status: 'Pending' });
      setTasks([...tasks, data]);
      setTask('');
    } catch (error) {
      console.error('Error adding task', error);
    }
  };

  const handleDeleteTask = async (id: number) => {
    try {
      await axios.delete(`/api/tasks/${id}`);
      setTasks(tasks.filter(task => task.id !== id));
    } catch (error) {
      console.error('Error deleting task', error);
    }
  };

  const handleStatusChange = async (id: number, status: 'Pending' | 'Completed') => {
    try {
      await axios.put(`/api/tasks/${id}`, { status });
      setTasks(tasks.map(task => (task.id === id ? { ...task, status } : task)));
    } catch (error) {
      console.error('Error updating task', error);
    }
  };

  return (
    <div className="p-6 bg-white rounded-md shadow-md">
      <h2 className="text-xl font-semibold mb-4">Task Manager</h2>
      <div className="flex items-center gap-4 mb-4">
        <TextField
          label="New Task"
          variant="outlined"
          value={task}
          onChange={(e) => setTask(e.target.value)}
          fullWidth
        />
        <Button variant="contained" color="primary" onClick={handleAddTask}>
          Add
        </Button>
      </div>
      <List>
        {tasks.map((task) => (
          <ListItem
            key={task.id}
            secondaryAction={
              <>
                <Select
                  value={task.status}
                  onChange={(e) => handleStatusChange(task.id, e.target.value as 'Pending' | 'Completed')}
                  size="small"
                  style={{ marginRight: '8px' }}
                >
                  <MenuItem value="Pending">Pending</MenuItem>
                  <MenuItem value="Completed">Completed</MenuItem>
                </Select>
                <IconButton edge="end" onClick={() => handleDeleteTask(task.id)}>
                  <DeleteIcon />
                </IconButton>
              </>
            }
          >
            <ListItemText primary={task.name} secondary={task.status} />
          </ListItem>
        ))}
      </List>
    </div>
  );
};

export default TaskManager;
