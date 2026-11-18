const MenuDiaModulo = ({ menuDiaConfig, setMenuDiaConfig, negocioConfig }) => {
    const [nuevoSubmenuNombre, setNuevoSubmenuNombre] = React.useState('');
    const [nuevoElementoTextos, setNuevoElementoTextos] = React.useState({});
    const [nuevoElementoEsBase, setNuevoElementoEsBase] = React.useState({});

    const fechaMenu = menuDiaConfig.fechaMenu || new Date().toISOString().split('T')[0];
    const moneda = (negocioConfig && negocioConfig.moneda) ? negocioConfig.moneda : 'RD$';

    React.useEffect(() => {
        if (window.lucide) {
            window.lucide.createIcons();
        }
    });

    const guardarCambios = (updatedConfig) => {
        setMenuDiaConfig(updatedConfig);
        localStorage.setItem('adtech_menu_dia_config', JSON.stringify(updatedConfig));
    };

    const handleFechaChange = (nuevaFecha) => {
        guardarCambios({
            ...menuDiaConfig,
            fechaMenu: nuevaFecha
        });
    };

    const handleAgregarSubmenu = (e) => {
        e.preventDefault();
        if (!nuevoSubmenuNombre.trim()) return alert('Ingrese el nombre del nuevo submenú.');
        const key = nuevoSubmenuNombre.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '_');

        if (menuDiaConfig.submenusDinamicos && menuDiaConfig.submenusDinamicos[key]) {
            return alert('Ya existe un submenú con ese nombre.');
        }

        const actualizado = {
            ...menuDiaConfig,
            fechaMenu,
            submenusDinamicos: {
                ...(menuDiaConfig.submenusDinamicos || {}),
                [key]: {
                    titulo: nuevoSubmenuNombre.trim(),
                    elementos: []
                }
            }
        };

        guardarCambios(actualizado);
        setNuevoSubmenuNombre('');
    };

    const handleAgregarElemento = (key) => {
        const texto = nuevoElementoTextos[key];
        if (!texto || !texto.trim()) return alert('Escriba el nombre del elemento a agregar.');
        const esPlatoBase = nuevoElementoEsBase[key] || false;

        const submenusActuales = { ...(menuDiaConfig.submenusDinamicos || {}) };
        const targetSubmenu = { ...submenusActuales[key] };

        const nuevoElemento = {
            id: 'elem-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
            nombre: texto.trim(),
            disponible: true,
            esPlatoBase: esPlatoBase // Si es true, el sistema sabe que es plato fuerte (ej. Locrio) y no requiere que el usuario elija otra carne obligatoriamente
        };

        targetSubmenu.elementos = [...(targetSubmenu.elementos || []), nuevoElemento];
        submenusActuales[key] = targetSubmenu;

        guardarCambios({
            ...menuDiaConfig,
            fechaMenu,
            submenusDinamicos: submenusActuales
        });

        setNuevoElementoTextos({ ...nuevoElementoTextos, [key]: '' });
        setNuevoElementoEsBase({ ...nuevoElementoEsBase, [key]: false });
    };

    const handleToggleDisponible = (key, elemId) => {
        const submenusActuales = { ...(menuDiaConfig.submenusDinamicos || {}) };
        submenusActuales[key] = {
            ...submenusActuales[key],
            elementos: submenusActuales[key].elementos.map(el =>
                el.id === elemId ? { ...el, disponible: el.disponible === false ? true : false } : el
            )
        };
        guardarCambios({ ...menuDiaConfig, fechaMenu, submenusDinamicos: submenusActuales });
    };

    const handleTogglePlatoBase = (key, elemId) => {
        const submenusActuales = { ...(menuDiaConfig.submenusDinamicos || {}) };
        submenusActuales[key] = {
            ...submenusActuales[key],
            elementos: submenusActuales[key].elementos.map(el =>
                el.id === elemId ? { ...el, esPlatoBase: !el.esPlatoBase } : el
            )
        };
        guardarCambios({ ...menuDiaConfig, fechaMenu, submenusDinamicos: submenusActuales });
    };

    const handleEliminarElemento = (key, elemId) => {
        const submenusActuales = { ...(menuDiaConfig.submenusDinamicos || {}) };
        submenusActuales[key] = {
            ...submenusActuales[key],
            elementos: submenusActuales[key].elementos.filter(e => e.id !== elemId)
        };
        guardarCambios({ ...menuDiaConfig, fechaMenu, submenusDinamicos: submenusActuales });
    };

    const handleEliminarSubmenu = (key, titulo) => {
        if (confirm(`¿Está seguro de eliminar toda la categoría "${titulo}"?`)) {
            const submenusActuales = { ...(menuDiaConfig.submenusDinamicos || {}) };
            delete submenusActuales[key];
            guardarCambios({ ...menuDiaConfig, fechaMenu, submenusDinamicos: submenusActuales });
        }
    };

    const handleRenombrarSubmenu = (key, nuevoTitulo) => {
        const submenusActuales = { ...menuDiaConfig.submenusDinamicos };
        submenusActuales[key] = { ...submenusActuales[key], titulo: nuevoTitulo };
        guardarCambios({ ...menuDiaConfig, fechaMenu, submenusDinamicos: submenusActuales });
    };

    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-md border border-slate-200 dark:border-slate-700 space-y-6 max-w-6xl mx-auto">
            {/* ENCABEZADO SUPERIOR + FECHA DEL MENÚ */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 border-b border-slate-200 dark:border-slate-700 pb-5">
                <div>
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                        Gestión de Menú del Día &amp; Disponibilidad
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Active o desactive los acompañamientos y carnes, y marque cuáles arroces/platos son independientes (ej. Locrio no lleva carne).
                    </p>
                </div>

                <div className="flex items-center gap-3 self-start md:self-auto">
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 whitespace-nowrap">
                        Fecha del Menú:
                    </label>
                    <input
                        type="date"
                        value={fechaMenu}
                        onChange={e => handleFechaChange(e.target.value)}
                        className="bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-700 dark:text-slate-100 shadow-sm focus:ring-2 focus:ring-sky-500 outline-none"
                    />
                </div>
            </div>

            {/* FORMULARIO PARA CREAR NUEVO SUBMENÚ */}
            <form
                onSubmit={handleAgregarSubmenu}
                className="bg-slate-50 dark:bg-slate-700/40 p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row gap-3 items-end"
            >
                <div className="flex-1 w-full">
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                        Nombre del Nuevo Submenú (Ej. Postres, Sopas, Jugos)
                    </label>
                    <input
                        type="text"
                        placeholder="Nombre de la categoría..."
                        value={nuevoSubmenuNombre}
                        onChange={e => setNuevoSubmenuNombre(e.target.value)}
                        className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 outline-none"
                    />
                </div>
                <button
                    type="submit"
                    className="bg-sky-500 hover:bg-sky-600 text-white font-bold px-5 py-2.5 rounded-lg text-sm transition whitespace-nowrap shadow-sm flex items-center gap-1.5"
                >
                    <span>+ Crear Submenú</span>
                </button>
            </form>

            {/* CUADRÍCULA DE 2 COLUMNAS PARA LOS SUBMENÚS */}
            {menuDiaConfig.submenusDinamicos && Object.keys(menuDiaConfig.submenusDinamicos).length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {Object.entries(menuDiaConfig.submenusDinamicos).map(([key, submenu]) => (
                        <div
                            key={key}
                            className="bg-slate-50/80 dark:bg-slate-700/30 p-5 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col justify-between space-y-4 shadow-sm"
                        >
                            <div className="space-y-4">
                                {/* CABECERA DE TARJETA: TÍTULO EDITABLE + ELIMINAR SUBMENÚ */}
                                <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-200/80 dark:border-slate-600/60">
                                    <div className="flex items-center gap-1.5 flex-1 min-w-0">
                                        <input
                                            type="text"
                                            value={submenu.titulo}
                                            onChange={e => handleRenombrarSubmenu(key, e.target.value)}
                                            title="Haz clic para cambiar el nombre de esta categoría"
                                            className="font-bold text-sm uppercase tracking-wide bg-transparent border-b border-transparent hover:border-sky-400 focus:border-sky-500 focus:bg-white dark:focus:bg-slate-800 px-1 py-0.5 rounded focus:outline-none text-sky-700 dark:text-sky-400 w-full truncate"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleEliminarSubmenu(key, submenu.titulo)}
                                        title="Eliminar Submenú"
                                        className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-900/30 p-1.5 rounded-lg transition text-xs font-semibold flex items-center gap-1 flex-shrink-0"
                                    >
                                        <i data-lucide="trash-2" style={{ width: 15, height: 15 }} className="inline-block"></i>
                                    </button>
                                </div>

                                {/* BARRA PARA AGREGAR NUEVO ELEMENTO + CHECKBOX DE PLATO INDEPENDIENTE */}
                                <div className="space-y-2 bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            placeholder={`Nuevo ítem en ${submenu.titulo}...`}
                                            value={nuevoElementoTextos[key] || ''}
                                            onChange={e => setNuevoElementoTextos({ ...nuevoElementoTextos, [key]: e.target.value })}
                                            onKeyDown={e => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    handleAgregarElemento(key);
                                                }
                                            }}
                                            className="flex-1 px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 outline-none"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => handleAgregarElemento(key)}
                                            className="bg-sky-500 hover:bg-sky-600 text-white font-semibold px-3 py-1.5 rounded-lg text-xs transition whitespace-nowrap shadow-sm"
                                        >
                                            + Agregar
                                        </button>
                                    </div>
                                    <label className="flex items-center gap-2 cursor-pointer select-none pt-1">
                                        <input
                                            type="checkbox"
                                            checked={nuevoElementoEsBase[key] || false}
                                            onChange={e => setNuevoElementoEsBase({ ...nuevoElementoEsBase, [key]: e.target.checked })}
                                            className="w-4 h-4 rounded text-sky-500 focus:ring-sky-500 cursor-pointer accent-sky-500"
                                        />
                                        <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                                            Es plato independiente / plato fuerte (No requiere carne, ej. Locrio)
                                        </span>
                                    </label>
                                </div>

                                {/* LISTA DE ELEMENTOS */}
                                <div className="space-y-2.5">
                                    {submenu.elementos && submenu.elementos.length > 0 ? (
                                        submenu.elementos.map(elem => {
                                            const isDisponible = elem.disponible !== false;
                                            const isPlatoBase = elem.esPlatoBase === true;
                                            return (
                                                <div
                                                    key={elem.id}
                                                    className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-white dark:bg-slate-800 px-3.5 py-2.5 rounded-lg border transition shadow-sm ${
                                                        isDisponible
                                                            ? 'border-slate-200 dark:border-slate-700'
                                                            : 'border-rose-200/80 dark:border-rose-900/50 bg-slate-50/70 dark:bg-slate-800/60'
                                                    }`}
                                                >
                                                    <div className="flex flex-col min-w-0 pr-2">
                                                        <span
                                                            className={`text-sm font-medium truncate ${
                                                                isDisponible
                                                                    ? 'text-slate-700 dark:text-slate-200'
                                                                    : 'text-slate-400 dark:text-slate-500 line-through'
                                                            }`}
                                                        >
                                                            {elem.nombre}
                                                        </span>
                                                        {isPlatoBase && (
                                                            <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                                                                ⭐ Plato independiente (No requiere carne)
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div className="flex items-center gap-3 flex-shrink-0 self-end sm:self-auto">
                                                        {/* Botón para marcar/desmarcar si es plato base */}
                                                        <button
                                                            type="button"
                                                            onClick={() => handleTogglePlatoBase(key, elem.id)}
                                                            title={isPlatoBase ? "Quitar condición de plato independiente" : "Marcar como plato independiente (sin carne)"}
                                                            className={`px-2 py-1 rounded text-[11px] font-bold transition border ${
                                                                isPlatoBase
                                                                    ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700'
                                                                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:bg-slate-200'
                                                            }`}
                                                        >
                                                            {isPlatoBase ? 'Independiente' : 'Requiere Carne'}
                                                        </button>

                                                        {/* Checkbox Disponible / Agotado */}
                                                        <label className="flex items-center gap-1.5 cursor-pointer select-none">
                                                            <input
                                                                type="checkbox"
                                                                checked={isDisponible}
                                                                onChange={() => handleToggleDisponible(key, elem.id)}
                                                                className="w-4 h-4 rounded text-sky-500 focus:ring-sky-500 cursor-pointer accent-sky-500"
                                                            />
                                                            <span
                                                                className={`text-xs font-semibold ${
                                                                    isDisponible
                                                                        ? 'text-emerald-600 dark:text-emerald-400'
                                                                        : 'text-rose-500 dark:text-rose-400'
                                                                }`}
                                                            >
                                                                {isDisponible ? 'Disponible' : 'Agotado'}
                                                            </span>
                                                        </label>

                                                        <button
                                                            type="button"
                                                            onClick={() => handleEliminarElemento(key, elem.id)}
                                                            title="Eliminar opción"
                                                            className="text-rose-400 hover:text-rose-600 p-1 rounded hover:bg-rose-50 dark:hover:bg-slate-700 transition"
                                                        >
                                                            <i data-lucide="trash-2" style={{ width: 15, height: 15 }} className="inline-block"></i>
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <p className="text-xs text-slate-400 text-center py-4 italic">
                                            Sin elementos agregados en esta categoría.
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-10 text-slate-400 text-sm bg-slate-50 dark:bg-slate-700/20 rounded-xl border border-dashed">
                    No hay submenús creados. Utiliza el formulario superior para agregar categorías como Arroces, Carnes, Ensaladas o Extras.
                </div>
            )}

            {/* PIE DE TARJETA: PRECIO BASE DEL PLATO DEL DÍA */}
            <div className="bg-slate-50 dark:bg-slate-700/40 p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h3 className="text-sm font-bold text-sky-700 dark:text-sky-400">
                        Precio Base del Plato del Día
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        Precio estándar aplicable al armar el plato en facturación.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-600 dark:text-slate-300">{moneda}</span>
                    <input
                        type="number"
                        value={menuDiaConfig.precioBase || 200}
                        onChange={e => guardarCambios({ ...menuDiaConfig, fechaMenu, precioBase: Number(e.target.value) })}
                        className="w-28 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg font-bold text-slate-800 dark:text-white text-center text-sm shadow-sm focus:ring-2 focus:ring-sky-500 outline-none"
                    />
                </div>
            </div>
        </div>
    );
};
