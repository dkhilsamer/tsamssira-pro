import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import { Trash2, Shield, UserX, Check } from 'lucide-react';

const UsersPage = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const currentUser = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const data = await api.get('/auth/users');
            setUsers(data);
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur et TOUTES ses propriétés ? Cette action est irréversible.')) return;

        try {
            await api.delete(`/auth/users/${userId}`);
            toast.success('Utilisateur supprimé');
            setUsers(users.filter(u => u.id !== userId));
        } catch (error) {
            toast.error(error.message);
        }
    };

    const handlePromoteAdmin = async (userId, currentRole) => {
        if (currentRole === 'admin') return; // Déjà admin
        if (!window.confirm('Voulez-vous promouvoir cet utilisateur Administrateur ?')) return;

        try {
            await api.put(`/auth/users/${userId}/role`, { role: 'admin' });
            toast.success('Rôle mis à jour');
            fetchUsers();
        } catch (error) {
            toast.error(error.message);
        }
    };

    if (loading) return <div className="loading-state"><div className="spinner"></div></div>;

    return (
        <div className="container py-12">
            <h1 className="text-3xl font-bold mb-8 text-primary">Gestion des Utilisateurs</h1>

            <div className="overflow-x-auto bg-white rounded-xl shadow-lg border border-border">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 text-sm uppercase">
                            <th className="p-4">Utilisateur</th>
                            <th className="p-4">Email</th>
                            <th className="p-4">Rôle</th>
                            <th className="p-4">Mot de Passe (Admin View)</th>
                            <th className="p-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                <td className="p-4 font-medium text-gray-900">{user.username}</td>
                                <td className="p-4 text-gray-600">{user.email}</td>
                                <td className="p-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="p-4 text-gray-500 font-mono text-sm">
                                    {user.plain_password || 'Non visible'}
                                </td>
                                <td className="p-4 flex justify-end gap-2">
                                    {user.role !== 'admin' && (
                                        <button
                                            onClick={() => handlePromoteAdmin(user.id, user.role)}
                                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                            title="Promouvoir Admin"
                                        >
                                            <Shield size={18} />
                                        </button>
                                    )}
                                    {/* Prevent deleting self or Tadmin */}
                                    {user.username !== 'Tadmin' && user.id !== currentUser.id && (
                                        <button
                                            onClick={() => handleDeleteUser(user.id)}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Supprimer Utilisateur"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <style jsx>{`
                .text-primary { color: var(--primary); }
                .text-3xl { font-size: 1.875rem; }
                .font-bold { font-weight: 700; }
                .mb-8 { margin-bottom: 2rem; }
                .bg-white { background-color: white; }
                .rounded-xl { border-radius: 0.75rem; }
                .shadow-lg { box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); }
                .border { border-width: 1px; }
                .border-border { border-color: var(--border); }
                .w-full { width: 100%; }
                .bg-gray-50 { background-color: #f9fafb; }
                .border-b { border-bottom-width: 1px; }
                .border-gray-200 { border-color: #e5e7eb; }
                .p-4 { padding: 1rem; }
                .text-sm { font-size: 0.875rem; }
                .uppercase { text-transform: uppercase; }
                .text-gray-600 { color: #4b5563; }
                .bg-purple-100 { background-color: #f3e8ff; }
                .text-purple-700 { color: #7e22ce; }
                .bg-blue-100 { background-color: #dbeafe; }
                .text-blue-700 { color: #1d4ed8; }
                .font-mono { font-family: monospace; }
                .hover\:bg-gray-50:hover { background-color: #f9fafb; }
                .hover\:bg-green-50:hover { background-color: #f0fdf4; }
                .hover\:bg-red-50:hover { background-color: #fef2f2; }
                .text-green-600 { color: #16a34a; }
                .text-red-600 { color: #dc2626; }
                .flex { display: flex; }
                .justify-end { justify-content: flex-end; }
                .gap-2 { gap: 0.5rem; }
            `}</style>
        </div>
    );
};

export default UsersPage;
