import React, { useEffect, useState } from 'react';
import api from '../../services/api';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await api.get('/users');
                setUsers(res.data || []);
            } catch (err) {
                console.error('Error cargando usuarios', err);
            }
        };
        fetchUsers();
    }, []);

    return (
        <div>
            <h2 className="text-xl font-semibold mb-4">Usuarios</h2>
            <div className="bg-white rounded-md shadow-sm border border-gray-100 overflow-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="text-sm text-gray-500">
                            <th className="px-4 py-2">ID</th>
                            <th className="px-4 py-2">Nombre</th>
                            <th className="px-4 py-2">Teléfono</th>
                            <th className="px-4 py-2">Email</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.length === 0 && (
                            <tr><td className="p-4" colSpan={3}>No hay usuarios</td></tr>
                        )}
                        {users.map(u => (
                            <tr key={u.id} className="border-t">
                                <td className="px-4 py-2">{u.id}</td>
                                <td className="px-4 py-2">{u.name}</td>
                                <td className="px-4 py-2">{u.phone}</td>
                                <td className="px-4 py-2">{u.email}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminUsers;
