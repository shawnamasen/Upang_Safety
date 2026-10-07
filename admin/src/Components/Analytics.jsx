import React, { useState, useEffect, useRef } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, LineChart, Line, Cell
} from 'recharts';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import Sidebar from './Sidebar';

// --- MAIN PAGE ---
const AnalyticsPage = () => {
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
                setError('Failed to load analytics data. Please check if backend is running.');
            } finally {
                setLoading(false);
            }
        };

        fetchIncidents();
    }, []);

    // Incident Hotspot Locations
    const getHotspotLocations = () => {
        const locationCounts = {};
        incidents.forEach(incident => {
            const location = incident.location || 'Unknown Location';
            locationCounts[location] = (locationCounts[location] || 0) + 1;
        });
        
        return Object.entries(locationCounts)
            .map(([name, reports]) => ({ name, reports }))
            .sort((a, b) => a.reports - b.reports); // Sort for better visualization
    };

    // Monthly Report Trend
    const getMonthlyData = () => {
        const monthlyCounts = {};
        incidents.forEach(incident => {
            if (incident.createdAt) {
                const date = new Date(incident.createdAt);
                const month = date.toLocaleString('en-US', { month: 'short' });
                const year = date.getFullYear();
                const key = `${month} ${year}`;
                monthlyCounts[key] = (monthlyCounts[key] || 0) + 1;
            }
        });
        
        return Object.entries(monthlyCounts)
            .map(([name, reports]) => ({ name, reports }))
            .sort((a, b) => {
                const [monthA, yearA] = a.name.split(' ');
                const [monthB, yearB] = b.name.split(' ');
                const dateA = new Date(`${monthA} 1, ${yearA}`);
                const dateB = new Date(`${monthB} 1, ${yearB}`);
                return dateA - dateB;
            });
    };

    // Reports by Category
    const getCategoryData = () => {
        const categoryCounts = {};
        incidents.forEach(incident => {
            const category = incident.category || 'Others';
            categoryCounts[category] = (categoryCounts[category] || 0) + 1;
        });
        
        return Object.entries(categoryCounts).map(([name, count]) => ({ name, count }));
    };

    const downloadMonthlyReport = async () => {
        try {
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            const margin = 20;

            // Add green header background
            pdf.setFillColor(22, 163, 74); // Green color
            pdf.rect(0, 0, pageWidth, 40, 'F');

            // Add title
            pdf.setTextColor(255, 255, 255); // White color
            pdf.setFontSize(24);
            pdf.text('Monthly Report Summary – October', pageWidth / 2, 25, { align: 'center' });

            // Add generation date (top right)
            pdf.setFontSize(10);
            pdf.text(`Generated on: ${new Date().toLocaleString('en-US', {
                month: '2-digit',
                day: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true
            })}`, pageWidth - margin, margin, { align: 'right' });

            // Add summary table
            pdf.setTextColor(0, 0, 0); // Black color
            pdf.setFillColor(22, 163, 74); // Green color for header
            pdf.rect(margin, 50, pageWidth - (margin * 2), 10, 'F');
            
            pdf.setTextColor(255, 255, 255);
            pdf.setFontSize(12);
            pdf.text('Summary', 30, 57);
            pdf.text('Value', pageWidth - 60, 57);

            // Table content
            pdf.setTextColor(0, 0, 0);
            const tableData = [
                ['Month', 'October 2025'],
                ['Total Reports', incidents.length.toString()],
                ['Top Location', hotspotLocations.length > 0 ? hotspotLocations[hotspotLocations.length - 1].name : 'N/A']
            ];

            let yPos = 70;
            tableData.forEach((row, index) => {
                pdf.setFillColor(index % 2 === 0 ? 245 : 255, 245, 245);
                pdf.rect(margin, yPos - 5, pageWidth - (margin * 2), 10, 'F');
                pdf.text(row[0], 30, yPos);
                pdf.text(row[1], pageWidth - 60, yPos);
                yPos += 10;
            });

            // Reports by Location title
            pdf.setFillColor(22, 163, 74);
            pdf.rect(margin, yPos + 10, pageWidth - (margin * 2), 10, 'F');
            pdf.setTextColor(255, 255, 255);
            pdf.text('Reports by Location (This Month)', margin + 10, yPos + 17);

            // Create bar chart using rectangles
            const chartStartY = yPos + 30;
            const barWidth = 25;
            const maxBarHeight = 60;
            const barSpacing = 35;
            let xPos = margin + 10;

            pdf.setFontSize(10);
            hotspotLocations.forEach((location, index) => {
                const barHeight = (location.reports / Math.max(...hotspotLocations.map(l => l.reports))) * maxBarHeight;
                
                // Draw bar
                pdf.setFillColor(22, 163, 74); // Green color for bars
                pdf.rect(xPos, chartStartY + (maxBarHeight - barHeight), barWidth, barHeight, 'F');
                
                // Add value on top
                pdf.setTextColor(0, 0, 0);
                pdf.text(location.reports.toString(), xPos + (barWidth/2), chartStartY + (maxBarHeight - barHeight) - 5, { align: 'center' });
                
                // Add label below
                pdf.text(location.name, xPos + (barWidth/2), chartStartY + maxBarHeight + 15, { align: 'center', maxWidth: barWidth * 1.5 });
                
                xPos += barWidth + barSpacing;
            });

            // Add legend
            const legendY = chartStartY + maxBarHeight + 30;
            pdf.setFontSize(10);
            
            // Legend items
            const legendItems = [
                { color: [22, 163, 74], text: '1-3 Reports (Low)' },
                { color: [234, 179, 8], text: '4-6 Reports (Moderate)' },
                { color: [239, 68, 68], text: '7+ Reports (High)' }
            ];

            let legendX = margin + 10;
            legendItems.forEach(item => {
                pdf.setFillColor(...item.color);
                pdf.rect(legendX, legendY, 5, 5, 'F');
                pdf.setTextColor(0, 0, 0);
                pdf.text(item.text, legendX + 8, legendY + 4);
                legendX += 80;
            });

            // Add footer
            pdf.setFontSize(8);
            pdf.setTextColor(128, 128, 128);
            pdf.text('Generated by Analytics Dashboard | Confidential', pageWidth / 2, pageHeight - 10, { align: 'center' });

            // Save the PDF
            pdf.save('Monthly_Report_Summary.pdf');
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Failed to generate PDF. Please try again.');
        }
    };

    const HotspotTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 border rounded-lg shadow-md">
                    <p className="font-semibold">{`${label}`}</p>
                    <p className="text-sm text-gray-600">{`Reports: ${payload[0].value}`}</p>
                </div>
            );
        }
        return null;
    };

    if (loading) return (
        <div className="flex bg-gray-100 font-sans">
            <Sidebar />
            <main className="flex-1 ml-64 p-8">
                <div>Loading analytics data...</div>
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

    const hotspotLocations = getHotspotLocations();
    const monthlyData = getMonthlyData();
    const categoryData = getCategoryData();

    return (
        <div className="flex bg-gray-100 font-sans">
            <Sidebar />

            <main className="flex-1 ml-64 p-8">
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Analytics and Incident Hotspot</h1>
                        <p className="text-gray-500 mt-1">Data visualization for trend analysis.</p>
                    </div>
                </header>

                {/* Monthly Report Summary */}
                <div id="monthlyReportSummary" className="bg-white rounded-xl shadow-sm mb-8">
                    <div className="bg-green-600 p-6 rounded-t-xl">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-semibold text-white">Monthly Report Summary – October</h2>
                            <button
                                onClick={downloadMonthlyReport}
                                className="bg-white text-green-600 hover:bg-gray-100 px-4 py-2 rounded-lg flex items-center"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                                Download PDF
                            </button>
                        </div>
                        <p className="text-white text-sm mt-2">
                            Generated on: {new Date().toLocaleString('en-US', {
                                month: '2-digit',
                                day: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit',
                                hour12: true
                            })}
                        </p>
                    </div>
                    <div className="p-6">
                        <div className="bg-green-600 p-3 rounded-lg mb-4">
                            <div className="grid grid-cols-2">
                                <div className="text-white font-semibold">Summary</div>
                                <div className="text-white font-semibold">Value</div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            {[
                                ['Month', 'October 2025'],
                                ['Total Reports', incidents.length],
                                ['Top Location', hotspotLocations.length > 0 ? hotspotLocations[hotspotLocations.length - 1].name : 'N/A']
                            ].map(([label, value], index) => (
                                <div key={label} className={`grid grid-cols-2 p-3 ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                                    <div className="text-gray-900">{label}</div>
                                    <div className="text-gray-700">{value}</div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8">
                            <div className="bg-green-600 p-3 rounded-lg mb-4">
                                <h3 className="text-white font-semibold">Reports by Location (This Month)</h3>
                            </div>

                            <div className="flex justify-center mt-6 space-x-8">
                                {hotspotLocations.map((location) => (
                                    <div key={location.name} className="flex flex-col items-center">
                                        <div className="text-gray-700 font-medium mb-2">{location.reports}</div>
                                        <div 
                                            className="w-10 bg-green-600" 
                                            style={{ 
                                                height: `${(location.reports / Math.max(...hotspotLocations.map(l => l.reports))) * 150}px` 
                                            }}
                                        ></div>
                                        <div className="text-sm text-gray-600 mt-2 text-center max-w-[100px]">{location.name}</div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-8 flex justify-center space-x-8 text-sm text-gray-600">
                                <div className="flex items-center">
                                    <div className="w-3 h-3 bg-green-600 mr-2"></div>
                                    1-3 Reports (Low)
                                </div>
                                <div className="flex items-center">
                                    <div className="w-3 h-3 bg-yellow-500 mr-2"></div>
                                    4-6 Reports (Moderate)
                                </div>
                                <div className="flex items-center">
                                    <div className="w-3 h-3 bg-red-500 mr-2"></div>
                                    7+ Reports (High)
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 text-center text-xs text-gray-500">
                            Generated by Analytics Dashboard | Confidential
                        </div>
                    </div>
                </div>

                {/* HOTSPOT BAR CHART SECTION */}
                <div className="bg-white p-6 rounded-xl shadow-sm mb-8">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">Incident Hotspot Areas</h2>
                    <div style={{ width: '100%', height: 350 }}>
                        <ResponsiveContainer>
                            <BarChart
                                layout="vertical"
                                data={hotspotLocations}
                                margin={{ top: 5, right: 30, left: 30, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                <XAxis type="number" tick={{ fontSize: 12 }} />
                                <YAxis dataKey="name" type="category" width={150} tick={{ fontSize: 12 }} />
                                <Tooltip content={<HotspotTooltip />} cursor={{ fill: 'rgba(243, 244, 246, 0.5)' }} />
                                <Bar dataKey="reports" radius={[0, 4, 4, 0]}>
                                    {hotspotLocations.map((entry, index) => {
                                        let color;
                                        if (entry.reports >= 1 && entry.reports <= 3) {
                                            color = '#22c55e'; // green-500
                                        } else if (entry.reports >= 4 && entry.reports <= 7) {
                                            color = '#eab308'; // yellow-500
                                        } else {
                                            color = '#ef4444'; // red-500
                                        }
                                        return <Cell key={`cell-${index}`} fill={color} />;
                                    })}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* CHARTS SECTION */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white p-6 rounded-xl shadow-sm">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">Monthly Report Trend</h2>
                        <div style={{ width: '100%', height: 300 }}>
                            <ResponsiveContainer>
                                <LineChart data={monthlyData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
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

                    <div className="bg-white p-6 rounded-xl shadow-sm">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">Reports by Category</h2>
                        <div style={{ width: '100%', height: 300 }}>
                            <ResponsiveContainer>
                                <BarChart data={categoryData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis
                                        dataKey="name"
                                        tick={{ fontSize: 12, angle: -25, textAnchor: 'end' }}
                                        interval={0}
                                        height={50}
                                    />
                                    <YAxis tick={{ fontSize: 12 }} />
                                    <Tooltip />
                                    <Bar dataKey="count" fill="#16a34a" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AnalyticsPage;