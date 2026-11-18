const UsuariosModulo = ({ users, setUsers, currentUser }) => {
    const [showModal, setShowModal] = React.useState(false);
    const [editing, setEditing] = React.useState(null);
    const [form, setForm] = React.useState({ username: '', pin: '', nombre: '', email: '', rol: 'cajero' });

    const handleSave = (e) => {
        e.preventDefault();
        if (!form.username || !form.pin || !form.nombre) return alert('Complete los campos obligatorios.');
        if (editing) {
            setUsers(users.map(u => u.id === editing.id ? { ...u, ...form } : u));
        } else {
            setUsers([...users, { id: Date.now().toString(), ...form }]);
        }
        setShowModal(false);
        setEditing(null);
        setForm({ username: '', pin: '', nombre: '', email: '', rol: 'cajero' });
    };

    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 space-y-6 max-w-4xl mx-auto">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-bold">Gestión de Usuarios y Permisos</h3>
                    <p className="text-xs text-slate-500">Administra cajeros, administradores y soporte técnico.</p>
                </div>
                <button
                    onClick={() => { setEditing(null); setForm({ username: '', pin: '', nombre: '', email: '', rol: 'cajero' }); setShowModal(true); }}
                    className="bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded-lg font-semibold text-sm shadow"
                >
                    + Nuevo Usuario
                </button>
            </div>

            <div className="overflow-x-auto border rounded-lg border-slate-200 dark:border-slate-700">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-100 dark:bg-slate-700/50">
                        <tr>
                            <th className="p-3">Nombre</th>
                            <th className="p-3">Usuario</th>
                            <th className="p-3">Rol</th>
                            <th className="p-3 text-center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                        {users.map(u => (
                            <tr key={u.id}>
                                <td className="p-3 font-medium">{u.nombre}</td>
                                <td className="p-3 font-mono text-slate-600 dark:text-slate-300">{u.username}</td>
                                <td className="p-3">
                                    <span className="px-2 py-0.5 rounded text-xs font-bold uppercase bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300">
                                        {u.rol}
                                    </span>
                                </td>
                                <td className="p-3 text-center space-x-2">
                                    <button
                                        onClick={() => { setEditing(u); setForm({ username: u.username, pin: u.pin, nombre: u.nombre, email: u.email || '', rol: u.rol || 'cajero' }); setShowModal(true); }}
                                        className="text-sky-600 text-xs bg-sky-50 dark:bg-slate-700 px-2.5 py-1 rounded font-medium"
                                    >
                                        Editar
                                    </button>
                                    {users.length > 1 && !(u.rol === 'soporte' && users.filter(x => x.rol === 'soporte').length <= 1) && (
                                        <button
                                            onClick={() => { if (confirm(`¿Eliminar a ${u.username}?`)) setUsers(users.filter(x => x.id !== u.id)); }}
                                            className="text-rose-500 text-xs bg-rose-50 dark:bg-slate-700 px-2.5 py-1 rounded font-medium"
                                        >
                                            Eliminar
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl max-w-md w-full space-y-4 shadow-2xl border">
                        <h3 className="text-lg font-bold">{editing ? 'Editar Usuario' : 'Nuevo Usuario'}</h3>
                        <form onSubmit={handleSave} className="space-y-3">
                            <div>
                                <label className="block text-xs font-semibold mb-1">Nombre Completo</label>
                                <input type="text" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} required className="w-full p-2.5 border rounded-lg dark:bg-slate-700 text-sm" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold mb-1">Usuario (Login)</label>
                                <input type="text" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} required className="w-full p-2.5 border rounded-lg dark:bg-slate-700 text-sm" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold mb-1">Contraseña / PIN</label>
                                <input type="password" value={form.pin} onChange={e => setForm({ ...form, pin: e.target.value })} required className="w-full p-2.5 border rounded-lg dark:bg-slate-700 text-sm" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold mb-1">Rol</label>
                                <select value={form.rol} onChange={e => setForm({ ...form, rol: e.target.value })} className="w-full p-2.5 border rounded-lg dark:bg-slate-700 text-sm">
                                    <option value="cajero">Cajero (Solo POS)</option>
                                    <option value="admin">Administrador (Inventario y Compras)</option>
                                    <option value="soporte">Soporte Técnico (Acceso Total)</option>
                                </select>
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <button type="button" onClick={() => setShowModal(false)} className="bg-slate-500 text-white px-4 py-2 rounded-lg text-sm font-medium">Cancelar</button>
                                <button type="submit" className="bg-sky-500 text-white px-5 py-2 rounded-lg text-sm font-bold">Guardar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
