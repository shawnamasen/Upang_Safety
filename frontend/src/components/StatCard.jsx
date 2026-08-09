import React from 'react';
export default function StatCard({ title, value, valueColor = "text-gray-900", icon }) {
  return (
    <div className="bg-white p-5 rounded-lg shadow border border-gray-200 flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-600">{title}</p>
        <p className={`text-2xl font-bold ${valueColor}`}>{value}</p>
      </div>
      <div className="text-2xl">
        {icon}
      </div>
    </div>
  );
}