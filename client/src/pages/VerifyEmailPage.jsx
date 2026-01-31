import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';

const VerifyEmailPage = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const [status, setStatus] = useState('verifying'); // verifying, success, error
    const [message, setMessage] = useState('Verificando tu correo...');
    const hasFetched = useRef(false);

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setMessage('Token de verificación no encontrado.');
            return;
        }

        if (hasFetched.current) return;
        hasFetched.current = true;

        const verify = async () => {
            try {
                // Determine API URL based on environment or default to localhost
                const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
                const response = await fetch(`${apiUrl}/auth/verify?token=${token}`);

                if (response.ok) {
                    setStatus('success');
                    setMessage('¡Correo verificado con éxito! Ahora puedes reservar tu turno.');
                } else {
                    const data = await response.json();
                    setStatus('error');
                    setMessage(data.error || 'Error al verificar el correo.');
                }
            } catch (err) {
                console.error(err);
                setStatus('error');
                setMessage('Error de conexión. Intenta nuevamente.');
            }
        };

        verify();
    }, [token]);

    return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-[#111] border border-gray-800 rounded-lg p-8 text-center shadow-2xl">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold tracking-tighter uppercase mb-2">TON</h1>
                    <div className="h-1 w-12 bg-white mx-auto"></div>
                </div>

                {status === 'verifying' && (
                    <div className="animate-pulse text-gray-400 text-lg">
                        {message}
                    </div>
                )}

                {status === 'success' && (
                    <div className="space-y-6">
                        <div className="text-green-500 text-5xl mb-4">✓</div>
                        <h2 className="text-xl font-semibold text-white">¡Verificado!</h2>
                        <p className="text-gray-400">{message}</p>
                        <div className="pt-4">
                            <Link to="/reservar" className="block w-full bg-white text-black font-bold py-3 px-4 rounded hover:bg-gray-200 transition-colors uppercase tracking-wider">
                                Reservar Turno
                            </Link>
                        </div>
                    </div>
                )}

                {status === 'error' && (
                    <div className="space-y-6">
                        <div className="text-red-500 text-5xl mb-4">✕</div>
                        <h2 className="text-xl font-semibold text-white">Error</h2>
                        <p className="text-gray-400">{message}</p>
                        <div className="pt-4">
                            <Link to="/" className="text-gray-500 hover:text-white underline text-sm">
                                Volver al inicio
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VerifyEmailPage;
