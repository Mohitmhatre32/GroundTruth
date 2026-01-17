import React, { useEffect, useState } from 'react';
import { MockDataService } from '../services/mockDataService';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { FileText, Download, Calendar } from 'lucide-react';

const Reports = () => {
    const [history, setHistory] = useState<any[]>([]);

    useEffect(() => {
        MockDataService.getHistory().then(setHistory);
    }, []);

    const reports = [
        { id: 1, name: 'Groundwater Status Report - Dec 2025', date: '2025-12-31', size: '2.4 MB' },
        { id: 2, name: 'Groundwater Status Report - Nov 2025', date: '2025-11-30', size: '2.3 MB' },
        { id: 3, name: 'Quarterly Assessment (Q3 2025)', date: '2025-10-15', size: '5.1 MB' },
        { id: 4, name: 'Annual Aquifer Audit 2024', date: '2025-01-10', size: '12.8 MB' },
    ];

    return (
        <div className="space-y-8 pb-10">
            <div>
                <h1 className="text-2xl font-bold text-textMain">System Reports</h1>
                <p className="text-textMuted">Historical trends and downloadable assessments.</p>
            </div>

            {/* Global Trend Chart (Moved from Dashboard) */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h2 className="text-lg font-bold text-textMain mb-4 flex items-center gap-2">
                    <Calendar className="text-primary" />
                    Global Groundwater Trend (5 Years)
                </h2>
                <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={history}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                            <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} tickFormatter={(tick) => tick.slice(0, 4)} minTickGap={50} />
                            <YAxis label={{ value: 'Depth (m)', angle: -90, position: 'insideLeft' }} stroke="#9ca3af" reversed />
                            <Tooltip labelStyle={{ color: '#000' }} />
                            <Line type="monotone" dataKey="level" stroke="#027598" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Generated Reports Table */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h2 className="text-lg font-bold text-textMain mb-4 flex items-center gap-2">
                    <FileText className="text-primary" />
                    Generated Reports
                </h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-gray-100 text-textMuted text-sm">
                                <th className="font-medium py-3">Report Name</th>
                                <th className="font-medium py-3">Date Generated</th>
                                <th className="font-medium py-3">Size</th>
                                <th className="font-medium py-3 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {reports.map((r) => (
                                <tr key={r.id} className="group hover:bg-gray-50 transition-colors">
                                    <td className="py-4 font-medium text-textMain flex items-center gap-3">
                                        <div className="p-2 bg-primary/5 rounded text-primary group-hover:bg-primary/10 transition-colors">
                                            <FileText size={18} />
                                        </div>
                                        {r.name}
                                    </td>
                                    <td className="py-4 text-sm text-textMuted">{r.date}</td>
                                    <td className="py-4 text-sm text-textMuted">{r.size}</td>
                                    <td className="py-4 text-right">
                                        <button className="text-primary hover:text-primary/80 font-medium text-sm flex items-center justify-end gap-1 w-full">
                                            <Download size={16} /> Download
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Reports;
