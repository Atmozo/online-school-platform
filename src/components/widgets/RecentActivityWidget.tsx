import React from 'react';
import { Card, CardContent, Typography, List, ListItem, ListItemText } from '@mui/material';

const RecentActivityWidget: React.FC = () => {
  return (
    <Card className="shadow-md">
      <CardContent>
        <Typography variant="h5" className="text-blue-600 font-bold">
          Recent Activity
        </Typography>
        <List>
          <ListItem>
            <ListItemText primary="Logged in at 10:23 AM" />
          </ListItem>
          <ListItem>
            <ListItemText primary="Updated Profile" />
          </ListItem>
          <ListItem>
            <ListItemText primary="Completed 'React Basics' task" />
          </ListItem>
        </List>
      </CardContent>
    </Card>
  );
};

export default RecentActivityWidget;
