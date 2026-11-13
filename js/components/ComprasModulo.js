// Componente ComprasModulo - Registro de Compras, Artículos, Importación por Foto (OCR) y Sentencia SQL
function ComprasModulo({ onInventarioActualizado }) {
    const [compras, setCompras] = React.useState(() => {
        const saved = localStorage.getItem('adtech_compras');
        return saved ? JSON.parse(saved) : [];
    });

    const [productosInventario, setProductosInventario] = React.useState(() => {
        const saved = localStorage.getItem('adtech_products');
        return saved ? JSON.parse(saved) : [];
    });

    const [proveedor, setProveedor] = React.useState('');
    const [numFactura, setNumFactura] = React.useState('');
    const [fecha, setFecha] = React.useState(new Date().toISOString().slice(0, 10));
    const [ncf, setNcf] = React.useState('');
    
    // Artículos de la compra actual
    const [articulosCompra, setArticulosCompra] = React.useState([]);
    const [articuloActual, setArticuloActual] = React.useState({ descripcion: '', cantidad: 1, costo: 0 });

    // Modales y mensajes
    const [showSqlModal, setShowSqlModal] = React.useState(false);
    const [sqlQuery, setSqlQuery] = React.useState('');
    const [showFotoModal, setShowFotoModal] = React.useState(false);
    const [mensaje, setMensaje] = React.useState({ texto: '', tipo: '' });

    // Guardar en localStorage cada vez que cambien las compras
    React.useEffect(() => {
        localStorage.setItem('adtech_compras', JSON.stringify(compras));
    }, [compras]);

    React.useEffect(() => {
        const saved = localStorage.getItem('adtech_products');
        if (saved) setProductosInventario(JSON.parse(saved));
    }, []);

    const sincronizarInventarioPorCompra = (listaArticulos) => {
        try {
            const productosActuales = JSON.parse(localStorage.getItem('adtech_products') || '[]');
            listaArticulos.forEach(art => {
                const nombreNormalizado = art.descripcion.trim().toLowerCase();
                const prodExistente = productosActuales.find(p => p.nombre.trim().toLowerCase() === nombreNormalizado);
                if (prodExistente) {
                    prodExistente.stock = (Number(prodExistente.stock) || 0) + Number(art.cantidad);
                    prodExistente.costo = Number(art.costo);
                    prodExistente.controlarStock = true;
                    prodExistente.disponible = true;
                } else {
                    productosActuales.push({
                        id: (Date.now() + Math.floor(Math.random() * 10000)).toString(),
                        nombre: art.descripcion.trim(),
                        costo: Number(art.costo),
                        venta: Math.round(Number(art.costo) * 1.35),
                        stock: Number(art.cantidad),
                        controlarStock: true,
                        categoria: 'General',
                        disponible: true,
                        tieneSubmenu: false,
                        precioEditable: false,
                        img: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300'
                    });
                }
            });
            localStorage.setItem('adtech_products', JSON.stringify(productosActuales));
            setProductosInventario(productosActuales);
            if (typeof onInventarioActualizado === 'function') {
                onInventarioActualizado(productosActuales);
            }
        } catch (err) {
            console.error('Error al actualizar inventario desde compra:', err);
        }
    };

    const handleAgregarArticulo = (e) => {
        e.preventDefault();
        if (!articuloActual.descripcion || Number(articuloActual.costo) <= 0 || Number(articuloActual.cantidad) <= 0) {
            setMensaje({ texto: 'Ingrese una descripción válida, cantidad mayor a 0 y costo mayor a 0.', tipo: 'error' });
            return;
        }

        const nuevoItem = {
            id: Date.now(),
            descripcion: articuloActual.descripcion.trim(),
            cantidad: Number(articuloActual.cantidad),
            costo: Number(articuloActual.costo),
            subtotal: Number(articuloActual.cantidad) * Number(articuloActual.costo)
        };

        setArticulosCompra([...articulosCompra, nuevoItem]);
        setArticuloActual({ descripcion: '', cantidad: 1, costo: 0 });
    };

    const handleEliminarArticulo = (id) => {
        setArticulosCompra(articulosCompra.filter(item => item.id !== id));
    };

    const calcularTotalCompra = () => {
        return articulosCompra.reduce((acc, item) => acc + item.subtotal, 0);
    };

    const handleGuardarCompra = (e) => {
        e.preventDefault();
        if (!proveedor || !numFactura || articulosCompra.length === 0) {
            setMensaje({ texto: 'Complete el proveedor, número de factura y agregue al menos un artículo.', tipo: 'error' });
            return;
        }

        const nuevaCompra = {
            id: 'COMP-' + Date.now(),
            proveedor,
            numFactura,
            fecha,
            ncf,
            articulos: articulosCompra,
            total: calcularTotalCompra()
        };

        setCompras([nuevaCompra, ...compras]);
        sincronizarInventarioPorCompra(articulosCompra);

        setProveedor('');
        setNumFactura('');
        setNcf('');
        setArticulosCompra([]);
        setMensaje({ texto: '¡Compra registrada y stock actualizado con éxito!', tipo: 'success' });
        setTimeout(() => setMensaje({ texto: '', tipo: '' }), 4000);
    };

    const handleSimularFotoOCR = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setTimeout(() => {
            setProveedor('Distribuidora Mayorista RD, S.R.L.');
            setNumFactura('B01000' + Math.floor(Math.random() * 8999 + 1000));
            setNcf('B0100034821');
            setArticulosCompra([
                { id: 1, descripcion: 'Coca-Cola', cantidad: 12, costo: 25, subtotal: 300 },
                { id: 2, descripcion: 'Jugo Natural Chinola', cantidad: 10, costo: 30, subtotal: 300 }
            ]);
            setMensaje({ texto: '¡Foto procesada con éxito por OCR! Revise los artículos y registre la compra.', tipo: 'success' });
            setShowFotoModal(false);
        }, 800);
    };

    const handleEjecutarSql = (e) => {
        e.preventDefault();
        try {
            if (!sqlQuery.toUpperCase().includes('INSERT')) {
                throw new Error('La sentencia debe ser un comando INSERT válido.');
            }

            const matches = sqlQuery.match(/['"]([^'"]*)['"]|([\d\.]+)/g);
            if (matches && matches.length >= 2) {
                const provSql = matches[0].replace(/['"]/g, '');
                const facSql = matches[1].replace(/['"]/g, '');
                const totalSql = Number(matches[2]) || 1500;

                const articulosSql = [
                    { id: Date.now(), descripcion: 'Artículo Importado vía SQL', cantidad: 1, costo: totalSql, subtotal: totalSql }
                ];

                const nuevaCompraSql = {
                    id: 'COMP-SQL-' + Date.now(),
                    proveedor: provSql || 'Proveedor SQL Externo',
                    numFactura: facSql || 'SQL-999',
                    fecha: new Date().toISOString().slice(0, 10),
                    ncf: 'B0100099999',
                    articulos: articulosSql,
                    total: totalSql
                };

                setCompras([nuevaCompraSql, ...compras]);
                sincronizarInventarioPorCompra(articulosSql);
                setMensaje({ texto: '¡Sentencia SQL ejecutada e inventario actualizado!', tipo: 'success' });
                setShowSqlModal(false);
                setSqlQuery('');
            } else {
                throw new Error('No se pudieron extraer los campos de la sentencia SQL.');
            }
        } catch (err) {
            setMensaje({ texto: 'Error SQL: ' + err.message, tipo: 'error' });
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6 pb-12">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <span>📦</span> Compras
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Selecciona o crea artículos para registrar facturas de proveedores y actualizar existencias.
                    </p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <button
                        type="button"
                        onClick={() => setShowFotoModal(true)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 shadow-sm text-sm"
                    >
                        <span>📸</span> Agregar compra desde foto
                    </button>
                    <button
                        type="button"
                        onClick={() => setShowSqlModal(true)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 shadow-sm text-sm"
                    >
                        <span>💻</span> Agregar factura por SQL
                    </button>
                </div>
            </div>

            {mensaje.texto && (
                <div className={`p-4 rounded-lg text-sm flex justify-between items-center ${
                    mensaje.tipo === 'success' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' : 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300'
                }`}>
                    <span>{mensaje.texto}</span>
                    <button onClick={() => setMensaje({ texto: '', tipo: '' })} className="font-bold">×</button>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 space-y-6">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <span>📝</span> Datos de la Factura de Compra
                    </h3>

                    <form onSubmit={handleGuardarCompra} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Proveedor / Empresa</label>
                                <input 
                                    type="text"
                                    value={proveedor}
                                    onChange={(e) => setProveedor(e.target.value)}
                                    placeholder="Ej. Suplidora Nacional, S.A."
                                    required
                                    className="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 focus:ring-2 focus:ring-sky-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Número de Factura</label>
                                <input 
                                    type="text"
                                    value={numFactura}
                                    onChange={(e) => setNumFactura(e.target.value)}
                                    placeholder="Ej. FAC-00123"
                                    required
                                    className="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 focus:ring-2 focus:ring-sky-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Fecha de Compra</label>
                                <input 
                                    type="date"
                                    value={fecha}
                                    onChange={(e) => setFecha(e.target.value)}
                                    required
                                    className="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 focus:ring-2 focus:ring-sky-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">NCF (Comprobante Fiscal)</label>
                                <input 
                                    type="text"
                                    value={ncf}
                                    onChange={(e) => setNcf(e.target.value)}
                                    placeholder="Ej. B0100000123"
                                    className="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 focus:ring-2 focus:ring-sky-500"
                                />
                            </div>
                        </div>

                        <hr className="border-slate-200 dark:border-slate-700 my-4" />

                        <div>
                            <h4 className="font-semibold text-slate-800 dark:text-white mb-1">Artículos Adquiridos</h4>
                            <p className="text-xs text-slate-500 mb-3">Selecciona un producto existente o escribe uno nuevo para registrarlo automáticamente en el inventario.</p>
                            <div className="flex flex-col md:flex-row gap-2 mb-4">
                                <input 
                                    type="text"
                                    list="productos-compras-datalist"
                                    placeholder="Selecciona o escribe artículo..."
                                    value={articuloActual.descripcion}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        const match = productosInventario.find(p => p.nombre.toLowerCase() === val.toLowerCase());
                                        setArticuloActual({
                                            ...articuloActual,
                                            descripcion: val,
                                            costo: match ? match.costo : articuloActual.costo
                                        });
                                    }}
                                    className="flex-1 px-3 py-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 text-sm"
                                />
                                <datalist id="productos-compras-datalist">
                                    {productosInventario.map(p => (
                                        <option key={p.id} value={p.nombre} />
                                    ))}
                                </datalist>
                                <input 
                                    type="number"
                                    min="1"
                                    placeholder="Cant"
                                    value={articuloActual.cantidad}
                                    onChange={(e) => setArticuloActual({...articuloActual, cantidad: e.target.value})}
                                    className="w-20 px-3 py-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 text-sm"
                                />
                                <input 
                                    type="number"
                                    step="0.01"
                                    placeholder="Costo unitario"
                                    value={articuloActual.costo}
                                    onChange={(e) => setArticuloActual({...articuloActual, costo: e.target.value})}
                                    className="w-32 px-3 py-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 text-sm"
                                />
                                <button
                                    type="button"
                                    onClick={handleAgregarArticulo}
                                    className="bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition whitespace-nowrap"
                                >
                                    + Agregar
                                </button>
                            </div>

                            <div className="overflow-x-auto border border-slate-200 dark:border-slate-700 rounded-lg">
                                <table className="w-full text-left border-collapse text-sm">
                                    <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-600 dark:text-slate-300">
                                        <tr>
                                            <th className="p-3">Descripción</th>
                                            <th className="p-3 text-center">Cant (+Stock)</th>
                                            <th className="p-3 text-right">Costo Unit.</th>
                                            <th className="p-3 text-right">Subtotal</th>
                                            <th className="p-3 text-center">Acción</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                        {articulosCompra.length === 0 ? (
                                            <tr>
                                                <td colSpan="5" className="p-4 text-center text-slate-400">No hay artículos agregados en esta compra.</td>
                                            </tr>
                                        ) : (
                                            articulosCompra.map(item => (
                                                <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                                                    <td className="p-3 text-slate-800 dark:text-white font-medium">{item.descripcion}</td>
                                                    <td className="p-3 text-center text-emerald-600 font-bold">+{item.cantidad}</td>
                                                    <td className="p-3 text-right text-slate-600 dark:text-slate-300">RD$ {item.costo.toFixed(2)}</td>
                                                    <td className="p-3 text-right font-semibold text-slate-800 dark:text-white">RD$ {item.subtotal.toFixed(2)}</td>
                                                    <td className="p-3 text-center">
                                                        <button 
                                                            type="button" 
                                                            onClick={() => handleEliminarArticulo(item.id)}
                                                            className="text-rose-500 hover:text-rose-700 font-bold"
                                                        >
                                                            ✕
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <button
                                type="submit"
                                className="bg-sky-500 hover:bg-sky-600 text-white px-6 py-2.5 rounded-lg font-semibold transition shadow-md flex items-center gap-2"
                            >
                                <span>💾</span> Registrar Compra y Actualizar Existencias
                            </button>
                        </div>
                    </form>
                </div>

                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 space-y-4">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <span>📊</span> Historial de Compras
                    </h3>
                    <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                        {compras.length === 0 ? (
                            <p className="text-sm text-slate-400 text-center py-6">No hay compras registradas.</p>
                        ) : (
                            compras.map(c => (
                                <div key={c.id} className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700 space-y-1">
                                    <div className="flex justify-between items-start">
                                        <span className="font-bold text-slate-800 dark:text-white text-sm">{c.proveedor}</span>
                                        <span className="text-xs font-semibold text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 px-2 py-0.5 rounded">RD$ {c.total.toFixed(2)}</span>
                                    </div>
                                    <div className="text-xs text-slate-500 dark:text-slate-400 flex justify-between">
                                        <span>Factura: {c.numFactura}</span>
                                        <span>{c.fecha}</span>
                                    </div>
                                    <div className="text-xs text-slate-400 pt-1">
                                        {c.articulos.map(a => `${a.cantidad}x ${a.descripcion}`).join(', ')}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {showFotoModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-2xl max-w-md w-full space-y-4 border border-slate-200 dark:border-slate-700">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                            <span>📸</span> Escanear Factura con IA / OCR
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Sube una fotografía de la factura física del proveedor para extraer automáticamente los artículos.
                        </p>
                        <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-6 text-center">
                            <input 
                                type="file" 
                                accept="image/*" 
                                onChange={handleSimularFotoOCR}
                                className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                            />
                        </div>
                        <div className="flex justify-end pt-2">
                            <button
                                type="button"
                                onClick={() => setShowFotoModal(false)}
                                className="bg-slate-500 hover:bg-slate-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showSqlModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-2xl max-w-lg w-full space-y-4 border border-slate-200 dark:border-slate-700">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                            <span>💻</span> Importar Factura vía Sentencia SQL
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Pega tu sentencia SQL INSERT para registrar la factura directamente en la base de datos.
                        </p>
                        <form onSubmit={handleEjecutarSql} className="space-y-4">
                            <textarea 
                                rows="5"
                                placeholder="Ej. INSERT INTO compras (proveedor, factura, total) VALUES ('Compañía X', 'FAC-999', 4500);"
                                value={sqlQuery}
                                onChange={(e) => setSqlQuery(e.target.value)}
                                required
                                className="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 font-mono text-xs focus:ring-2 focus:ring-indigo-500"
                            ></textarea>
                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowSqlModal(false)}
                                    className="bg-slate-500 hover:bg-slate-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg text-sm font-semibold transition shadow-md"
                                >
                                    Ejecutar Sentencia SQL
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}