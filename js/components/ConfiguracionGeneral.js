// Componente ConfiguracionGeneral - Manejo de datos de la empresa, impuestos y tema visual
function ConfiguracionGeneral({ config, setConfig, theme, setTheme, itbisRate, setItbisRate }) {
    const [formData, setFormData] = React.useState(() => {
        const saved = localStorage.getItem('adtech_negocio_config');
        return saved ? JSON.parse(saved) : {
            nombreNegocio: 'Cafetería & Restaurant AdTech',
            rnc: '130999888',
            telefono: '(809) 555-0192',
            direccion: 'Santo Domingo, R.D.',
            moneda: 'RD$',
            itbis: itbisRate || 18,
            tema: theme || 'light',
            pieFactura: '¡Gracias por su compra en AdTech!'
        };
    });

    const [mensaje, setMensaje] = React.useState({ texto: '', tipo: '' });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleGuardarConfig = (e) => {
        e.preventDefault();
        localStorage.setItem('adtech_negocio_config', JSON.stringify(formData));
        
        if (setItbisRate) setItbisRate(Number(formData.itbis));
        if (setTheme && formData.tema) {
            if (formData.tema === 'auto') {
                const autoTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                setTheme(autoTheme);
            } else {
                setTheme(formData.tema);
            }
        }
        if (setConfig) setConfig(formData);

        setMensaje({ texto: '¡Configuración del negocio guardada exitosamente!', tipo: 'success' });
        setTimeout(() => setMensaje({ texto: '', tipo: '' }), 4000);
    };

    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 max-w-4xl mx-auto space-y-6">
            <h2 className="text-xl font-bold mb-1 text-slate-800 dark:text-white flex items-center gap-2">
                <span>⚙️</span> Configuración General del Sistema y Negocio
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                Personaliza los datos fiscales, apariencia visual, moneda predeterminada y políticas de facturación.
            </p>

            {mensaje.texto && (
                <div className={`p-3 mb-6 rounded-lg text-sm flex items-center justify-between ${
                    mensaje.tipo === 'success' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' :
                    'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300'
                }`}>
                    <span>{mensaje.texto}</span>
                    <button onClick={() => setMensaje({ texto: '', tipo: '' })} className="font-bold px-2">×</button>
                </div>
            )}

            <form onSubmit={handleGuardarConfig} className="space-y-6">
                {/* Datos del Negocio */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Nombre del Negocio</label>
                        <input 
                            type="text"
                            name="nombreNegocio"
                            value={formData.nombreNegocio}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 focus:ring-2 focus:ring-sky-500 text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">RNC Empresa</label>
                        <input 
                            type="text"
                            name="rnc"
                            value={formData.rnc}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 focus:ring-2 focus:ring-sky-500 text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Teléfono</label>
                        <input 
                            type="text"
                            name="telefono"
                            value={formData.telefono}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 focus:ring-2 focus:ring-sky-500 text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Símbolo de Moneda</label>
                        <input 
                            type="text"
                            name="moneda"
                            value={formData.moneda}
                            onChange={handleChange}
                            placeholder="RD$, $, €"
                            className="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 focus:ring-2 focus:ring-sky-500 text-sm"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Dirección Física</label>
                        <input 
                            type="text"
                            name="direccion"
                            value={formData.direccion}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 focus:ring-2 focus:ring-sky-500 text-sm"
                        />
                    </div>
                </div>

                <hr className="border-slate-200 dark:border-slate-700" />

                {/* Impuestos y Tema */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">ITBIS (%)</label>
                        <input 
                            type="number"
                            step="0.1"
                            name="itbis"
                            value={formData.itbis}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 focus:ring-2 focus:ring-sky-500 text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Tema Visual</label>
                        <select 
                            name="tema"
                            value={formData.tema}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 focus:ring-2 focus:ring-sky-500 text-sm"
                        >
                            <option value="auto">Automático (Seguir Sistema)</option>
                            <option value="light">Claro (Celeste / Blanco)</option>
                            <option value="dark">Oscuro (Negro / Azul)</option>
                        </select>
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Mensaje al Pie de Factura</label>
                        <textarea 
                            name="pieFactura"
                            rows="2"
                            value={formData.pieFactura}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 focus:ring-2 focus:ring-sky-500 text-sm"
                        ></textarea>
                    </div>
                </div>

                <div className="flex justify-end pt-2">
                    <button
                        type="submit"
                        className="bg-sky-500 hover:bg-sky-600 text-white px-6 py-2.5 rounded-lg font-semibold transition shadow-md text-sm flex items-center gap-2"
                    >
                        <span>💾</span> Guardar Configuración
                    </button>
                </div>
            </form>
        </div>
    );
}
