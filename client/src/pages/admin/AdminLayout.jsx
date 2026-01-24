import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Grid, Users, Calendar, BarChart, Settings } from 'lucide-react';

const AdminLayout = () => {
    const location = useLocation();

    const isActive = (path) => {
        if (path === '/admin' && location.pathname === '/admin') return true;
        if (path !== '/admin' && location.pathname.includes(path)) return true;
        return false;
    };

    const navItemClass = (path) => `
        flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 font-medium text-sm
        ${isActive(path)
            ? 'bg-ton-black text-white shadow-md border-l-4 border-ton-wood'
            : 'text-gray-600 hover:bg-ton-gray-light hover:text-ton-black'
        }
    `;

    const iconClass = (path) => `
        w-5 h-5 
        ${isActive(path) ? 'text-ton-wood' : 'text-ton-black'}
    `;

    return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 min-h-[600px] flex flex-col md:flex-row overflow-hidden">
            {/* Sidebar */}
            <aside className="w-full md:w-64 bg-gray-50 border-b md:border-b-0 md:border-r border-gray-200">
                <div className="p-6 border-b border-gray-200 bg-white">
                    <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Menú Principal</h2>
                </div>
                <nav className="p-4 space-y-2">
                    <Link to="/admin" className={navItemClass('/admin')}>
                        <Grid className={iconClass('/admin')} />
                        <span>Resumen</span>
                    </Link>
                    <Link to="appointments" className={navItemClass('appointments')}>
                        <Calendar className={iconClass('appointments')} />
                        <span>Citas</span>
                    </Link>
                    <Link to="users" className={navItemClass('users')}>
                        <Users className={iconClass('users')} />
                        <span>Usuarios</span>
                    </Link>
                    <Link to="calendar" className={navItemClass('calendar')}>
                        <BarChart className={iconClass('calendar')} />
                        <span>Calendario</span>
                    </Link>

                    <div className="pt-4 mt-4 border-t border-gray-200">
                        <Link to="settings" className={navItemClass('settings')}>
                            <Settings className={iconClass('settings')} />
                            <span>Ajustes</span>
                        </Link>
                    </div>
                </nav>
            </aside>

            {/* Content Area */}
            <div className="flex-1 bg-white">
                <Outlet />
            </div>
        </div>
    );
};

export default AdminLayout;
