import React, { useEffect, useState } from 'react';
import { format, startOfMonth, endOfMonth, parseISO } from 'date-fns';
import api from '../../services/api';
import { Check, X, MessageCircle } from 'lucide-react';

const toGoogleDates = (startISO, endISO) => {
    try {
        const s = new Date(startISO).toISOString().replace(/-|:|\.\d{3}/g, '');
        const e = new Date(endISO).toISOString().replace(/-|:|\.\d{3}/g, '');
        return `${s}/${e}`;
    } catch (e) {
        return '';
    }
};

const AdminAppointments = () => {
    const [activeTab, setActiveTab] = useState('agenda'); // 'agenda', 'requests', 'history'
    const [view, setView] = useState('month');
    const [queryDate, setQueryDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [queryMonth, setQueryMonth] = useState(format(new Date(), 'yyyy-MM'));
    const [appointments, setAppointments] = useState([]);
    const [clientFilter, setClientFilter] = useState('');

    useEffect(() => {
        fetchAppointments();
    }, [view, queryDate, queryMonth]);

    const fetchAppointments = async () => {
        try {
            let url = '/appointments';
            if (view === 'today') {
                url += `?date=${queryDate}`;
            } else if (view === 'month') {
                url += `?month=${queryMonth}`;
            }

            const res = await api.get(url);
            if (Array.isArray(res.data)) {
                setAppointments(res.data);
            } else {
                console.warn('API did not return an array:', res.data);
                setAppointments([]);
            }
        } catch (err) {
            console.error('Error cargando citas', err);
            setAppointments([]);
        }
    };

    const getFilteredAppointments = () => {
        // Debug
        // console.log('Appointments:', appointments); 

        let filtered = appointments;

        // 1. Text Filter
        if (clientFilter) {
            filtered = filtered.filter(a => {
                const name = a.client?.name || a.name || '';
                const email = a.client?.email || a.email || '';
                return (name && name.toLowerCase().includes(clientFilter.toLowerCase())) ||
                    (email && email.toLowerCase().includes(clientFilter.toLowerCase()));
            });
        }

        // 2. Tab Filter
        if (activeTab === 'agenda') {
            return filtered.filter(a => (a.status || '').toLowerCase() === 'confirmed');
        } else if (activeTab === 'requests') {
            return filtered.filter(a => (a.status || '').toLowerCase() === 'pending');
        }
        // Fallback for agenda (confirmed)
        return filtered.filter(a => (a.status || '').toLowerCase() === 'confirmed');
    };

    const filteredAndTabbed = getFilteredAppointments();
    const pendingCount = appointments.filter(a => a.status === 'pending').length;

    const handleDayClick = (dateStr) => {
        setQueryDate(dateStr);
        setView('today');
    };

    const googleAddLink = (a) => {
        // Try to use start_time / end_time fields
        const start = a.start_time || a.StartTime || a.startTime;
        const end = a.end_time || a.EndTime || a.endTime;
        const title = `Cita - ${a.client?.name || a.name || 'cliente'}`;
        const details = a.notes || '';

        if (a.google_event_id && a.google_event_id !== "") {
            // Link to edit/view event if event id present and NOT empty
            return `https://calendar.google.com/calendar/r/eventedit/${a.google_event_id}`;
        }

        if (!start || !end) return '#';

        const dates = toGoogleDates(start, end);
        const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${dates}&details=${encodeURIComponent(details)}`;
        return url;
    };

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-ton-black">Administración de Turnos</h2>
                    <p className="text-gray-500 mt-1">Gestiona y revisa todas las citas.</p>
                </div>

                <div className="flex bg-ton-gray-light p-1.5 rounded-lg border border-gray-200">
                    <button
                        onClick={() => setActiveTab('agenda')}
                        className={`px-6 py-2.5 rounded-md text-sm font-bold transition-all ${activeTab === 'agenda' ? 'bg-ton-black text-white shadow-md' : 'text-gray-600 hover:text-ton-black hover:bg-gray-200'}`}
                    >
                        Agenda
                    </button>
                    <button
                        onClick={() => setActiveTab('requests')}
                        className={`px-6 py-2.5 rounded-md text-sm font-bold transition-all flex items-center ${activeTab === 'requests' ? 'bg-ton-black text-white shadow-md' : 'text-gray-600 hover:text-ton-black hover:bg-gray-200'}`}
                    >
                        Solicitudes
                        {pendingCount > 0 && (
                            <span className="ml-2 bg-ton-wood text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                {pendingCount}
                            </span>
                        )}
                    </button>
                </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4 mb-6 bg-white p-6 rounded-xl border border-gray-200 shadow-sm border-t-4 border-t-ton-wood">
                <input
                    placeholder="Buscar por cliente..."
                    value={clientFilter}
                    onChange={(e) => setClientFilter(e.target.value)}
                    className="border-2 border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-ton-wood focus:border-ton-wood w-full md:w-72"
                />
                <div className="flex items-center space-x-2 md:border-l md:pl-4 border-gray-200 w-full md:w-auto">
                    <label className="text-sm font-semibold text-ton-black whitespace-nowrap">Vista:</label>
                    <select value={view} onChange={(e) => setView(e.target.value)} className="border-2 border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-ton-wood focus:border-ton-wood bg-white w-full md:w-auto">
                        <option value="today">Hoy / Día</option>
                        <option value="month">Mensual</option>
                    </select>
                </div>
                {view === 'today' && (
                    <input type="date" value={queryDate} onChange={(e) => setQueryDate(e.target.value)} className="border-2 border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-ton-wood focus:border-ton-wood w-full md:w-auto" />
                )}
                {view === 'month' && (
                    <input type="month" value={queryMonth} onChange={(e) => setQueryMonth(e.target.value)} className="border-2 border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-ton-wood focus:border-ton-wood w-full md:w-auto" />
                )}
            </div>

            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-200 bg-ton-black flex justify-between items-center">
                    <h3 className="font-bold text-white text-lg">
                        {activeTab === 'agenda' ? 'Agenda (Turnos Confirmados)' : 'Solicitudes Pendientes'}
                    </h3>
                    <span className="text-sm text-ton-wood font-medium bg-white/10 px-3 py-1 rounded-full">{filteredAndTabbed.length} registros</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left whitespace-nowrap">
                        <thead>
                            <tr className="text-xs font-bold tracking-wider text-left text-ton-black uppercase border-b-2 border-ton-wood bg-gray-50">
                                <th className="px-6 py-4">Fecha y Hora</th>
                                <th className="px-6 py-4">Cliente</th>
                                <th className="px-6 py-4">Contacto</th>
                                <th className="px-6 py-4">Notas</th>
                                <th className="px-6 py-4">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {filteredAndTabbed.length === 0 && (
                                <tr><td className="p-12 text-center text-gray-500 italic" colSpan={6}>No hay turnos para mostrar en esta vista.</td></tr>
                            )}
                            {filteredAndTabbed.map(a => {
                                const start = a.start_time || a.StartTime || a.startTime;
                                let timeLabel = '-';
                                if (start) {
                                    const d = new Date(start);
                                    const year = d.getUTCFullYear();
                                    const month = String(d.getUTCMonth() + 1).padStart(2, '0');
                                    const day = String(d.getUTCDate()).padStart(2, '0');
                                    const hours = String(d.getUTCHours()).padStart(2, '0');
                                    const minutes = String(d.getUTCMinutes()).padStart(2, '0');
                                    timeLabel = `${year}-${month}-${day} ${hours}:${minutes}`;
                                }
                                return (
                                    <tr key={a.id} className="hover:bg-ton-gray-light transition-colors duration-150">
                                        <td className="px-6 py-4 text-sm text-ton-black font-bold">{timeLabel}</td>
                                        <td className="px-6 py-4 text-sm text-gray-800 font-medium">{a.client?.name || a.Client?.Name || a.name || 'Desconocido'}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{a.client?.phone || a.Client?.Phone || a.phone || '-'}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600 max-w-[200px] truncate" title={a.notes}>{a.notes || '-'}</td>
                                        <td className="px-6 py-4 text-sm flex items-center">

                                            {/* Google & WhatsApp Actions */}
                                            {a.status === 'confirmed' && (
                                                <a target="_blank" rel="noreferrer" href={googleAddLink(a)} className="text-ton-wood hover:text-ton-wood-dark mr-4 font-bold text-xs uppercase tracking-wider border border-ton-wood rounded px-2 py-1 hover:bg-ton-wood hover:text-white transition-all">
                                                    Google
                                                </a>
                                            )}

                                            {/* WhatsApp Button */}
                                            {a.client && a.client.phone && (() => {
                                                const d = new Date(start);
                                                const formattedTime = start ? `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')} ${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}` : '';
                                                return (
                                                    <a
                                                        href={`https://wa.me/${(() => {
                                                            let p = (a.client.phone || "").replace(/\D/g, '');
                                                            if (p.startsWith('0')) p = '549' + p.substring(1);
                                                            return p;
                                                        })()}?text=${encodeURIComponent(`Hola ${a.client.name}, tu turno para el ${formattedTime} ha sido confirmado. ¡Te esperamos!`)}`}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="inline-flex items-center justify-center w-8 h-8 bg-green-100 text-green-600 rounded-full hover:bg-green-600 hover:text-white transition-all mr-2"
                                                        title="Enviar WhatsApp"
                                                    >
                                                        <MessageCircle className="w-4 h-4" />
                                                    </a>
                                                );
                                            })()}

                                            {a.status === 'pending' && (
                                                <button
                                                    onClick={async () => { try { await api.post(`/appointments/${a.id}/confirm`); fetchAppointments(); } catch (e) { alert('Error al confirmar'); } }}
                                                    className="inline-flex items-center px-4 py-1.5 bg-ton-black text-white rounded-md text-xs font-bold mr-2 hover:bg-ton-wood transition-colors shadow-sm"
                                                >
                                                    <Check className="w-3 h-3 mr-1" />
                                                    Confirmar
                                                </button>
                                            )}

                                            {a.status !== 'cancelled' && (
                                                <button
                                                    onClick={async () => { if (!confirm('¿Cancelar este turno?')) return; try { await api.post(`/appointments/${a.id}/cancel`); fetchAppointments(); } catch (e) { alert('Error al cancelar'); } }}
                                                    className="inline-flex items-center w-8 h-8 justify-center text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                                                    title="Cancelar"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminAppointments;
