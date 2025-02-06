import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

interface Task {
  id: number;
  name: string;
  status: 'Pending' | 'Completed';
}

interface PieChartProps {
  tasks: Task[];
}

const COLORS = ['#0088FE', '#FF8042'];

const PieChartComponent: React.FC<PieChartProps> = ({ tasks }) => {
  const data = [
    { name: 'Completed Tasks', value: tasks.filter((task) => task.status === 'Completed').length },
    { name: 'Pending Tasks', value: tasks.filter((task) => task.status === 'Pending').length },
  ];

  return (
    <div className="p-6 bg-white rounded-md shadow-md">
      <h2 className="text-xl font-semibold mb-4">Task Overview</h2>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={100}
            fill="#8884d8"
            label
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PieChartComponent;
