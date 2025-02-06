import React from 'react';
import { Card, CardContent, Typography, List, ListItem, ListItemButton, ListItemText } from '@mui/material';

const QuickLinksWidget: React.FC = () => {
  return (
    <Card className="shadow-md">
      <CardContent>
        <Typography variant="h5" className="text-blue-600 font-bold">
          Quick Links
        </Typography>
        <List>
          <ListItem>
            <ListItemButton component="a" href="/projects">
              <ListItemText primary="View Projects" />
            </ListItemButton>
          </ListItem>
          <ListItem>
            <ListItemButton component="a" href="/tasks">
              <ListItemText primary="Manage Tasks" />
            </ListItemButton>
          </ListItem>
          <ListItem>
            <ListItemButton component="a" href="/settings">
              <ListItemText primary="Account Settings" />
            </ListItemButton>
          </ListItem>
        </List>
      </CardContent>
    </Card>
  );
};

export default QuickLinksWidget;
