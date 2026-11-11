// Base de datos en memoria y almacenamiento local
let padronDGII = [];
let productos = [
    { id: 1, nombre: "Helado Gordito Chinola (Artesanal)", precio: 50, imagen: "assets/img/helado.png", categoria: "Postre", disponible: true },
    { id: 2, nombre: "Café Espresso Especial Jacko", precio: 120, imagen: "assets/img/cafe.png", categoria: "Bebida", disponible: true },
    { id: 3, nombre: "Plato del Día (Pollo al Horno)", precio: 250, imagen: "assets/img/plato.png", categoria: "Plato Fuerte", disponible: true }
];
let facturaActual = [
    { id: 1, nombre: "Helado Gordito Chinola (Artesanal)", cantidad: 2, precio: 50 },
    { id: 2, nombre: "Café Espresso Especial Jacko", cantidad: 1, precio: 120 }
];

document.addEventListener('DOMContentLoaded', () => {
    inicializarApp();
});

function inicializarApp() {
    // Cargar padrón DGII guardado si existe
    const savedDGII = localStorage.getItem('padron_dgii_raw');
    if (savedDGII) {
        procesarTextoDGII(savedDGII);
    } else {
        // Datos de prueba iniciales si no hay archivo cargado
        padronDGII = [
            { rnc: "00109565697", razonSocial: "JACKO MULTISERVICE SRL", nombreComercial: "JACKO TECH", actividad: "Servicios Tecnológicos", estado: "ACTIVO", regimen: "NORMAL" },
            { rnc: "40222062750", razonSocial: "JUAN PEREZ", nombreComercial: "JUAN PEREZ", actividad: "Comercio", estado: "ACTIVO", regimen: "RST" }
        ];
    }
    renderizarFactura();
    renderizarProductos();
    renderizarClientesDGII();
    
    // Fecha actual en menú del día
    const hoy = new Date().toISOString().split('T')[0];
    const inputFecha = document.getElementById('fechaMenu');
    if(inputFecha) inputFecha.value = hoy;
    renderizarMenuDia();
}

// Pestañas / Tabs
function switchTab(tabId) {
    document.querySelectorAll('.tab-pane').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.nav-link').forEach(el => el.classList.remove('active'));
    
    document.getElementById(`tab-${tabId}`).style.display = 'block';
    event.currentTarget.classList.add('active');
}

// 1. GESTIÓN DE FACTURA & BOTÓN BORRAR COMPLETA
function borrarFacturaCompleta() {
    if (confirm("⚠️ ¿Estás seguro de que deseas borrar la factura completa? Se eliminarán todos los ítems cargados.")) {
        facturaActual = [];
        document.getElementById('rncInput').value = '';
        document.getElementById('nombreClienteInput').value = '';
        document.getElementById('estadoRncInput').value = '';
        renderizarFactura();
        alert("Factura borrada correctamente.");
    }
}

function renderizarFactura() {
    const tbody = document.getElementById('cartItemsBody');
    tbody.innerHTML = '';
    let subtotal = 0;

    facturaActual.forEach((item, index) => {
        let itemSub = item.cantidad * item.precio;
        subtotal += itemSub;
        tbody.innerHTML += `
            <tr>
                <td>${item.nombre}</td>
                <td><input type="number" value="${item.cantidad}" style="width: 50px;" onchange="cambiarCantidad(${index}, this.value)"></td>
                <td>RD$ ${item.precio.toFixed(2)}</td>
                <td>RD$ ${itemSub.toFixed(2)}</td>
                <td><button class="btn btn-danger btn-sm" onclick="eliminarItemFactura(${index})">❌</button></td>
            </tr>
        `;
    });

    let itbis = subtotal * 0.18;
    let total = subtotal + itbis;

    document.getElementById('lblSubtotal').innerText = `RD$ ${subtotal.toFixed(2)}`;
    document.getElementById('lblItbis').innerText = `RD$ ${itbis.toFixed(2)}`;
    document.getElementById('lblTotal').innerText = `RD$ ${total.toFixed(2)}`;
}

