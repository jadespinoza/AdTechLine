// Componente ClienteFormulario - Registrar / Validar RNC con DGII
function ClienteFormulario({ onGuardarCliente, onCancelar }) {
    const [formData, setFormData] = React.useState({
        rncCedula: '',
        nombre: '',
        nombreComercial: '',
        actividad: '',
        estado: '',
        regimen: ''
    });
    const [loading, setLoading] = React.useState(false);
    const [mensaje, setMensaje] = React.useState({ texto: '', tipo: '' });

    // Manejar cambios en los inputs
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    // Verificar el RNC o Cédula en el padrón DGII local
    const handleVerificarDGII = async () => {
        const query = formData.rncCedula.trim();
        if (!query) {
            setMensaje({ texto: 'Por favor, introduce un RNC o Cédula válido.', tipo: 'error' });
            return;
        }

        setLoading(true);
        setMensaje({ texto: 'Buscando en el registro de la DGII...', tipo: 'info' });

        try {
            const response = await fetch('./DGII_RNC_2.TXT');
            if (!response.ok) {
                // Intentar fallback si el nombre de archivo varía
                const resAlt = await fetch('./DGII_RNC.TXT');
                if (!resAlt.ok) throw new Error('Archivo DGII no disponible.');
                var text = await resAlt.text();
            } else {
                var text = await response.text();
            }
            
            const lines = text.split('\n');
            let encontrado = null;

            for (let line of lines) {
                const parts = line.split('|');
                if (parts.length > 0 && parts[0].trim() === query) {
                    encontrado = {
                        rncCedula: parts[0]?.trim() || '',
                        nombre: parts[1]?.trim() || '',
                        nombreComercial: parts[2]?.trim() || '',
                        actividad: parts[3]?.trim() || '',
                        estado: parts[9]?.trim() || '',
                        regimen: parts[10]?.trim() || ''
                    };
                    break;
                }
            }

            if (encontrado) {
                setFormData(encontrado);
                setMensaje({ 
                    texto: `¡Contribuyente encontrado! Estado: ${encontrado.estado || 'ACTIVO'}`, 
                    tipo: 'success' 
                });
            } else {
                setMensaje({ 
                    texto: 'No se encontró el RNC/Cédula en el padrón cargado. Puedes completar los datos manualmente.', 
                    tipo: 'warning' 
                });
            }
        } catch (error) {
            console.error('Error al leer el archivo DGII:', error);
            setMensaje({ texto: 'Error o archivo de padrón DGII no encontrado. Puedes ingresarlo manualmente.', tipo: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleSave = () => {
        if (!formData.nombre && !formData.rncCedula) {
            setMensaje({ texto: 'Por favor ingrese al menos el RNC/Cédula o Nombre del cliente.', tipo: 'error' });
            return;
        }
        if (onGuardarCliente) {
            onGuardarCliente({
                id: Date.now().toString(),
                nombre: formData.nombre || formData.nombreComercial || 'Cliente Fiscal',
                rnc: formData.rncCedula,
                actividad: formData.actividad,
                estado: formData.estado,
                regimen: formData.regimen,
                cxc: 0
            });
        }
        setMensaje({ texto: 'Cliente guardado correctamente.', tipo: 'success' });
    };

    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md max-w-2xl mx-auto border border-slate-200 dark:border-slate-700">
            <h2 className="text-xl font-bold mb-4 text-slate-800 dark:text-white flex items-center gap-2">
                <span>📋</span> Registrar Nuevo Cliente / Factura Fiscal
            </h2>

            {/* Alerta de Estado */}
            {mensaje.texto && (
                <div className={`p-3 mb-4 rounded-lg text-sm ${
                    mensaje.tipo === 'success' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' :
                    mensaje.tipo === 'warning' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300' :
                    mensaje.tipo === 'error' ? 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300' :
                    'bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-300'
                }`}>
                    {mensaje.texto}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* RNC / Cédula con Botón Verificar */}
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">RNC o Cédula</label>
                    <div className="flex gap-2">
                        <input 
                            type="text"
                            name="rncCedula"
                            value={formData.rncCedula}
                            onChange={handleChange}
                            placeholder="Ej. 00112345678 o RNC"
                            className="flex-1 px-3 py-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 focus:ring-2 focus:ring-sky-500"
                        />
                        <button
                            type="button"
                            onClick={handleVerificarDGII}
                            disabled={loading}
                            className="bg-sky-500 hover:bg-sky-600 text-white px-5 py-2 rounded-lg font-medium transition flex items-center gap-2 disabled:opacity-50 shadow-sm"
                        >
                            {loading ? 'Verificando...' : '🔍 Verificar DGII'}
                        </button>
                    </div>
                </div>

                {/* Razón Social / Nombre */}
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">Razón Social / Nombre Completo</label>
                    <input 
                        type="text"
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleChange}
                        placeholder="Nombre del contribuyente"
                        className="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600"
                    />
                </div>

                {/* Nombre Comercial */}
                <div>
                    <label className="block text-sm font-medium mb-1">Nombre Comercial (Opcional)</label>
                    <input 
                        type="text"
                        name="nombreComercial"
                        value={formData.nombreComercial}
                        onChange={handleChange}
                        placeholder="Ej. Colmado o Negocio"
                        className="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600"
                    />
                </div>

                {/* Actividad Económica */}
                <div>
                    <label className="block text-sm font-medium mb-1">Actividad Económica</label>
                    <input 
                        type="text"
                        name="actividad"
                        value={formData.actividad}
                        onChange={handleChange}
                        placeholder="Actividad registrada"
                        className="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600"
                    />
                </div>

                {/* Estado DGII */}
                <div>
                    <label className="block text-sm font-medium mb-1">Estado DGII</label>
                    <input 
                        type="text"
                        name="estado"
                        value={formData.estado}
                        onChange={handleChange}
                        readOnly
                        className="w-full px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-900 dark:border-slate-600 text-slate-500 font-semibold"
                    />
                </div>

                {/* Régimen de Pagos */}
                <div>
                    <label className="block text-sm font-medium mb-1">Régimen / Tipo</label>
                    <input 
                        type="text"
                        name="regimen"
                        value={formData.regimen}
                        onChange={handleChange}
                        readOnly
                        className="w-full px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-900 dark:border-slate-600 text-slate-500 font-semibold"
                    />
                </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
                {onCancelar && (
                    <button 
                        type="button"
                        onClick={onCancelar}
                        className="px-4 py-2 border rounded-lg hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-700 text-sm font-medium"
                    >
                        Cancelar
                    </button>
                )}
                <button 
                    type="button"
                    onClick={handleSave}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition shadow-sm text-sm"
                >
                    Guardar Cliente Fiscal
                </button>
            </div>
        </div>
    );
}
