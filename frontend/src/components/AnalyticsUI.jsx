import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { BarChart, Bar } from 'recharts';

// Sample data
const ticketTrends = [
  { name: 'Mon', value: 4 },
  { name: 'Tue', value: 7 },
  { name: 'Wed', value: 5 },
  { name: 'Thu', value: 8 },
  { name: 'Fri', value: 6 }
];

const topIssues = [
  { issue: 'Login Issues', count: 8 },
  { issue: 'Payment Failed', count: 6 },
  { issue: 'Reset Password', count: 5 },
  { issue: 'Account Setup', count: 4 }
];

const AnalyticsDashboard = () => {
  return (
    <div className="p-6 space-y-6 bg-gray-50">
      <h2 className="text-2xl font-bold mb-6">Analytics Dashboard</h2>
      
      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Tickets Resolved */}
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium">Total Tickets Resolved</h3>
            <span className="text-green-500">✓</span>
          </div>
          <div className="text-2xl font-bold">7</div>
          <p className="text-xs text-gray-500">+2 from yesterday</p>
        </div>

        {/* Customer Satisfaction */}
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium">Customer Satisfaction</h3>
            <span className="text-blue-500">👤</span>
          </div>
          <div className="text-2xl font-bold">4.8/5</div>
          <p className="text-xs text-gray-500">Based on 6 reviews</p>
        </div>

        {/* Escalation Rate */}
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium">Escalation Rate</h3>
            <span className="text-orange-500">↗</span>
          </div>
          <div className="text-2xl font-bold">15%</div>
          <p className="text-xs text-gray-500">3 escalations today</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Ticket Volume Trend */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium mb-4">Volume of Requests</h3>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={ticketTrends}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#2563eb"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Issues */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium mb-4">Top Customer Issues</h3>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topIssues}>
                <XAxis dataKey="issue" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;