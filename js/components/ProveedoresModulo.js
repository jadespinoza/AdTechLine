const ProveedoresModulo = ({ suppliers, setSuppliers, negocioConfig }) => {
    const [showModal, setShowModal] = React.useState(false);
    const [form, setForm] = React.useState({ nombre: '', rnc: '', cxp: 0 });

    const handleAgregarProveedor = (e) => {
        e.preventDefault();
        if (!form.nombre.trim()) return alert('Ingrese el nombre del proveedor.');
        setSuppliers([...suppliers, { id: Date.now().toString(), nombre: form.nombre.trim(), rnc: form.rnc.trim(), cxp: Number(form.cxp) || 0 }]);
        setForm({ nombre: '', rnc: '', cxp: 0 });
        setShowModal(false);
    };

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-md border border-slate-200 dark:border-slate-700 space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Administración de Proveedores & CxP</h2>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded-lg font-semibold text-sm flex items-center space-x-2 shadow"
                >
                    <i data-lucide="truck" style={{ width: 16, height: 16 }} className="inline-block"></i>
                    <span>Agregar Proveedor</span>
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                        <tr>
                            <th className="p-3">Proveedor</th>
                            <th className="p-3">RNC</th>
                            <th className="p-3">Cuentas por Pagar (CxP)</th>
                            <th className="p-3">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                        {suppliers.map(s => (
                            <tr key={s.id}>
                                <td className="p-3 font-medium">{s.nombre}</td>
                                <td className="p-3">{s.rnc || 'N/A'}</td>
                                <td className="p-3 text-red-500 font-bold">{negocioConfig.moneda || 'RD$'} {(s.cxp || 0).toFixed(2)}</td>
                                <td className="p-3">
                                    <button
                                        onClick={() => {
                                            const monto = prompt('Monto a abonar/pagar a proveedor:');
                                            if (monto) {
                                                setSuppliers(suppliers.map(x => x.id === s.id ? { ...x, cxp: Math.max(0, x.cxp - Number(monto)) } : x));
                                            }
                                        }}
                                        className="text-xs bg-sky-500 text-white px-2.5 py-1 rounded hover:bg-sky-600 font-medium"
                                    >
                                        Abonar / Pagar
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl max-w-md w-full space-y-4 shadow-2xl border">
                        <h3 className="text-lg font-bold">Nuevo Proveedor</h3>
                        <form onSubmit={handleAgregarProveedor} className="space-y-3">
                            <div>
                                <label className="block text-xs font-semibold mb-1">Nombre / Razón Social *</label>
                                <input type="text" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} required className="w-full p-2.5 border rounded-lg dark:bg-slate-700 text-sm" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold mb-1">RNC</label>
                                <input type="text" value={form.rnc} onChange={e => setForm({ ...form, rnc: e.target.value })} className="w-full p-2.5 border rounded-lg dark:bg-slate-700 text-sm" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold mb-1">Saldo Inicial CxP ({negocioConfig.moneda || 'RD$'})</label>
                                <input type="number" value={form.cxp} onChange={e => setForm({ ...form, cxp: e.target.value })} className="w-full p-2.5 border rounded-lg dark:bg-slate-700 text-sm" />
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