function eliminarItemFactura(index) {
    facturaActual.splice(index, 1);
    renderizarFactura();
}

function cambiarCantidad(index, nuevaCantidad) {
    let cant = parseInt(nuevaCantidad);
    if(cant > 0) {
        facturaActual[index].cantidad = cant;
        renderizarFactura();
    }
}

function procesarPago() {
    if(facturaActual.length === 0) {
        alert("No hay ítems en la factura.");
        return;
    }
    alert("✅ ¡Factura procesada y guardada exitosamente!");
    facturaActual = [];
    renderizarFactura();
}

// 2. CARGA DE IMAGEN (PC Y WEB)
let imagenTemporalUrl = "assets/img/placeholder.png";

function previewFromFile(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            imagenTemporalUrl = e.target.result;
            document.getElementById('imgDisplay').src = imagenTemporalUrl;
        };
        reader.readAsDataURL(file);
    }
}

function promptImageUrl() {
    const url = prompt("Introduce la URL de la imagen (ej: https://images.unsplash.com/...):");
    if (url) {
        imagenTemporalUrl = url;
        document.getElementById('imgDisplay').src = url;
    }
}

function abrirModalProducto() {
    document.getElementById('prodNombre').value = '';
    document.getElementById('prodPrecio').value = '';
    imagenTemporalUrl = "assets/img/placeholder.png";
    document.getElementById('imgDisplay').src = imagenTemporalUrl;
    document.getElementById('modalProducto').style.display = 'flex';
}

function cerrarModalProducto() {
    document.getElementById('modalProducto').style.display = 'none';
}

function guardarProducto() {
    const nombre = document.getElementById('prodNombre').value;
    const precio = parseFloat(document.getElementById('prodPrecio').value);
    
    if(!nombre || !precio) {
        alert("Por favor completa el nombre y el precio.");
        return;
    }

    productos.push({
        id: productos.length + 1,
        nombre: nombre,
        precio: precio,
        imagen: imagenTemporalUrl,
        categoria: "General",
        disponible: true
    });

    renderizarProductos();
    cerrarModalProducto();
    alert("Producto guardado correctamente.");
}

function renderizarProductos() {
    const grid = document.getElementById('productsGrid');
    grid.innerHTML = '';
    productos.forEach(p => {
        grid.innerHTML += `
            <div class="product-card">
                <img src="${p.imagen}" alt="${p.nombre}" style="width: 100%; height: 140px; object-fit: cover; border-radius: 6px;">
                <h4>${p.nombre}</h4>
                <p class="price">RD$ ${p.precio.toFixed(2)}</p>
                <button class="btn btn-primary" onclick="agregarAFactura(${p.id})">+ Facturar</button>
            </div>
        `;
    });
}

function agregarAFactura(id) {
    const prod = productos.find(p => p.id === id);
    if(prod) {
        const existente = facturaActual.find(i => i.id === id);
        if(existente) {
            existente.cantidad++;
        } else {
            facturaActual.push({ id: prod.id, nombre: prod.nombre, cantidad: 1, precio: prod.precio });
        }
        renderizarFactura();
    }
}

// 3. MENÚ DEL DÍA (Disponibilidad y edición)
function renderizarMenuDia() {
    const tbody = document.getElementById('tablaMenuDiaBody');
    tbody.innerHTML = '';
    productos.forEach((p, idx) => {
        tbody.innerHTML += `
            <tr>
                <td><strong>${p.nombre}</strong></td>
                <td>${p.categoria}</td>
                <td>RD$ ${p.precio.toFixed(2)}</td>
                <td>
                    <label class="switch">
                        <input type="checkbox" ${p.disponible ? 'checked' : ''} onchange="toggleDisponibilidad(${p.id})">
                        <span>${p.disponible ? 'Disponible' : 'Agotado'}</span>
                    </label>
                </td>
                <td>
                    <button class="btn btn-secondary btn-sm" onclick="editarPrecioMenu(${p.id})">✏️ Editar</button>
                </td>
            </tr>
        `;
    });
}

