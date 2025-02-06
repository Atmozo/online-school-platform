import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';

const UserStatsWidget: React.FC = () => {
  return (
    <Card className="shadow-md">
      <CardContent>
        <Typography variant="h5" className="text-blue-600 font-bold">
          User Stats
        </Typography>
        <Typography variant="body1">Active Projects: 5</Typography>
        <Typography variant="body1">Completed Tasks: 23</Typography>
      </CardContent>
    </Card>
  );
};

export default UserStatsWidget;
