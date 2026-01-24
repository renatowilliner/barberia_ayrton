import React from 'react';
import { Link } from 'react-router-dom';
import { Scissors, Star, Clock, MapPin, ChevronRight, Calendar } from 'lucide-react';

const HomePage = () => {
    return (
        <div className="bg-white">
            {/* Hero Section - Dark & Elegant */}
            {/* Hero Section - Dynamic & Visible */}
            <div className="relative bg-ton-black overflow-hidden">
                {/* Background Gradient - Lighter and more mixed */}
                <div className="absolute inset-0 bg-gradient-to-br from-ton-gray via-ton-black to-ton-wood-dark opacity-80"></div>

                {/* Abstract decorative circles to add depth */}
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-ton-wood opacity-10 rounded-full blur-3xl"></div>
                <div className="absolute top-1/2 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl"></div>

                <div className="container mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center">
                        {/* Logo Circle with glow */}
                        <div className="inline-flex items-center justify-center w-52 h-52 rounded-full bg-white mb-10 shadow-[0_0_30px_rgba(212,165,116,0.3)] border-4 border-ton-wood transition-transform duration-500 hover:scale-105">
                            <div className="text-center">
                                <h1 className="text-7xl font-bold text-ton-black tracking-tighter">TON</h1>
                                <p className="text-sm text-ton-wood-dark font-bold tracking-[0.3em] mt-2">LA BARBERÍA</p>
                            </div>
                        </div>

                        <h2 className="text-5xl font-black tracking-tight text-white sm:text-6xl mb-6">
                            ESTILO <span className="text-ton-wood">Y</span> DISTINCIÓN
                        </h2>
                        <p className="mt-6 text-xl text-gray-200 max-w-2xl mx-auto font-light leading-relaxed">
                            Donde la tradición se encuentra con la vanguardia.
                            <span className="block mt-2 font-medium text-ton-wood">El cuidado masculino llevado al siguiente nivel.</span>
                        </p>

                        <div className="mt-10 flex flex-col sm:flex-row gap-6 justify-center">
                            <Link
                                to="/reservar"
                                className="inline-flex items-center justify-center px-10 py-4 bg-ton-wood text-white text-lg font-bold tracking-wide hover:bg-white hover:text-ton-black transition-all duration-300 transform hover:-translate-y-1 shadow-lg border-2 border-ton-wood"
                            >
                                <Calendar className="w-5 h-5 mr-2" />
                                RESERVAR TURNO
                            </Link>
                            <a
                                href="#servicios"
                                className="inline-flex items-center justify-center px-10 py-4 bg-transparent border-2 border-white text-white text-lg font-bold tracking-wide hover:bg-white hover:text-ton-black transition-all duration-300"
                            >
                                SERVICIOS
                                <ChevronRight className="w-5 h-5 ml-2" />
                            </a>
                        </div>
                    </div>
                </div>

                {/* Decorative bottom border - Gold Line */}
                <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-ton-black via-ton-wood to-ton-black"></div>
            </div>

            {/* Services Section */}
            <div className="py-24 bg-ton-gray-light" id="servicios">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-base font-semibold text-ton-wood tracking-wide uppercase mb-2">Nuestros Servicios</h2>
                        <p className="text-4xl font-extrabold text-ton-black sm:text-5xl">
                            Experiencia Premium
                        </p>
                        <div className="mt-4 w-24 h-1 bg-ton-wood mx-auto"></div>
                    </div>

                    <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                        {/* Service 1 */}
                        <div className="group relative bg-white p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border-t-4 border-ton-black">
                            <div className="absolute top-0 right-0 w-20 h-20 bg-ton-wood opacity-10 transform rotate-45 translate-x-10 -translate-y-10"></div>
                            <div className="relative">
                                <div className="inline-flex p-4 bg-ton-black rounded-full mb-6">
                                    <Scissors className="h-8 w-8 text-white" />
                                </div>
                                <h3 className="text-2xl font-bold text-ton-black mb-4">
                                    Corte Clásico & Moderno
                                </h3>
                                <p className="text-gray-600 leading-relaxed">
                                    Desde desvanecidos perfectos hasta tijera clásica. Asesoramiento de imagen personalizado para tu estilo único.
                                </p>
                            </div>
                        </div>

                        {/* Service 2 */}
                        <div className="group relative bg-white p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border-t-4 border-ton-wood">
                            <div className="absolute top-0 right-0 w-20 h-20 bg-ton-black opacity-10 transform rotate-45 translate-x-10 -translate-y-10"></div>
                            <div className="relative">
                                <div className="inline-flex p-4 bg-ton-wood rounded-full mb-6">
                                    <Star className="h-8 w-8 text-white" />
                                </div>
                                <h3 className="text-2xl font-bold text-ton-black mb-4">
                                    Perfilado de Barba
                                </h3>
                                <p className="text-gray-600 leading-relaxed">
                                    Ritual de toalla caliente, aceites esenciales y navaja para un acabado impecable y profesional.
                                </p>
                            </div>
                        </div>

                        {/* Service 3 */}
                        <div className="group relative bg-white p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border-t-4 border-ton-black">
                            <div className="absolute top-0 right-0 w-20 h-20 bg-ton-wood opacity-10 transform rotate-45 translate-x-10 -translate-y-10"></div>
                            <div className="relative">
                                <div className="inline-flex p-4 bg-ton-black rounded-full mb-6">
                                    <Clock className="h-8 w-8 text-white" />
                                </div>
                                <h3 className="text-2xl font-bold text-ton-black mb-4">
                                    Tratamientos Premium
                                </h3>
                                <p className="text-gray-600 leading-relaxed">
                                    Camuflaje de canas, nutrición capilar y tratamientos especializados para mantener tu cabello saludable.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="bg-ton-black text-white">
                <div className="container mx-auto py-16 px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div>
                            <div className="flex items-center space-x-3 mb-4">
                                <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center">
                                    <span className="text-ton-black font-bold text-xl">TON</span>
                                </div>
                                <div>
                                    <h3 className="font-bold text-xl">TON</h3>
                                    <p className="text-sm text-gray-400">LA BARBERÍA</p>
                                </div>
                            </div>
                            <p className="text-gray-400 text-sm">
                                Estilo y distinción en cada corte
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold mb-4 text-ton-wood">Contacto</h4>
                            <div className="space-y-2 text-gray-400 text-sm">
                                <div className="flex items-center">
                                    <MapPin className="h-4 w-4 mr-2" />
                                    <span>Dirección de la barbería</span>
                                </div>
                                <div className="flex items-center">
                                    <Clock className="h-4 w-4 mr-2" />
                                    <span>Lun - Sab: 09:00 - 20:00</span>
                                </div>
                            </div>
                        </div>


                    </div>

                    <div className="mt-12 pt-8 border-t border-gray-800 text-center text-gray-500 text-sm">
                        <p>&copy; 2026 TON - La Barbería. Todos los derechos reservados.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomePage;
