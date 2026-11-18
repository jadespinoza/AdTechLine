const InventarioModulo = ({ products, setProducts, negocioConfig, menuDiaConfig }) => {
    const [showProductModal, setShowProductModal] = React.useState(false);
    const [editingProductId, setEditingProductId] = React.useState(null);
    const [productForm, setProductForm] = React.useState({
        nombre: '',
        costo: 0,
        venta: 0,
        stock: 10,
        controlarStock: true,
        categoria: 'Platos',
        img: '',
        tieneSubmenu: false,
        precioEditable: false,
        submenus: ['arroces', 'carnes', 'ensaladas'],
        opcionesPermitidas: []
    });

    const openNewProductModal = () => {
        setEditingProductId(null);
        setProductForm({
            nombre: '',
            costo: 0,
            venta: 0,
            stock: 10,
            controlarStock: true,
            categoria: 'Platos',
            img: '',
            tieneSubmenu: false,
            precioEditable: false,
            submenus: menuDiaConfig.submenusDinamicos ? Object.keys(menuDiaConfig.submenusDinamicos) : ['arroces', 'carnes', 'ensaladas'],
            opcionesPermitidas: []
        });
        setShowProductModal(true);
    };

    const openEditProductModal = (prod) => {
        setEditingProductId(prod.id);
        setProductForm({
            nombre: prod.nombre,
            costo: prod.costo || 0,
            venta: prod.venta || 0,
            stock: prod.stock !== undefined ? prod.stock : 10,
            controlarStock: prod.controlarStock !== false,
            categoria: prod.categoria || 'Platos',
            img: prod.img || '',
            tieneSubmenu: prod.tieneSubmenu || prod.esPlatoDia || false,
            precioEditable: prod.precioEditable || prod.esPlatoDia || false,
            submenus: prod.submenus || (menuDiaConfig.submenusDinamicos ? Object.keys(menuDiaConfig.submenusDinamicos) : ['arroces', 'carnes', 'ensaladas']),
            opcionesPermitidas: prod.opcionesPermitidas || []
        });
        setShowProductModal(true);
    };

    const handleImageFileChange = (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => {
            setProductForm(prev => ({ ...prev, img: reader.result }));
        };
        reader.readAsDataURL(file);
    };

    const handleSaveProduct = () => {
        if (!productForm.nombre.trim()) return alert('Ingrese el nombre del producto.');
        if (editingProductId) {
            setProducts(products.map(p => p.id === editingProductId ? { ...p, ...productForm } : p));
        } else {
            const newProd = {
                id: Date.now().toString(),
                ...productForm,
                disponible: true
            };
            setProducts([...products, newProd]);
        }
        setShowProductModal(false);
    };

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-md border border-slate-200 dark:border-slate-700 space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Inventario & Productos</h2>
                <button
                    onClick={openNewProductModal}
                    className="bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded-lg font-semibold text-sm flex items-center space-x-2 shadow"
                >
                    <i data-lucide="plus" style={{ width: 16, height: 16 }} className="inline-block"></i>
                    <span>Nuevo Producto</span>
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                        <tr>
                            <th className="p-3">Producto</th>
                            <th className="p-3">Categoría</th>
                            <th className="p-3 text-center">Existencia (Stock)</th>
                            <th className="p-3">Precio Costo</th>
                            <th className="p-3">Precio Venta (c/ITBIS)</th>
                            <th className="p-3">Disponible Hoy</th>
                            <th className="p-3 text-center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                        {products.map(p => (
                            <tr key={p.id}>
                                <td className="p-3 font-medium flex items-center space-x-3">
                                    <img
                                        src={p.img || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300'}
                                        className="w-10 h-10 object-cover rounded-lg border bg-slate-100"
                                    />
                                    <div>
                                        <div>{p.nombre}</div>
                                        <div className="flex gap-1 mt-0.5">
                                            {p.precioEditable && (
                                                <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-semibold">Precio Editable</span>
                                            )}
                                            {p.tieneSubmenu && (
                                                <span className="text-[10px] bg-sky-100 text-sky-800 px-1.5 py-0.2 rounded font-semibold">Submenú</span>
                                            )}
                                        </div>
                                    </div>
                                </td>
                                <td className="p-3">{p.categoria || 'General'}</td>
                                <td className="p-3 text-center">
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                                        (p.stock || 0) > 5 ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' :
                                        (p.stock || 0) > 0 ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300' :
                                        'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300'
                                    }`}>
                                        {p.stock !== undefined ? p.stock : 0} un.
                                    </span>
                                </td>
                                <td className="p-3">{negocioConfig.moneda || 'RD$'} {(p.costo || 0).toFixed(2)}</td>
                                <td className="p-3 font-semibold text-sky-600 dark:text-sky-400">{negocioConfig.moneda || 'RD$'} {(p.venta || 0).toFixed(2)}</td>
                                <td className="p-3">
                                    <input
                                        type="checkbox"
                                        checked={p.disponible !== false}
                                        onChange={e => {
                                            setProducts(products.map(x => x.id === p.id ? { ...x, disponible: e.target.checked } : x));
                                        }}
                                        className="w-4 h-4 text-sky-600 rounded cursor-pointer"
                                    />
                                </td>
                                <td className="p-3 text-center space-x-2">
                                    <button
                                        onClick={() => openEditProductModal(p)}
                                        className="text-sky-500 hover:text-sky-700 bg-sky-50 dark:bg-slate-700 p-1.5 rounded-lg transition"
                                        title="Editar Artículo"
                                    >
                                        <i data-lucide="edit" style={{ width: 16, height: 16 }} className="inline-block"></i>
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (confirm(`¿Eliminar el producto "${p.nombre}"?`)) {
                                                setProducts(products.filter(x => x.id !== p.id));
                                            }
                                        }}
                                        className="text-red-500 hover:text-red-700 bg-red-50 dark:bg-slate-700 p-1.5 rounded-lg transition"
                                        title="Eliminar Artículo"
                                    >
                                        <i data-lucide="trash-2" style={{ width: 16, height: 16 }} className="inline-block"></i>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* MODAL NUEVO / EDITAR PRODUCTO CON SUBMENÚS Y PRECIO EDITABLE */}
            {showProductModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl max-w-lg w-full space-y-4 shadow-2xl border border-slate-200 dark:border-slate-700 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center border-b pb-3">
                            <h3 className="text-lg font-bold">
                                {editingProductId ? 'Editar Artículo / Producto' : 'Nuevo Producto / Artículo'}
                            </h3>
                            <button onClick={() => setShowProductModal(false)} className="text-slate-400 hover:text-slate-600">
                                <i data-lucide="x" style={{ width: 20, height: 20 }} className="inline-block"></i>
                            </button>
                        </div>

                        <div className="space-y-3">
                            <div>
                                <label className="block text-xs font-semibold mb-1">Nombre del Producto</label>
                                <input
                                    type="text"
                                    placeholder="Ej. Plato del Día, Porción..."
                                    value={productForm.nombre}
                                    onChange={e => setProductForm({ ...productForm, nombre: e.target.value })}
                                    className="w-full p-2.5 border rounded-lg dark:bg-slate-700 text-sm focus:ring-2 focus:ring-sky-500 outline-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-xs font-semibold mb-1">Precio Costo ({negocioConfig.moneda || 'RD$'})</label>
                                    <input
                                        type="number"
                                        value={productForm.costo}
                                        onChange={e => setProductForm({ ...productForm, costo: Number(e.target.value) })}
                                        className="w-full p-2.5 border rounded-lg dark:bg-slate-700 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold mb-1">Precio Venta ({negocioConfig.moneda || 'RD$'} con ITBIS)</label>
                                    <input
                                        type="number"
                                        value={productForm.venta}
                                        onChange={e => setProductForm({ ...productForm, venta: Number(e.target.value) })}
                                        className="w-full p-2.5 border rounded-lg dark:bg-slate-700 text-sm font-bold text-sky-600"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold mb-1">Categoría</label>
                                <select
                                    value={productForm.categoria}
                                    onChange={e => setProductForm({ ...productForm, categoria: e.target.value })}
                                    className="w-full p-2.5 border rounded-lg dark:bg-slate-700 text-sm"
                                >
                                    <option value="Platos">Platos</option>
                                    <option value="Bebidas">Bebidas</option>
                                    <option value="Refrescos">Refrescos</option>
                                    <option value="Postres">Postres</option>
                                    <option value="Snacks">Snacks</option>
                                </select>
                            </div>

                            {/* OPCIONES DE PRECIO EDITABLE Y SUBMENÚ */}
                            <div className="p-3.5 rounded-xl border border-sky-200 dark:border-sky-800 bg-sky-50/60 dark:bg-sky-900/20 space-y-3">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                    <label className="flex items-center space-x-2 cursor-pointer text-xs font-bold text-slate-700 dark:text-slate-200">
                                        <input
                                            type="checkbox"
                                            checked={productForm.precioEditable}
                                            onChange={e => setProductForm({ ...productForm, precioEditable: e.target.checked })}
                                            className="w-4 h-4 text-sky-600 rounded"
                                        />
                                        <span>💲 Precio Editable en Facturación</span>
                                    </label>

                                    <label className="flex items-center space-x-2 cursor-pointer text-xs font-bold text-sky-700 dark:text-sky-300">
                                        <input
                                            type="checkbox"
                                            checked={productForm.tieneSubmenu}
                                            onChange={e => setProductForm({ ...productForm, tieneSubmenu: e.target.checked })}
                                            className="w-4 h-4 text-sky-600 rounded"
                                        />
                                        <span>🍽️ Artículo con Submenú</span>
                                    </label>
                                </div>

                                {productForm.tieneSubmenu && (
                                    <div className="space-y-3 pt-2 border-t border-sky-200 dark:border-sky-800">
                                        <div>
                                            <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1.5">
                                                1. Categorías de Submenú Activas:
                                            </label>
                                            <div className="grid grid-cols-2 gap-2">
                                                {Object.entries(menuDiaConfig.submenusDinamicos || {}).map(([key, sub]) => {
                                                    const isChecked = (productForm.submenus || []).includes(key);
                                                    return (
                                                        <label key={key} className="flex items-center space-x-2 bg-white dark:bg-slate-800 p-2 rounded-lg border text-xs cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                checked={isChecked}
                                                                onChange={e => {
                                                                    const currentSubs = productForm.submenus || [];
                                                                    const updated = e.target.checked
                                                                        ? [...currentSubs, key]
                                                                        : currentSubs.filter(x => x !== key);
                                                                    setProductForm({ ...productForm, submenus: updated });
                                                                }}
                                                                className="rounded text-sky-600"
                                                            />
                                                            <span className="font-medium">{sub.titulo}</span>
                                                        </label>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        <div>
                                            <div className="flex justify-between items-center mb-1">
                                                <label className="block text-[11px] font-bold uppercase text-slate-500">
                                                    2. Filtrar Artículos del Submenú (Opcional):
                                                </label>
                                                {(productForm.opcionesPermitidas || []).length > 0 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setProductForm({ ...productForm, opcionesPermitidas: [] })}
                                                        className="text-[10px] text-sky-600 hover:underline font-bold"
                                                    >
                                                        Seleccionar Todos
                                                    </button>
                                                )}
                                            </div>
                                            <p className="text-[10px] text-slate-500 mb-2">
                                                Si no marcas ninguno, aparecerán todos los disponibles del día. Si marcas específicos (ej. para <strong>Porción</strong>: Arroz blanco, Moro, Pollo frito), solo saldrán esos.
                                            </p>
                                            <div className="max-h-36 overflow-y-auto bg-white dark:bg-slate-800 p-2 rounded-lg border grid grid-cols-2 gap-1.5">
                                                {Object.entries(menuDiaConfig.submenusDinamicos || {})
                                                    .filter(([key]) => (productForm.submenus || []).includes(key))
                                                    .flatMap(([, sub]) => sub.elementos || [])
                                                    .map(item => {
                                                        const selected = (productForm.opcionesPermitidas || []).includes(item.nombre);
                                                        return (
                                                            <label key={item.id} className="flex items-center space-x-1.5 text-xs p-1 hover:bg-slate-50 dark:hover:bg-slate-700 rounded cursor-pointer">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={selected}
                                                                    onChange={e => {
                                                                        const currentOps = productForm.opcionesPermitidas || [];
                                                                        const updated = e.target.checked
                                                                            ? [...currentOps, item.nombre]
                                                                            : currentOps.filter(x => x !== item.nombre);
                                                                        setProductForm({ ...productForm, opcionesPermitidas: updated });
                                                                    }}
                                                                    className="rounded text-sky-600"
                                                                />
                                                                <span className="truncate">{item.nombre}</span>
                                                            </label>
                                                        );
                                                    })}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* IMAGEN */}
                            <div className="space-y-2 border p-3 rounded-xl bg-slate-50 dark:bg-slate-700/30">
                                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase">Imagen del Artículo</label>
                                <div className="flex items-center space-x-3">
                                    <div className="w-14 h-14 bg-slate-200 dark:bg-slate-700 rounded-lg overflow-hidden border flex-shrink-0">
                                        {productForm.img ? (
                                            <img src={productForm.img} alt="Vista previa" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-400 text-[10px]">Sin img</div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageFileChange}
                                            className="w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-sky-50 file:text-sky-700 cursor-pointer"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex space-x-2 pt-2">
                            <button
                                onClick={handleSaveProduct}
                                className="flex-1 bg-sky-500 hover:bg-sky-600 text-white font-bold py-3 rounded-xl transition shadow"
                            >
                                {editingProductId ? 'Actualizar Artículo' : 'Guardar Producto'}
                            </button>
                            <button
                                onClick={() => setShowProductModal(false)}
                                className="flex-1 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 font-bold py-3 rounded-xl transition"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
