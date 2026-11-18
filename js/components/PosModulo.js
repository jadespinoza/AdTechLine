const PosModulo = ({
    products,
    clients,
    negocioConfig,
    menuDiaConfig,
    cart,
    setCart,
    selectedClient,
    setSelectedClient,
    paymentMethod,
    setPaymentMethod,
    ncfType,
    setNcfType,
    discount,
    setDiscount,
    itbisRate,
    addToCart,
    handleClearInvoice,
    handleFacturar,
    setShowClientModal
}) => {
    const grossTotal = cart.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);
    const discountAmount = (grossTotal * discount) / 100;
    const total = grossTotal - discountAmount;
    const subtotal = total / (1 + (itbisRate / 100));
    const itbis = total - subtotal;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 flex flex-col space-y-4">
                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 flex justify-between items-center">
                    <h2 className="font-bold text-lg text-slate-700 dark:text-slate-200 flex items-center gap-2">
                        <i data-lucide="grid" style={{ width: 20, height: 20 }} className="inline-block"></i> Productos Disponibles
                    </h2>
                    <span className="text-xs bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-200 font-semibold px-2.5 py-1 rounded-full">
                        {products.filter(p => p.disponible).length} Items
                    </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {products.filter(p => p.disponible).map(product => (
                        <button
                            key={product.id}
                            onClick={() => addToCart(product)}
                            className="group relative bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition transform active:scale-95 border border-slate-200 dark:border-slate-700 flex flex-col text-left"
                        >
                            <div className="h-28 w-full overflow-hidden bg-slate-100 relative">
                                <img
                                    src={product.img || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300'}
                                    alt={product.nombre}
                                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                                />
                                {product.tieneSubmenu && (
                                    <span className="absolute top-2 right-2 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow">
                                        Configurar
                                    </span>
                                )}
                                {product.controlarStock && (
                                    <span className={`absolute bottom-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold shadow ${
                                        (product.stock || 0) > 5 ? 'bg-emerald-500 text-white' :
                                        (product.stock || 0) > 0 ? 'bg-amber-500 text-white' : 'bg-rose-500 text-white'
                                    }`}>
                                        Stock: {product.stock || 0}
                                    </span>
                                )}
                            </div>
                            <div className="p-3 flex flex-col justify-between flex-1 w-full">
                                <span className="font-semibold text-slate-800 dark:text-slate-100 text-sm line-clamp-1">{product.nombre}</span>
                                <div className="flex justify-between items-center mt-2">
                                    <span className="text-xs font-semibold text-sky-600 dark:text-sky-400">
                                        {negocioConfig.moneda || 'RD$'} {product.esPlatoDia ? menuDiaConfig.precioBase.toFixed(2) : product.venta.toFixed(2)}
                                    </span>
                                    <span className="bg-sky-50 dark:bg-slate-700 text-sky-600 dark:text-sky-300 p-1.5 rounded-lg group-hover:bg-sky-500 group-hover:text-white transition">
                                        <i data-lucide="plus" style={{ width: 14, height: 14 }} className="inline-block"></i>
                                    </span>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            <div className="lg:col-span-5 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-5 flex flex-col justify-between">
                <div className="space-y-4">
                    <div className="border-b border-slate-200 dark:border-slate-700 pb-4 space-y-3">
                        <div className="flex justify-between items-center">
                            <h2 className="font-bold text-lg text-slate-800 dark:text-slate-100 flex items-center gap-2">
                                <span>Detalle de Factura</span>
                            </h2>
                            {cart.length > 0 && (
                                <button
                                    onClick={handleClearInvoice}
                                    className="bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 text-xs font-bold px-2.5 py-1.5 rounded-lg border border-red-200 dark:border-red-800 transition flex items-center gap-1 shadow-sm"
                                >
                                    <i data-lucide="trash-2" style={{ width: 14, height: 14 }} className="inline-block"></i>
                                    <span>Borrar Factura</span>
                                </button>
                            )}
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400">Cliente</label>
                                <button onClick={() => setShowClientModal(true)} className="text-[11px] text-sky-600 hover:underline font-bold">
                                    + Verificar / Nuevo Cliente
                                </button>
                            </div>
                            <select
                                value={selectedClient}
                                onChange={e => setSelectedClient(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg p-2 text-sm focus:ring-2 focus:ring-sky-500 outline-none"
                            >
                                {clients.map(c => (
                                    <option key={c.id} value={c.id}>{c.nombre} {c.rnc ? `(${c.rnc})` : ''}</option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Forma de Pago</label>
                                <select
                                    value={paymentMethod}
                                    onChange={e => setPaymentMethod(e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg p-2 text-sm focus:ring-2 focus:ring-sky-500 outline-none"
                                >
                                    <option value="Efectivo">Efectivo</option>
                                    <option value="Tarjeta">Tarjeta</option>
                                    <option value="Transferencia">Transferencia</option>
                                    <option value="Credito">A Crédito (CxC)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">NCF / Comprobante</label>
                                <select
                                    value={ncfType}
                                    onChange={e => setNcfType(e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg p-2 text-sm focus:ring-2 focus:ring-sky-500 outline-none"
                                >
                                    <option value="B02">B02 Consumidor Final</option>
                                    <option value="B01">B01 Crédito Fiscal</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                        {cart.length === 0 ? (
                            <div className="text-center py-8 text-slate-400 text-sm">
                                No hay items agregados a la factura
                            </div>
                        ) : (
                            cart.map((item, idx) => (
                                <div key={idx} className="flex justify-between items-center p-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg text-sm">
                                    <div className="flex-1 pr-2">
                                        <div className="font-medium text-slate-800 dark:text-slate-200">{item.nombre}</div>
                                        <div className="text-xs text-slate-400">{negocioConfig.moneda || 'RD$'} {item.precio.toFixed(2)} c/u</div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() => {
                                                if (item.cantidad > 1) {
                                                    setCart(cart.map(c => c.id === item.id ? { ...c, cantidad: c.cantidad - 1 } : c));
                                                } else {
                                                    setCart(cart.filter(c => c.id !== item.id));
                                                }
                                            }}
                                            className="w-6 h-6 rounded bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold flex items-center justify-center"
                                        >-</button>
                                        <span className="font-semibold px-1">{item.cantidad}</span>
                                        <button
                                            onClick={() => {
                                                if (item.productId) {
                                                    const prod = products.find(p => p.id === item.productId);
                                                    if (prod && prod.controlarStock && item.cantidad >= prod.stock) {
                                                        return alert(`Stock máximo alcanzado (${prod.stock}).`);
                                                    }
                                                }
                                                setCart(cart.map(c => c.id === item.id ? { ...c, cantidad: c.cantidad + 1 } : c));
                                            }}
                                            className="w-6 h-6 rounded bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold flex items-center justify-center"
                                        >+</button>
                                    </div>
                                    <div className="w-16 text-right font-semibold text-slate-700 dark:text-slate-200">
                                        {negocioConfig.moneda || 'RD$'} {(item.precio * item.cantidad).toFixed(2)}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="border-t border-slate-200 dark:border-slate-700 pt-4 mt-4 space-y-2">
                    <div className="flex justify-between text-xs text-slate-500">
                        <span>Subtotal</span>
                        <span>{negocioConfig.moneda || 'RD$'} {subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-slate-500">
                        <span>ITBIS ({itbisRate}%)</span>
                        <span>{negocioConfig.moneda || 'RD$'} {itbis.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs text-slate-500">
                        <span>Descuento (%)</span>
                        <input
                            type="number"
                            min="0"
                            max="100"
                            value={discount}
                            onChange={e => setDiscount(Number(e.target.value))}
                            className="w-14 text-right bg-slate-100 dark:bg-slate-700 border rounded px-1 py-0.5 text-xs"
                        />
                    </div>
                    <div className="flex justify-between text-lg font-black text-slate-800 dark:text-slate-100 pt-2 border-t">
                        <span>TOTAL</span>
                        <span className="text-sky-600 dark:text-sky-400">{negocioConfig.moneda || 'RD$'} {total.toFixed(2)}</span>
                    </div>

                    <button
                        onClick={handleFacturar}
                        className="w-full mt-3 bg-sky-500 hover:bg-sky-600 text-white font-bold py-3 rounded-xl shadow-lg transition duration-200 flex items-center justify-center space-x-2"
                    >
                        <i data-lucide="printer" style={{ width: 18, height: 18 }} className="inline-block"></i>
                        <span>Generar Factura & Descontar Stock</span>
                    </button>
                </div>
            </div>
        </div>
    );
};
