import React, { useState, useEffect } from 'react';
import { BarChart2, Users, Calendar, Clock, CheckCircle } from 'lucide-react';
import { format, startOfToday } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [selectedDate, setSelectedDate] = useState(format(startOfToday(), 'yyyy-MM-dd'));
    const [dayConfig, setDayConfig] = useState({ start_time: '09:00', end_time: '18:00' });
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchDashboardData();
    }, []);

    useEffect(() => {
        fetchAvailabilityForDate(selectedDate);
    }, [selectedDate]);

    const fetchDashboardData = async () => {
        try {
            const statsRes = await api.get('/admin/stats').catch(() => ({ data: { total_appointments: 0, completed: 0, pending: 0 } }));
            setStats(statsRes.data);
        } catch (error) {
            console.error("Failed to load stats", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchAvailabilityForDate = async (date) => {
        try {
            const res = await api.get(`/availability?date=${date}`);
            if (res.data && res.data.length > 0) {
                const avail = res.data[0];
                setDayConfig({ start_time: avail.start_time, end_time: avail.end_time });
            } else {
                setDayConfig({ start_time: '09:00', end_time: '18:00' });
            }
        } catch (err) {
            console.error('Error fetching availability', err);
            setDayConfig({ start_time: '09:00', end_time: '18:00' });
        }
    };

    const handleUpdateAvailability = async () => {
        setMessage(null);
        if (!selectedDate) {
            setMessage({ type: 'error', text: 'Por favor selecciona una fecha válida.' });
            return;
        }

        try {
            await api.post('/availability', {
                date: selectedDate,
                start_time: dayConfig.start_time,
                end_time: dayConfig.end_time
            });
            setMessage({ type: 'success', text: `Disponibilidad guardada para ${selectedDate}` });
            setTimeout(() => setMessage(null), 3000);
        } catch (error) {
            console.error(error);
            setMessage({ type: 'error', text: 'Error al actualizar disponibilidad' });
        }
    };

    if (loading) return <div className="text-center py-8">Cargando panel...</div>;

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            {/* Header */}
            <div className="bg-ton-black shadow-lg border-b-4 border-ton-wood">
                <div className="px-6 py-6">
                    <h1 className="text-3xl font-bold text-white">Panel de Administración</h1>
                    <p className="text-gray-300 mt-1">Gestiona tu barbería desde aquí</p>
                </div>
            </div>

            {/* Stats Cards */}
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* 1. Confirmed (Most Important) */}
                <div className="bg-white p-6 shadow-lg border-t-4 border-ton-wood hover:shadow-xl transition-shadow rounded-lg">
                    <div className="flex items-center">
                        <div className="flex-shrink-0 bg-ton-black rounded-full p-4 shadow-md">
                            <CheckCircle className="h-8 w-8 text-white" />
                        </div>
                        <div className="ml-5 w-0 flex-1">
                            <dl>
                                <dt className="text-sm font-bold text-gray-500 uppercase tracking-wide truncate">Citas Confirmadas (Mes)</dt>
                                <dd className="flex items-baseline mt-1">
                                    <div className="text-4xl font-extrabold text-ton-black">{stats?.completed || 0}</div>
                                </dd>
                            </dl>
                        </div>
                    </div>
                </div>

                {/* 2. Pending */}
                <div className="bg-white p-6 shadow-lg border-t-4 border-ton-black hover:shadow-xl transition-shadow rounded-lg">
                    <div className="flex items-center">
                        <div className="flex-shrink-0 bg-ton-wood rounded-full p-4 shadow-md">
                            <Clock className="h-8 w-8 text-white" />
                        </div>
                        <div className="ml-5 w-0 flex-1">
                            <dl>
                                <dt className="text-sm font-bold text-gray-500 uppercase tracking-wide truncate">Solicitudes Pendientes</dt>
                                <dd className="flex items-baseline mt-1">
                                    <div className="text-4xl font-extrabold text-ton-black">{stats?.pending || 0}</div>
                                </dd>
                            </dl>
                        </div>
                    </div>
                </div>

                {/* 3. Total */}
                <div className="bg-white p-6 shadow-lg border-t-4 border-gray-400 hover:shadow-xl transition-shadow rounded-lg">
                    <div className="flex items-center">
                        <div className="flex-shrink-0 bg-gray-600 rounded-full p-4 shadow-md">
                            <Calendar className="h-8 w-8 text-white" />
                        </div>
                        <div className="ml-5 w-0 flex-1">
                            <dl>
                                <dt className="text-sm font-bold text-gray-500 uppercase tracking-wide truncate">Total Turnos (Mes)</dt>
                                <dd className="flex items-baseline mt-1">
                                    <div className="text-4xl font-extrabold text-ton-black">{stats?.total_appointments || 0}</div>
                                </dd>
                            </dl>
                        </div>
                    </div>
                </div>
            </div>

            {/* Shortcuts */}
            <div className="flex gap-3">
                <button onClick={() => navigate('/admin/appointments')} className="px-6 py-3 bg-ton-black text-white hover:bg-ton-gray transition-colors font-medium">Ver Citas</button>
                <button onClick={() => window.open('https://calendar.google.com', '_blank')} className="px-6 py-3 bg-white border-2 border-ton-black text-ton-black hover:bg-ton-gray-light transition-colors font-medium">Abrir Google Calendar</button>
                <button onClick={() => navigate('/admin/settings')} className="px-6 py-3 bg-white border-2 border-ton-wood text-ton-black hover:bg-ton-gray-light transition-colors font-medium">Configuración</button>
            </div>

            {/* Availability Config */}
            <div className="bg-white shadow-lg border-t-4 border-ton-wood overflow-hidden max-w-2xl">
                <div className="px-6 py-4 bg-ton-gray-light border-b-2 border-ton-wood">
                    <h2 className="text-xl font-bold text-ton-black">Configuración Diaria</h2>
                    <p className="text-sm text-gray-600 mt-1">Selecciona una fecha y configura el horario.</p>
                </div>

                <div className="p-6 space-y-6">
                    {/* Date Picker */}
                    <div>
                        <label className="block text-sm font-bold text-ton-black mb-2">Fecha a configurar</label>
                        <input
                            type="date"
                            className="block w-full border-2 border-gray-300 py-3 px-4 focus:ring-2 focus:ring-ton-wood focus:border-ton-wood sm:text-sm"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                        />
                    </div>

                    {/* Time Range */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-ton-black mb-2">Hora Inicio</label>
                            <input
                                type="time"
                                className="block w-full border-2 border-gray-300 py-3 px-4 focus:ring-2 focus:ring-ton-wood focus:border-ton-wood sm:text-sm"
                                value={dayConfig.start_time}
                                onChange={(e) => setDayConfig({ ...dayConfig, start_time: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-ton-black mb-2">Hora Fin</label>
                            <input
                                type="time"
                                className="block w-full border-2 border-gray-300 py-3 px-4 focus:ring-2 focus:ring-ton-wood focus:border-ton-wood sm:text-sm"
                                value={dayConfig.end_time}
                                onChange={(e) => setDayConfig({ ...dayConfig, end_time: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Save Button */}
                    <button
                        onClick={handleUpdateAvailability}
                        className="w-full bg-ton-black text-white py-4 px-4 hover:bg-ton-gray transition-colors font-bold text-base"
                    >
                        Guardar Horario para {selectedDate}
                    </button>

                    {/* Message */}
                    {message && (
                        <div className={`mt-3 p-4 text-sm text-center font-medium ${message.type === 'success' ? 'bg-green-50 text-green-700 border-l-4 border-green-600' : 'bg-red-50 text-red-700 border-l-4 border-red-600'
                            }`}>
                            {message.text}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
