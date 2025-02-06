// import React from 'react';
// import { Card, CardContent, Typography } from '@mui/material';

// interface StatsCardProps {
//   title: string;
//   value: string | number;
//   description: string;
// }

// const StatsCard: React.FC<StatsCardProps> = ({ title, value, description }) => {
//   return (
//     <Card className="shadow-lg hover:shadow-xl transition duration-300">
//       <CardContent>
//         <Typography variant="h6" component="div" className="font-bold mb-2">
//           {title}
//         </Typography>
//         <Typography variant="h4" className="text-blue-600 font-extrabold">
//           {value}
//         </Typography>
//         <Typography variant="body2" className="text-gray-500 mt-2">
//           {description}
//         </Typography>
//       </CardContent>
//     </Card>
//   );
// };

// export default StatsCard;
import React from "react";
import { Card, CardContent, Typography } from "@mui/material";

interface StatsCardProps {
  title: string;
  value: string | number;
  description: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, description }) => {
  return (
    <Card className="shadow-lg hover:shadow-xl transition duration-300">
      <CardContent>
        <Typography variant="h6" component="div" className="font-bold mb-2">
          {title}
        </Typography>
        <Typography variant="h4" className="text-blue-600 font-extrabold">
          {value}
        </Typography>
        <Typography variant="body2" className="text-gray-500 mt-2">
          {description}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default StatsCard;
