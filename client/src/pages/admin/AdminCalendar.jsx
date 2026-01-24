import React, { useEffect, useRef, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import api from '../../services/api';
import { formatISO } from 'date-fns';

const AdminCalendar = () => {
    const calendarRef = useRef(null);
    const [events, setEvents] = useState([]);

    useEffect(() => {
        // initial load
        fetchRangeEvents();
    }, []);

    const fetchRangeEvents = async (start, end) => {
        try {
            // If start/end provided, use RFC3339 via toISOString()
            let url = '/appointments';
            if (start && end) {
                url += `?start=${encodeURIComponent(formatISO(start))}&end=${encodeURIComponent(formatISO(end))}`;
            }
            const res = await api.get(url);
            const appts = res.data || [];

            const ev = appts
                .filter(a => (a.status || '').toLowerCase() === 'confirmed')
                .map(a => {
                    const s = a.start_time || a.StartTime || a.startTime;
                    const e = a.end_time || a.EndTime || a.endTime;
                    return {
                        id: a.id,
                        title: a.client?.name || a.Client?.Name || a.name || 'Cita',
                        start: s,
                        end: e,
                        color: '#4F46E5', // Indigo-600 for confirmed
                        extendedProps: {
                            status: a.status,
                            notes: a.notes || ''
                        }
                    };
                });
            setEvents(ev);
        } catch (err) {
            console.error('Error loading calendar events', err);
            setEvents([]);
        }
    };

    const handleDatesSet = (arg) => {
        // arg.start, arg.end are JS Dates
        fetchRangeEvents(arg.start, arg.end);
    };

    const handleEventClick = (clickInfo) => {
        const ev = clickInfo.event;
        // Open appointment in admin appointments view on the specific date
        const dateStr = ev.start ? ev.start.toISOString().split('T')[0] : '';
        // Navigate by changing location to admin/appointments with date
        window.location.href = `/admin/appointments?date=${dateStr}`;
    };

    return (
        <div>
            <h2 className="text-xl font-semibold mb-4">Calendario</h2>
            <div className="bg-white rounded-md shadow-sm border border-gray-100 p-4">
                <FullCalendar
                    ref={calendarRef}
                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                    initialView="timeGridWeek"
                    headerToolbar={{ left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek,timeGridDay' }}
                    events={events}
                    nowIndicator={true}
                    editable={false}
                    selectable={true}
                    eventClick={handleEventClick}
                    datesSet={handleDatesSet}
                    height="auto"
                    timeZone="UTC"
                />
            </div>
        </div>
    );
};

export default AdminCalendar;
