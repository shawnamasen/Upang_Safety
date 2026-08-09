import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar"; 
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import {
  FileText,
  Clock,
  CheckCircle,
  TrendingUp,
  User,
  Calendar,
  MapPin,
} from "lucide-react";

const StatCard = ({ title, value, change, changeType, icon, iconBgColor }) => {
  const isPositive = changeType === "positive";
  return (
    <div className="bg-white p-5 rounded-xl shadow-sm flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-3xl font-bold text-gray-800 mt-1">{value}</p>
        <p
          className={`text-xs mt-2 font-medium ${
            isPositive ? "text-green-500" : "text-red-500"
          }`}
        >
          {change}
        </p>
      </div>
      <div className={`p-4 rounded-full ${iconBgColor}`}>{icon}</div>
    </div>
  );
};

const PriorityBadge = ({ priority }) => {
  // Handle both "high" and "High" formats
  const displayPriority = priority ? priority.charAt(0).toUpperCase() + priority.slice(1).toLowerCase() : 'Low';
  const colors = {
    High: "bg-red-100 text-red-700",
    Medium: "bg-yellow-100 text-yellow-700",
    Low: "bg-blue-100 text-blue-700",
  };
  return (
    <span
      className={`px-2 py-1 text-xs font-semibold rounded-full ${colors[displayPriority] || colors.Low}`}
    >
      {displayPriority}
    </span>
  );
};

const StatusBadge = ({ status }) => {
  const colors = {
    Submitted: "bg-gray-200 text-gray-600",
    Pending: "bg-yellow-100 text-yellow-700",
    "Under Review": "bg-blue-100 text-blue-700",
    Resolved: "bg-green-100 text-green-700",
  };
  return (
    <span
      className={`px-2 py-1 text-xs font-semibold rounded-full ${colors[status] || 'bg-gray-100 text-gray-700'}`}
    >
      {status}
    </span>
  );
};

// --- Main Dashboard ---
const AdminDashboard = () => {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
  const fetchIncidents = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/incidents/admin/all');
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setIncidents(data);
    } catch (err) {
      console.error('Failed to fetch incidents:', err);
      setError('Failed to load reports. Please check if backend is running.');
    } finally {
      setLoading(false);
    }
  };

  fetchIncidents();
}, []);

  const getRecentReports = () => {
    return incidents
      .slice(0, 3)
      .map(incident => ({
        id: incident._id,
        title: incident.title || 'Untitled Report',
        category: incident.category || 'Unknown',
        reporter: incident.Username || incident.UserEmail?.split('@')[0] || 'Anonymous',
        date: incident.createdAt ? new Date(incident.createdAt).toISOString().split('T')[0] : 'N/A',
        location: incident.location || 'N/A',
        priority: incident.priority || 'low',
        status: incident.status || 'Submitted'
      }));
  };

  const getCategoryData = () => {
    const categoryCounts = {};
    incidents.forEach(incident => {
      const cat = incident.category || 'Others';
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });
    
    return Object.entries(categoryCounts).map(([name, count]) => ({ name, count }));
  };

  const getMonthlyData = () => {
    const monthlyCounts = {};
    incidents.forEach(incident => {
      if (incident.createdAt) {
        const month = new Date(incident.createdAt).toLocaleString('en-US', { month: 'short' });
        monthlyCounts[month] = (monthlyCounts[month] || 0) + 1;
      }
    });
    
    return Object.entries(monthlyCounts).map(([name, reports]) => ({ name, reports }));
  };

  const getIncidentHotspots = () => {
    const locationCounts = {};
    incidents.forEach(incident => {
      const loc = incident.location || 'Unknown Location';
      locationCounts[loc] = (locationCounts[loc] || 0) + 1;
    });
    
    return Object.entries(locationCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([location, incidents], index) => ({
        id: index + 1,
        location,
        incidents,
        priority: incidents > 10 ? 'High' : incidents > 5 ? 'Medium' : 'Low'
      }));
  };

  const getTotalReports = () => incidents.length;
  const getPendingReports = () => incidents.filter(i => i.status === 'Pending').length;
  const getResolvedThisMonth = () => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    return incidents.filter(i => 
      i.status === 'Resolved' && 
      new Date(i.createdAt) >= startOfMonth
    ).length;
  };

  if (loading) return (
    <div className="flex bg-gray-100 font-sans">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
        <div>Loading dashboard...</div>
      </main>
    </div>
  );

  if (error) return (
    <div className="flex bg-gray-100 font-sans">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
        <div className="text-red-600">{error}</div>
      </main>
    </div>
  );

  const recentReports = getRecentReports();
  const categoryData = getCategoryData();
  const monthlyData = getMonthlyData();
  const incidentHotspots = getIncidentHotspots();

  return (
    <div className="flex bg-gray-100 font-sans">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Admin Dashboard
            </h1>
            <p className="text-gray-500 mt-1">
              Monitor and manage campus safety reports
            </p>
          </div>
        </header>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Reports"
            value={getTotalReports()}
            change="+12% from last month"
            changeType="positive"
            icon={<FileText size={24} className="text-blue-500" />}
            iconBgColor="bg-blue-100"
          />
          <StatCard
            title="Pending Reports"
            value={getPendingReports()}
            change="Requires immediate attention"
            changeType="negative"
            icon={<Clock size={24} className="text-yellow-500" />}
            iconBgColor="bg-yellow-100"
          />
          <StatCard
            title="Resolved This Month"
            value={getResolvedThisMonth()}
            change="+8% resolution rate"
            changeType="positive"
            icon={<CheckCircle size={24} className="text-green-500" />}
            iconBgColor="bg-green-100"
          />
          <StatCard
            title="Avg Response Time"
            value="2.4h"
            change="-0.5h from last month"
            changeType="positive"
            icon={<TrendingUp size={24} className="text-indigo-500" />}
            iconBgColor="bg-indigo-100"
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8">
          <div className="lg:col-span-3 bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Reports by Category
            </h2>
            <div style={{ width: "100%", height: 300 }}>
              <ResponsiveContainer>
                <BarChart
                  data={categoryData}
                  margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#16a34a" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Monthly Report Trend
            </h2>
            <div style={{ width: "100%", height: 300 }}>
              <ResponsiveContainer>
                <LineChart
                  data={monthlyData}
                  margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="reports"
                    stroke="#16a34a"
                    strokeWidth={2}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Recent Reports & Hotspots */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Recent Reports
            </h2>
            <div className="space-y-4">
              {recentReports.map((report) => (
                <div
                  key={report.id}
                  className="p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-gray-800">
                        {report.title}
                      </p>
                      <p className="text-sm text-gray-500">{report.category}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <PriorityBadge priority={report.priority} />
                      <StatusBadge status={report.status} />
                    </div>
                  </div>
                  <div className="flex items-center text-xs text-gray-500 mt-3 gap-4">
                    <span className="flex items-center">
                      <User size={14} className="mr-1.5" />
                      {report.reporter}
                    </span>
                    <span className="flex items-center">
                      <Calendar size={14} className="mr-1.5" />
                      {report.date}
                    </span>
                    <span className="flex items-center">
                      <MapPin size={14} className="mr-1.5" />
                      {report.location}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Incident Hotspots */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Incident Hotspot
            </h2>
            <div className="space-y-4">
              {incidentHotspots.map((hotspot) => (
                <div
                  key={hotspot.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div>
                    <p className="font-semibold text-gray-800">
                      {hotspot.location}
                    </p>
                    <p className="text-sm text-gray-500">
                      {hotspot.incidents} incidents
                    </p>
                  </div>
                  <PriorityBadge priority={hotspot.priority} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;