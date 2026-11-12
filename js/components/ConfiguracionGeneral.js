// Componente ConfiguracionGeneral - Manejo de datos de la empresa, impuestos, tema visual y respaldos integrados
function ConfiguracionGeneral({ config, setConfig, theme, setTheme, itbisRate, setItbisRate }) {
    const [formData, setFormData] = React.useState(() => {
        const saved = localStorage.getItem('adtech_negocio_config');
        return saved ? JSON.parse(saved) : {
            nombreNegocio: 'Cafetería & Restaurant AdTech',
            rnc: '131-23456-7',
            telefono: '(809) 555-0192',
            direccion: 'Av. Principal #42, Santo Domingo',
            moneda: 'RD$',
            itbis: itbisRate || 18,
            tema: theme || 'auto',
            pieFactura: '¡Gracias por su compra! Vuelva pronto.'
        };
    });

    const [stats, setStats] = React.useState({ productos: 0, ventas: 0, clientes: 0, tamano: '0 KB' });
    const [mensaje, setMensaje] = React.useState({ texto: '', tipo: '' });
    const fileInputRef = React.useRef(null);

    React.useEffect(() => {
        calcularEstadisticas();
    }, []);

    const calcularEstadisticas = () => {
        try {
            const productos = JSON.parse(localStorage.getItem('adtech_productos') || '[]');
            const ventas = JSON.parse(localStorage.getItem('adtech_ventas') || '[]');
            const clientes = JSON.parse(localStorage.getItem('adtech_clientes') || '[]');

            let totalBytes = 0;
            for (let key in localStorage) {
                if (localStorage.hasOwnProperty(key)) {
                    totalBytes += ((localStorage[key].length + key.length) * 2);
                }
            }
            setStats({
                productos: productos.length,
                ventas: ventas.length,
                clientes: clientes.length,
                tamano: (totalBytes / 1024).toFixed(2) + ' KB'
            });
        } catch (e) {
            console.error(e);
        }
    };

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
                setTheme(formData.tema === 'oscuro' ? 'dark' : 'light');
            }
        }
        if (setConfig) setConfig(formData);

        setMensaje({ texto: '¡Configuración del negocio guardada exitosamente!', tipo: 'success' });
        setTimeout(() => setMensaje({ texto: '', tipo: '' }), 4000);
    };

    const handleDescargarRespaldo = () => {
        try {
            const backupData = {};
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key.startsWith('adtech_') || key.startsWith('jacko_')) {
                    backupData[key] = JSON.parse(localStorage.getItem(key));
                }
            }
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
            const downloadAnchor = document.createElement('a');
            const fechaStr = new Date().toISOString().slice(0, 10);
            downloadAnchor.setAttribute("href", dataStr);
            downloadAnchor.setAttribute("download", `AdTech_Respaldo_${fechaStr}.json`);
            document.body.appendChild(downloadAnchor);
            downloadAnchor.click();
            downloadAnchor.remove();
            setMensaje({ texto: '¡Respaldo descargado exitosamente!', tipo: 'success' });
        } catch (error) {
            setMensaje({ texto: 'Error al generar el respaldo.', tipo: 'error' });
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const backupData = JSON.parse(event.target.result);
                Object.keys(backupData).forEach(key => {
                    localStorage.setItem(key, JSON.stringify(backupData[key]));
                });
                calcularEstadisticas();
                const savedConfig = localStorage.getItem('adtech_negocio_config');
                if (savedConfig) {
                    const parsed = JSON.parse(savedConfig);
                    setFormData(parsed);
                    if (setConfig) setConfig(parsed);
                }
                setMensaje({ texto: '¡Datos restaurados correctamente! Recarga la página.', tipo: 'success' });
            } catch (error) {
                setMensaje({ texto: 'El archivo de respaldo no es válido.', tipo: 'error' });
            }
        };
        reader.readAsText(file);
        e.target.value = '';
    };

    const handleBorrarTodo = () => {
        if (!window.confirm('⚠️ ¿Estás SEGURO de borrar todos los datos locales de AdTech?')) return;
        const confirmacion = window.prompt('Escribe "BORRAR" en mayúsculas para confirmar:');
        if (confirmacion === 'BORRAR') {
            const keysToRemove = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key.startsWith('adtech_') || key.startsWith('jacko_')) {
                    keysToRemove.push(key);
                }
            }
            keysToRemove.forEach(k => localStorage.removeItem(k));
            calcularEstadisticas();
            setMensaje({ texto: 'Se han borrado todos los datos del sistema.', tipo: 'warning' });
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-12">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md border border-slate-200 dark:border-slate-700">
                <h2 className="text-xl font-bold mb-1 text-slate-800 dark:text-white flex items-center gap-2">
                    <span>⚙️</span> Configuración General del Sistema y Negocio
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                    Personaliza los datos fiscales, apariencia visual, moneda predeterminada y políticas de facturación.
                </p>

                {mensaje.texto && (
                    <div className={`p-3 mb-6 rounded-lg text-sm flex items-center justify-between ${
                        mensaje.tipo === 'success' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' :
                        mensaje.tipo === 'warning' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300' :
                        'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300'
                    }`}>
                        <span>{mensaje.texto}</span>
                        <button onClick={() => setMensaje({ texto: '', tipo: '' })} className="font-bold px-2">×</button>
                    </div>
                )}

                <form onSubmit={handleGuardarConfig} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Nombre del Negocio</label>
                            <input 
                                type="text"
                                name="nombreNegocio"
                                value={formData.nombreNegocio}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 focus:ring-2 focus:ring-sky-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">RNC</label>
                            <input 
                                type="text"
                                name="rnc"
                                value={formData.rnc}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 focus:ring-2 focus:ring-sky-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Teléfono</label>
                            <input 
                                type="text"
                                name="telefono"
                                value={formData.telefono}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 focus:ring-2 focus:ring-sky-500"
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
                                className="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 focus:ring-2 focus:ring-sky-500"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Dirección</label>
                            <input 
                                type="text"
                                name="direccion"
                                value={formData.direccion}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 focus:ring-2 focus:ring-sky-500"
                            />
                        </div>
                    </div>

                    <hr className="border-slate-200 dark:border-slate-700" />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">ITBIS (%)</label>
                            <input 
                                type="number"
                                step="0.1"
                                name="itbis"
                                value={formData.itbis}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 focus:ring-2 focus:ring-sky-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Tema Visual</label>
                            <select 
                                name="tema"
                                value={formData.tema}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 focus:ring-2 focus:ring-sky-500"
                            >
                                <option value="auto">Automático</option>
                                <option value="claro">Claro</option>
                                <option value="oscuro">Oscuro</option>
                            </select>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Mensaje al pie de la factura</label>
                            <textarea 
                                name="pieFactura"
                                rows="2"
                                value={formData.pieFactura}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 focus:ring-2 focus:ring-sky-500"
                            ></textarea>
                        </div>
                    </div>

                    <div className="flex justify-end pt-2">
                        <button
                            type="submit"
                            className="bg-sky-500 hover:bg-sky-600 text-white px-6 py-2.5 rounded-lg font-semibold transition shadow-md flex items-center gap-2"
                        >
                            <span>💾</span> Guardar configuración
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
