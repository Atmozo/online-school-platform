import React, { useEffect, useState } from 'react';
import { Typography, Box, List, ListItem, Paper } from '@mui/material';

type Task = {
  text: string;
  completed: boolean;
};

const TaskHistory: React.FC = () => {
  const username = localStorage.getItem('username') || 'Guest';
  const [completedTasks, setCompletedTasks] = useState<Task[]>([]);

  useEffect(() => {
    const storedTasks = localStorage.getItem(`tasks-${username}`);
    if (storedTasks) {
      const tasks = JSON.parse(storedTasks);
      setCompletedTasks(tasks.filter((task: Task) => task.completed));
    }
  }, [username]);

  return (
    <Box className="p-6 bg-gray-100 min-h-screen">
      <Typography
        variant="h4"
        className="text-blue-700 font-bold text-center mb-6"
      >
        Task History
      </Typography>
      <Paper elevation={3} className="p-6 bg-white rounded-lg shadow-md max-w-lg mx-auto">
        <List>
          {completedTasks.length > 0 ? (
            completedTasks.map((task, index) => (
              <ListItem
                key={index}
                className="border-b border-gray-300 py-2"
              >
                {task.text}
              </ListItem>
            ))
          ) : (
            <Typography variant="body1" className="text-gray-600">
              No completed tasks yet.
            </Typography>
          )}
        </List>
      </Paper>
    </Box>
  );
};

export default TaskHistory;
