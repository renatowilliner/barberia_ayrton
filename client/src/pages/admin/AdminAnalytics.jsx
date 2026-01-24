import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { BarChart2, CheckCircle, Clock } from 'lucide-react';

const AdminAnalytics = () => {
    const [stats, setStats] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('/admin/stats');
                setStats(res.data || {});
            } catch (err) {
                console.error('Error cargando analytics', err);
            }
        };
        fetchStats();
    }, []);

    return (
        <div>
            <h2 className="text-xl font-semibold mb-4">Analytics</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-md shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3">
                        <BarChart2 className="w-6 h-6 text-indigo-600" />
                        <div>
                            <p className="text-sm text-gray-500">Citas Totales</p>
                            <p className="text-2xl font-bold">{stats?.total_appointments || 0}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-md shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3">
                        <CheckCircle className="w-6 h-6 text-green-500" />
                        <div>
                            <p className="text-sm text-gray-500">Completadas</p>
                            <p className="text-2xl font-bold">{stats?.completed || 0}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-md shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3">
                        <Clock className="w-6 h-6 text-yellow-500" />
                        <div>
                            <p className="text-sm text-gray-500">Pendientes</p>
                            <p className="text-2xl font-bold">{stats?.pending || 0}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminAnalytics;