function toggleDisponibilidad(id) {
    const p = productos.find(prod => prod.id === id);
    if(p) {
        p.disponible = !p.disponible;
        renderizarMenuDia();
    }
}

function editarPrecioMenu(id) {
    const p = productos.find(prod => prod.id === id);
    const nuevoPrecio = prompt(`Nuevo precio para ${p.nombre}:`, p.precio);
    if(nuevoPrecio && !isNaN(nuevoPrecio)) {
        p.precio = parseFloat(nuevoPrecio);
        renderizarMenuDia();
        renderizarProductos();
        alert("Precio actualizado.");
    }
}

// 4. VERIFICACIÓN RNC Y PADRÓN DGII
function actualizarBaseDatosDGII(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const contenido = e.target.result;
            localStorage.setItem('padron_dgii_raw', contenido);
            procesarTextoDGII(contenido);
            document.getElementById('statusDGII').innerText = `✅ Padrón cargado con éxito (${padronDGII.length} registros).`;
            renderizarClientesDGII();
        };
        reader.readAsText(file);
    }
}

function procesarTextoDGII(texto) {
    const lineas = texto.split('\n');
    padronDGII = lineas.map(linea => {
        const col = linea.split('|');
        if (col.length >= 2) {
            return {
                rnc: col[0].trim(),
                razonSocial: col[1].trim(),
                nombreComercial: col[2] ? col[2].trim() : '',
                actividad: col[3] ? col[3].trim() : '',
                estado: col[9] ? col[9].trim() : 'ACTIVO',
                regimen: col[10] ? col[10].trim() : 'NORMAL'
            };
        }
        return null;
    }).filter(item => item !== null && item.rnc !== '');
}

function verificarRNC() {
    const rncInput = document.getElementById('rncInput').value.replace(/-/g, '').trim();
    if(!rncInput) {
        alert("Por favor ingrese un RNC o Cédula.");
        return;
    }

    const cliente = padronDGII.find(c => c.rnc === rncInput);
    if(cliente) {
        document.getElementById('nombreClienteInput').value = cliente.razonSocial;
        document.getElementById('estadoRncInput').value = cliente.estado;
        alert(`✅ RNC Verificado:\nContribuyente: ${cliente.razonSocial}\nEstado: ${cliente.estado}`);
    } else {
        alert("❌ RNC/Cédula no encontrado en la base de datos de la DGII cargada.");
        document.getElementById('nombreClienteInput').value = "CLIENTE GENERAL";
        document.getElementById('estadoRncInput').value = "NO REGISTRADO";
    }
}

function renderizarClientesDGII() {
    const tbody = document.getElementById('tablaClientesBody');
    if(!tbody) return;
    tbody.innerHTML = '';
    // Mostrar primeros 50 para rendimiento
    const muestra = padronDGII.slice(0, 50);
    muestra.forEach(c => {
        tbody.innerHTML += `
            <tr>
                <td>${c.rnc}</td>
                <td>${c.razonSocial}</td>
                <td>${c.nombreComercial}</td>
                <td><span class="badge ${c.estado === 'ACTIVO' ? 'badge-success' : 'badge-danger'}">${c.estado}</span></td>
                <td>${c.regimen}</td>
            </tr>
        `;
    });
}

function filtrarClientesDGII(filtro) {
    const tbody = document.getElementById('tablaClientesBody');
    if(!tbody) return;
    tbody.innerHTML = '';
    const termino = filtro.toLowerCase();
    const filtrados = padronDGII.filter(c => c.rnc.toLowerCase().includes(termino) || c.razonSocial.toLowerCase().includes(termino)).slice(0, 50);
    
    filtrados.forEach(c => {
        tbody.innerHTML += `
            <tr>
                <td>${c.rnc}</td>
                <td>${c.razonSocial}</td>
                <td>${c.nombreComercial}</td>
                <td>${c.estado}</td>
                <td>${c.regimen}</td>
            </tr>
        `;
    });
}
