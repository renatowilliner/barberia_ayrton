import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Clock, CheckCircle, AlertCircle, MessageCircle } from 'lucide-react';
import api from '../services/api';
import { useSearchParams } from 'react-router-dom';

const BookingPage = () => {
    const [searchParams] = useSearchParams();
    const adminUserId = searchParams.get('userId');

    const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [slots, setSlots] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', notes: '' });
    const [bookingStatus, setBookingStatus] = useState('idle'); // idle, submitting, success, error
    const [bookedAppointment, setBookedAppointment] = useState(null);
    const [adminBookingUser, setAdminBookingUser] = useState(null);

    useEffect(() => {
        if (adminUserId) {
            const fetchUser = async () => {
                try {
                    const res = await api.get(`/users/${adminUserId}`);
                    const user = res.data;
                    setAdminBookingUser(user);
                    setFormData(prev => ({
                        ...prev,
                        name: user.name,
                        email: user.email,
                        phone: user.phone
                    }));
                } catch (err) {
                    console.error("Error fetching user for admin booking", err);
                }
            };
            fetchUser();
        } else {
            const stored = localStorage.getItem('user');
            if (stored) {
                try {
                    const user = JSON.parse(stored);
                    setFormData(prev => ({
                        ...prev,
                        name: user.name,
                        email: user.email,
                        phone: user.phone
                    }));
                } catch (e) { }
            }
        }
    }, [adminUserId]);

    useEffect(() => {
        fetchSlots();
    }, [selectedDate]);

    const fetchSlots = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/slots?date=${selectedDate}`);
            setSlots(response.data || []);
        } catch (error) {
            console.error('Error fetching slots:', error);
            setSlots([]); // Clear slots on error
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setBookingStatus('submitting');
        try {
            // If admin is booking for a user, or established user
            let payload = {
                start_time: selectedSlot,
                notes: formData.notes
            };

            const stored = localStorage.getItem('user');

            if (adminUserId) {
                payload.client_id = adminUserId;
            } else if (stored) {
                try {
                    const user = JSON.parse(stored);
                    payload.client_id = user.id;
                } catch (err) {
                    // fallback to manual entry
                    payload.name = formData.name;
                    payload.email = formData.email;
                    payload.phone = formData.phone;
                }
            } else {
                payload.name = formData.name;
                payload.email = formData.email;
                payload.phone = formData.phone;
            }

            const res = await api.post('/appointments', payload);
            setBookedAppointment(res.data);
            setBookingStatus('success');
            fetchSlots(); // Refresh
            setSelectedSlot(null);
            // Don't clear form immediately so they can see who they booked for if needed, or clear it?
            // setFormData({ name: '', email: '', phone: '', notes: '' });
        } catch (error) {
            console.error('Booking error:', error);
            setBookingStatus('error');
        }
    };

    return (
        <div className="max-w-3xl mx-auto">
            <div className="bg-white shadow-2xl overflow-hidden border-t-4 border-ton-wood">
                <div className="bg-ton-black px-6 py-6 border-b-2 border-ton-wood">
                    <h1 className="text-3xl font-bold text-white flex items-center">
                        <CalendarIcon className="mr-3" />
                        {adminBookingUser ? `Reservando para ${adminBookingUser.name}` : 'Reservar Turno'}
                    </h1>
                    <p className="text-gray-300 mt-2">Selecciona día y horario disponible</p>
                </div>

                <div className="p-6">
                    {bookingStatus === 'success' ? (
                        <div className="mb-6 bg-green-50 border-l-4 border-green-600 text-green-800 px-6 py-4">
                            <div className="flex items-center mb-2">
                                <CheckCircle className="w-5 h-5 mr-2" />
                                <span className="font-semibold">¡Solicitud Enviada!</span>
                            </div>
                            <p className="mb-3 text-gray-700">
                                Tu turno ha sido registrado correctamente. Espera la confirmación del administrador por WhatsApp.
                            </p>

                            <div className="flex justify-center space-x-4 mt-6">
                                <button
                                    onClick={() => window.location.reload()}
                                    className="bg-ton-black text-white px-6 py-3 hover:bg-ton-gray transition-colors"
                                >
                                    Reservar otro
                                </button>
                                <button
                                    onClick={() => window.location.href = '/'}
                                    className="bg-white border-2 border-ton-black text-ton-black px-6 py-3 hover:bg-ton-gray-light transition-colors"
                                >
                                    Volver al Inicio
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            {bookingStatus === 'error' && (
                                <div className="mb-6 bg-red-50 border-l-4 border-red-600 text-red-800 px-6 py-4 flex items-center">
                                    <AlertCircle className="w-5 h-5 mr-2" />
                                    Hubo un error al reservar. Por favor intenta otro horario.
                                </div>
                            )}

                            {/* Date Picker */}
                            <div className="mb-8">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Selecciona Fecha</label>
                                <input
                                    type="date"
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                    className="block w-full px-4 py-3 border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-ton-wood focus:border-ton-wood sm:text-sm"
                                />
                            </div>

                            {/* Slots Grid */}
                            <div className="mb-8">
                                <h2 className="text-xl font-bold text-ton-black mb-4 flex items-center">
                                    <Clock className="w-5 h-5 mr-2 text-ton-wood" />
                                    Horarios Disponibles
                                </h2>
                                {loading ? (
                                    <div className="text-center py-4 text-gray-500">Cargando horarios...</div>
                                ) : slots.length === 0 ? (
                                    <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300 text-gray-500">
                                        No hay horarios disponibles para esta fecha.
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                                        {slots.map((slot) => {
                                            // Parse as UTC and format in UTC to avoid timezone conversion
                                            const slotDate = new Date(slot);
                                            const hours = slotDate.getUTCHours().toString().padStart(2, '0');
                                            const minutes = slotDate.getUTCMinutes().toString().padStart(2, '0');
                                            const timeLabel = `${hours}:${minutes}`;
                                            return (
                                                <button
                                                    key={slot}
                                                    onClick={() => setSelectedSlot(slot)}
                                                    className={`
                        py-3 px-4 text-sm font-bold transition-all duration-200 border-2
                        ${selectedSlot === slot
                                                            ? 'bg-ton-black text-white border-ton-black shadow-lg transform scale-105'
                                                            : 'bg-white border-gray-300 text-ton-black hover:border-ton-wood hover:bg-ton-gray-light'
                                                        }
                      `}
                                                >
                                                    {timeLabel}
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* Booking Form */}
                            {selectedSlot && (
                                <div className="animate-fade-in-up">
                                    <div className="border-t border-gray-200 pt-6 mt-6">
                                        <h3 className="text-lg font-medium text-gray-900 mb-4">Confirmar Turno</h3>
                                        <form onSubmit={handleSubmit} className="space-y-4">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-bold text-ton-black">Nombre</label>
                                                    <input
                                                        type="text"
                                                        required
                                                        disabled={!!adminBookingUser || !!localStorage.getItem('user')}
                                                        className="mt-1 block w-full border-2 border-gray-300 rounded-md shadow-sm py-3 px-4 focus:ring-2 focus:ring-ton-wood focus:border-ton-wood sm:text-sm disabled:bg-gray-100 font-medium"
                                                        value={formData.name}
                                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-bold text-ton-black">Teléfono</label>
                                                    <input
                                                        type="tel"
                                                        required
                                                        disabled={!!adminBookingUser || !!localStorage.getItem('user')}
                                                        className="mt-1 block w-full border-2 border-gray-300 rounded-md shadow-sm py-3 px-4 focus:ring-2 focus:ring-ton-wood focus:border-ton-wood sm:text-sm disabled:bg-gray-100 font-medium"
                                                        value={formData.phone}
                                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-ton-black">Email</label>
                                                <input
                                                    type="email"
                                                    required
                                                    disabled={!!adminBookingUser || !!localStorage.getItem('user')}
                                                    className="mt-1 block w-full border-2 border-gray-300 rounded-md shadow-sm py-3 px-4 focus:ring-2 focus:ring-ton-wood focus:border-ton-wood sm:text-sm disabled:bg-gray-100 font-medium"
                                                    value={formData.email}
                                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-ton-black">Selecciona Servicio</label>
                                                <select
                                                    required
                                                    className="mt-1 block w-full border-2 border-gray-300 rounded-md shadow-sm py-3 px-4 focus:ring-2 focus:ring-ton-wood focus:border-ton-wood sm:text-sm font-medium bg-white"
                                                    value={formData.notes}
                                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                                >
                                                    <option value="" disabled>-- Elige un servicio --</option>
                                                    <option value="Corte de pelo">Corte de pelo</option>
                                                    <option value="Corte de barba">Corte de barba</option>
                                                    <option value="Corte de pelo y barba">Corte de pelo y barba</option>
                                                    <option value="Color">Color</option>
                                                    <option value="Color y barba">Color y barba</option>
                                                </select>
                                            </div>
                                            <div className="pt-4">
                                                <button
                                                    type="submit"
                                                    disabled={bookingStatus === 'submitting'}
                                                    className="w-full flex justify-center py-4 px-4 border-2 border-ton-black text-base font-bold text-white bg-ton-black hover:bg-ton-gray focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ton-wood disabled:opacity-70 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                                                >
                                                    {bookingStatus === 'submitting' ? 'Confirmando...' : 'Confirmar Reserva'}
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BookingPage;
