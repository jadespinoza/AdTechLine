const ClientesModulo = ({ clients, setClients, negocioConfig, setShowClientModal }) => {
    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-md border border-slate-200 dark:border-slate-700 space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Administración de Clientes & CxC</h2>
                <button
                    onClick={() => setShowClientModal(true)}
                    className="bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded-lg font-semibold text-sm flex items-center space-x-2 shadow"
                >
                    <i data-lucide="user-plus" style={{ width: 16, height: 16 }} className="inline-block"></i>
                    <span>+ Verificar / Registrar Cliente (DGII)</span>
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                        <tr>
                            <th className="p-3">Nombre / Razón Social</th>
                            <th className="p-3">RNC / Cédula</th>
                            <th className="p-3">Saldo CxC (Pendiente)</th>
                            <th className="p-3">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                        {clients.map(c => (
                            <tr key={c.id}>
                                <td className="p-3 font-medium">{c.nombre}</td>
                                <td className="p-3">{c.rnc || 'N/A'}</td>
                                <td className="p-3 text-amber-600 dark:text-amber-400 font-bold">
                                    {negocioConfig.moneda || 'RD$'} {(c.cxc || 0).toFixed(2)}
                                </td>
                                <td className="p-3">
                                    {c.cxc > 0 && (
                                        <button
                                            onClick={() => {
                                                setClients(clients.map(x => x.id === c.id ? { ...x, cxc: 0 } : x));
                                                alert('Saldo de crédito pagado.');
                                            }}
                                            className="text-xs bg-emerald-500 text-white px-2.5 py-1 rounded hover:bg-emerald-600 font-medium"
                                        >
                                            Cobrar CxC
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
