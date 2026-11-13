// Componente para Administrar y Modificar Dinámicamente el Menú del Día
function MenuDiaConfigModulo({ menuDiaConfig, setMenuDiaConfig }) {
    const [nuevoSubmenuNombre, setNuevoSubmenuNombre] = React.useState('');
    const [nuevoSubmenuKey, setNuevoSubmenuKey] = React.useState('');
    const [nuevoElementoTextos, setNuevoElementoTextos] = React.useState({});

    // Guardar cambios en localStorage
    const guardarCambios = (updatedConfig) => {
        setMenuDiaConfig(updatedConfig);
        localStorage.setItem('adtech_menu_dia_config', JSON.stringify(updatedConfig));
    };

    // Agregar un nuevo Submenú (ej. Sopas, Postres, Bebidas del Día)
    const handleAgregarSubmenu = (e) => {
        e.preventDefault();
        if (!nuevoSubmenuNombre) return alert('Ingrese el nombre del nuevo submenú.');
        const key = nuevoSubmenuKey || nuevoSubmenuNombre.toLowerCase().replace(/\s+/g, '_');
        
        if (menuDiaConfig.submenusDinamicos && menuDiaConfig.submenusDinamicos[key]) {
            return alert('Ya existe un submenú con esa clave/identificador.');
        }

        const actualizado = {
            ...menuDiaConfig,
            submenusDinamicos: {
                ...(menuDiaConfig.submenusDinamicos || {}),
                [key]: {
                    titulo: nuevoSubmenuNombre,
                    elementos: []
                }
            }
        };

        guardarCambios(actualizado);
        setNuevoSubmenuNombre('');
        setNuevoSubmenuKey('');
    };

    // Agregar un elemento a un submenú específico
    const handleAgregarElemento = (key) => {
        const texto = nuevoElementoTextos[key];
        if (!texto) return alert('Escriba el nombre del elemento a agregar.');

        const submenusActuales = menuDiaConfig.submenusDinamicos || {};
        const targetSubmenu = submenusActuales[key];
        
        const nuevoElemento = {
            id: 'elem-' + Date.now(),
            nombre: texto,
            disponible: true
        };

        targetSubmenu.elementos.push(nuevoElemento);

        guardarCambios({
            ...menuDiaConfig,
            submenusDinamicos: submenusActuales
        });

        setNuevoElementoTextos({ ...nuevoElementoTextos, [key]: '' });
    };

    // Eliminar un elemento de un submenú
    const handleEliminarElemento = (key, elemId) => {
        const submenusActuales = menuDiaConfig.submenusDinamicos || {};
        submenusActuales[key].elementos = submenusActuales[key].elementos.filter(e => e.id !== elemId);
        guardarCambios({ ...menuDiaConfig, submenusDinamicos: submenusActuales });
    };

    // Eliminar submenú completo
    const handleEliminarSubmenu = (key) => {
        if (confirm(`¿Está seguro de eliminar todo el submenú?`)) {
            const submenusActuales = menuDiaConfig.submenusDinamicos || {};
            delete submenusActuales[key];
            guardarCambios({ ...menuDiaConfig, submenusDinamicos: submenusActuales });
        }
    };

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-md border border-slate-200 dark:border-slate-700 space-y-6 max-w-4xl mx-auto">
            <div className="flex justify-between items-center border-b pb-4">
                <div>
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white">🍽️ Configuración Dinámica del Menú del Día</h2>
                    <p className="text-xs text-slate-500">Crea nuevos submenús, modifica títulos y agrega elementos personalizados.</p>
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Precio Base Plato del Día:</label>
                    <input
                        type="number"
                        value={menuDiaConfig.precioBase || 200}
                        onChange={e => guardarCambios({ ...menuDiaConfig, precioBase: Number(e.target.value) })}
                        className="w-32 p-2 bg-slate-50 dark:bg-slate-700 border rounded font-bold text-sky-600 text-sm"
                    />
                </div>
            </div>

            {/* Formulario para Crear Nuevo Submenú */}
            <form onSubmit={handleAgregarSubmenu} className="bg-slate-50 dark:bg-slate-700/40 p-4 rounded-xl border flex flex-col sm:flex-row gap-3 items-end">
                <div className="flex-1 w-full">
                    <label className="block text-xs font-semibold mb-1">Nombre del Nuevo Submenú (Ej. Postres, Sopas, Jugos)</label>
                    <input
                        type="text"
                        placeholder="Nombre de la categoría..."
                        value={nuevoSubmenuNombre}
                        onChange={e => setNuevoSubmenuNombre(e.target.value)}
                        className="w-full p-2.5 border rounded-lg dark:bg-slate-700 text-sm"
                        required
                    />
                </div>
                <button
                    type="submit"
                    className="bg-sky-500 hover:bg-sky-600 text-white font-bold px-4 py-2.5 rounded-lg text-sm transition whitespace-nowrap shadow"
                >
                    + Crear Submenú
                </button>
            </form>

            {/* Listado de Submenús Dinámicos */}
            <div className="space-y-6">
                {menuDiaConfig.submenusDinamicos && Object.keys(menuDiaConfig.submenusDinamicos).length > 0 ? (
                    Object.entries(menuDiaConfig.submenusDinamicos).map(([key, submenu]) => (
                        <div key={key} className="bg-slate-50 dark:bg-slate-700/30 p-5 rounded-xl border border-slate-200 dark:border-slate-700 space-y-4">
                            <div className="flex justify-between items-center">
                                <input
                                    type="text"
                                    value={submenu.titulo}
                                    onChange={e => {
                                        const submenusActuales = menuDiaConfig.submenusDinamicos;
                                        submenusActuales[key].titulo = e.target.value;
                                        guardarCambios({ ...menuDiaConfig, submenusDinamicos: submenusActuales });
                                    }}
                                    className="font-bold text-base bg-transparent border-b border-dashed border-sky-400 focus:outline-none text-sky-600 dark:text-sky-400"
                                />
                                <button
                                    onClick={() => handleEliminarSubmenu(key)}
                                    className="text-rose-500 hover:text-rose-700 text-xs font-bold bg-rose-50 dark:bg-slate-700 px-2.5 py-1 rounded"
                                >
                                    Eliminar Submenú
                                </button>
                            </div>

                            {/* Agregar elementos al submenú */}
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder={`Agregar opción en ${submenu.titulo}...`}
                                    value={nuevoElementoTextos[key] || ''}
                                    onChange={e => setNuevoElementoTextos({ ...nuevoElementoTextos, [key]: e.target.value })}
                                    className="flex-1 p-2 bg-white dark:bg-slate-800 border rounded-lg text-sm"
                                />
                                <button
                                    type="button"
                                    onClick={() => handleAgregarElemento(key)}
                                    className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-4 py-2 rounded-lg text-sm shadow"
                                >
                                    + Agregar
                                </button>
                            </div>

                            {/* Lista de elementos internos */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-2">
                                {submenu.elementos && submenu.elementos.map(elem => (
                                    <div key={elem.id} className="flex justify-between items-center bg-white dark:bg-slate-800 p-2.5 rounded-lg border shadow-sm">
                                        <span className="text-sm font-medium">{elem.nombre}</span>
                                        <button
                                            onClick={() => handleEliminarElemento(key, elem.id)}
                                            className="text-rose-500 hover:text-rose-700 font-bold text-xs"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-8 text-slate-400 text-sm">
                        No hay submenús dinámicos creados. Utiliza el formulario superior para agregar categorías.
                    </div>
                )}
            </div>
        </div>
    );
}