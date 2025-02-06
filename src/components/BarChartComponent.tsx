import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface BarChartProps {
  tasks: { name: string; status: 'Pending' | 'Completed' }[];
}

const BarChartComponent: React.FC<BarChartProps> = ({ tasks }) => {
  const completedTasks = tasks.filter((task) => task.status === 'Completed');
  const data = completedTasks.map((task, index) => ({
    name: `Task ${index + 1}`,
    Completed: 1,
  }));

  return (
    <div className="p-6 bg-white rounded-md shadow-md">
      <h2 className="text-xl font-semibold mb-4">Task Completion Trends</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="Completed" fill="#82ca9d" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BarChartComponent;
