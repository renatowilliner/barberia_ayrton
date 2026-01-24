import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { Calendar, BarChart } from 'lucide-react';

const Layout = () => {
    return (
        <div className="min-h-screen bg-white text-gray-900 font-sans">
            <nav className="bg-ton-black shadow-lg sticky top-0 z-50 border-b border-ton-wood">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-20">
                        <div className="flex items-center">
                            <Link to="/" className="flex items-center gap-3 group">
                                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                                    <span className="font-bold text-ton-black text-sm">TON</span>
                                </div>
                                <div>
                                    <span className="font-bold text-2xl tracking-tight text-white">TON</span>
                                    <p className="text-xs text-ton-wood tracking-widest">LA BARBERÍA</p>
                                </div>
                            </Link>
                            <div className="hidden sm:ml-8 sm:flex sm:space-x-6">
                                <Link
                                    to={localStorage.getItem('user') ? "/reservar" : "/login"}
                                    className="text-white hover:text-ton-wood inline-flex items-center px-3 py-2 text-sm font-medium transition-colors duration-200 border-b-2 border-transparent hover:border-ton-wood"
                                >
                                    <Calendar className="w-4 h-4 mr-2" />
                                    Reservar
                                </Link>
                                {localStorage.getItem('user') && (
                                    <Link
                                        to="/admin"
                                        className="text-white hover:text-ton-wood inline-flex items-center px-3 py-2 text-sm font-medium transition-colors duration-200 border-b-2 border-transparent hover:border-ton-wood"
                                    >
                                        <BarChart className="w-4 h-4 mr-2" />
                                        Admin
                                    </Link>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            {localStorage.getItem('user') ? (
                                <>
                                    <span className="text-sm text-gray-300">
                                        Hola, {JSON.parse(localStorage.getItem('user')).name}
                                    </span>
                                    <button
                                        onClick={() => {
                                            localStorage.removeItem('user');
                                            window.location.reload();
                                        }}
                                        className="bg-ton-wood hover:bg-ton-wood-dark text-white px-4 py-2 text-sm font-medium transition-colors duration-200"
                                    >
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link to="/login" className="text-gray-300 hover:text-white px-3 py-2 text-sm font-medium transition-colors duration-200">
                                        Login
                                    </Link>
                                    <Link
                                        to="/register"
                                        className="bg-ton-wood hover:bg-ton-wood-dark text-white px-4 py-2 text-sm font-medium transition-colors duration-200"
                                    >
                                        Registrarse
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            <main className="w-full">
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;
