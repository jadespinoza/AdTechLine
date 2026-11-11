// Componente ConfiguracionDatos - Gestión de almacenamiento local y respaldos
function ConfiguracionDatos({ onActualizarEstadisticas }) {
    const [stats, setStats] = React.useState({ productos: 0, ventas: 0, clientes: 0, tamano: '0 KB' });
    const [mensaje, setMensaje] = React.useState({ texto: '', tipo: '' });
    const fileInputRef = React.useRef(null);

    React.useEffect(() => {
        calcularEstadisticas();
    }, []);

    const calcularEstadisticas = () => {
        try {
            const productos = JSON.parse(localStorage.getItem('adtech_products') || '[]');
            const ventas = JSON.parse(localStorage.getItem('adtech_ventas') || '[]');
            const clientes = JSON.parse(localStorage.getItem('adtech_clients') || '[]');

            let totalBytes = 0;
            for (let key in localStorage) {
                if (localStorage.hasOwnProperty(key)) {
                    totalBytes += ((localStorage[key].length + key.length) * 2);
                }
            }
            const tamanoKB = (totalBytes / 1024).toFixed(2) + ' KB';

            const dataStats = {
                productos: productos.length,
                ventas: ventas.length,
                clientes: clientes.length,
                tamano: tamanoKB
            };
            setStats(dataStats);
            if (onActualizarEstadisticas) onActualizarEstadisticas(dataStats);
        } catch (error) {
            console.error('Error al calcular estadísticas:', error);
        }
    };

    // 1. Descargar Respaldo (.json)
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
            console.error(error);
            setMensaje({ texto: 'Error al generar el respaldo de datos.', tipo: 'error' });
        }
    };

    // 2. Restaurar Respaldo
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
                setMensaje({ texto: '¡Datos restaurados correctamente! Por favor recargue la página si no ve los cambios de inmediato.', tipo: 'success' });
            } catch (error) {
                console.error(error);
                setMensaje({ texto: 'El archivo de respaldo no es válido o está corrupto.', tipo: 'error' });
            }
        };
        reader.readAsText(file);
        e.target.value = '';
    };

    // 3. Borrar Todos los Datos
    const handleBorrarTodo = () => {
        const confirmacion1 = window.confirm('⚠️ ¿Estás COMPLETAMENTE SEGURO de borrar todos los datos del sistema? Esta acción no se puede deshacer.');
        if (!confirmacion1) return;

        const confirmacion2 = window.prompt('Escribe "BORRAR" en mayúsculas para confirmar la eliminación de la base de datos local:');
        if (confirmacion2 === 'BORRAR') {
            const keysToRemove = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key.startsWith('adtech_') || key.startsWith('jacko_')) {
                    keysToRemove.push(key);
                }
            }
            keysToRemove.forEach(k => localStorage.removeItem(k));

            calcularEstadisticas();
            setMensaje({ texto: 'Se han borrado todos los datos del sistema correctamente.', tipo: 'warning' });
        } else {
            setMensaje({ texto: 'Operación cancelada. La palabra de confirmación no coincide.', tipo: 'info' });
        }
    };

    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 max-w-4xl mx-auto space-y-6">
            <h2 className="text-xl font-bold mb-2 text-slate-800 dark:text-white flex items-center gap-2">
                <span>⚙️</span> Configuración y Respaldo de Base de Datos
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                Administra el almacenamiento local, exporta respaldos preventivos o restablece el sistema de tu POS.
            </p>

            {/* Alerta de Estado */}
            {mensaje.texto && (
                <div className={`p-3 mb-6 rounded-lg text-sm flex items-center justify-between ${
                    mensaje.tipo === 'success' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' :
                    mensaje.tipo === 'warning' ? 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300' :
                    'bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-300'
                }`}>
                    <span>{mensaje.texto}</span>
                    <button onClick={() => setMensaje({ texto: '', tipo: '' })} className="font-bold px-2">×</button>
                </div>
            )}

            {/* SECCIÓN 1: DATOS (ESTADÍSTICAS) */}
            <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700">
                <h3 className="text-md font-semibold mb-3 text-slate-700 dark:text-slate-200 flex items-center gap-2">
                    <span>📊</span> Resumen de Datos Actuales
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div className="bg-white dark:bg-slate-800 p-3 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700">
                        <span className="block text-2xl font-bold text-sky-600">{stats.productos}</span>
                        <span className="text-xs text-slate-500 uppercase tracking-wider">Productos</span>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-3 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700">
                        <span className="block text-2xl font-bold text-emerald-600">{stats.ventas}</span>
                        <span className="text-xs text-slate-500 uppercase tracking-wider">Ventas / Facturas</span>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-3 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700">
                        <span className="block text-2xl font-bold text-sky-600">{stats.clientes}</span>
                        <span className="text-xs text-slate-500 uppercase tracking-wider">Clientes Frecuentes</span>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-3 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700">
                        <span className="block text-2xl font-bold text-amber-600">{stats.tamano}</span>
                        <span className="text-xs text-slate-500 uppercase tracking-wider">Uso Local</span>
                    </div>
                </div>
            </div>

            {/* SECCIÓN 2: ACCIONES DE RESPALDO Y BORRADO */}
            <div className="space-y-4">
                {/* Descargar Respaldo */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg gap-4">
                    <div>
                        <h4 className="font-semibold text-slate-800 dark:text-white">Descargar Respaldo (Backup)</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Guarda una copia de seguridad en formato JSON de todos tus registros locales.</p>
                    </div>
                    <button
                        onClick={handleDescargarRespaldo}
                        className="bg-sky-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-sky-600 transition flex items-center gap-2 whitespace-nowrap shadow-sm text-sm"
                    >
                        <span>📥</span> Descargar JSON
                    </button>
                </div>

                {/* Restaurar Respaldo */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg gap-4">
                    <div>
                        <h4 className="font-semibold text-slate-800 dark:text-white">Restaurar Respaldo</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Carga un archivo JSON previo para recuperar la base de datos de AdTech.</p>
                    </div>
                    <div>
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handleFileChange} 
                            accept=".json" 
                            className="hidden" 
                        />
                        <button
                            onClick={() => fileInputRef.current.click()}
                            className="bg-slate-700 text-white px-4 py-2 rounded-lg font-medium hover:bg-slate-800 dark:bg-slate-600 dark:hover:bg-slate-500 transition flex items-center gap-2 whitespace-nowrap text-sm"
                        >
                            <span>📤</span> Seleccionar Archivo
                        </button>
                    </div>
                </div>

                {/* Borrar Todos los Datos */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border border-rose-200 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/20 rounded-lg gap-4">
                    <div>
                        <h4 className="font-semibold text-rose-700 dark:text-rose-400">Borrar Todos los Datos</h4>
                        <p className="text-xs text-rose-600/70 dark:text-rose-300/70">Elimina permanentemente el inventario, ventas y clientes almacenados localmente.</p>
                    </div>
                    <button
                        onClick={handleBorrarTodo}
                        className="bg-rose-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-rose-700 transition flex items-center gap-2 whitespace-nowrap shadow-sm text-sm"
                    >
                        <span>🗑️</span> Borrar Todo
                    </button>
                </div>
            </div>
        </div>
    );
}
