import React, { useState } from 'react';
import api from '../../services/api';

const AdminSettings = () => {
    const [businessName, setBusinessName] = useState('Barbería Ayrton');

    const handleSave = async () => {
        try {
            // placeholder: save settings to API
            await api.post('/admin/settings', { businessName });
            alert('Ajustes guardados');
        } catch (err) {
            console.error(err);
            alert('Error al guardar');
        }
    };

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h2 className="text-3xl font-bold text-ton-black mb-6">Ajustes</h2>

            <div className="bg-white rounded-lg shadow-lg border border-gray-200 border-t-4 border-t-ton-wood p-8 max-w-xl">
                <label className="block text-sm font-bold text-ton-black">Nombre del negocio</label>
                <input
                    className="mt-2 mb-6 block w-full border-2 border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-ton-wood focus:border-ton-wood transition-all"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                />

                <div>
                    <button
                        onClick={handleSave}
                        className="px-6 py-3 bg-ton-black text-white rounded-md font-bold hover:bg-ton-wood transition-colors shadow-md w-full sm:w-auto"
                    >
                        Guardar Cambios
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminSettings;
