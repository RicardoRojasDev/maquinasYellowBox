// js/tienda.js
class TiendaYellowBox {
    constructor() {
        this.carrito = JSON.parse(localStorage.getItem('yellowbox_carrito')) || [];
        this.init();
    }

    init() {
        this.actualizarContador();
        this.renderizarCarrito();
    }

    // Agregar producto al carrito
    agregarProducto(producto) {
        const existente = this.carrito.find(item => item.id === producto.id);
        
        if (existente) {
            existente.cantidad += 1;
        } else {
            this.carrito.push({
                ...producto,
                cantidad: 1
            });
        }
        
        this.guardarCarrito();
        this.mostrarToast(`✅ ${producto.nombre} agregado al carrito`);
    }

    // Actualizar cantidad (+ o -)
    actualizarCantidad(id, accion) {
        const item = this.carrito.find(item => item.id === id);
        if (!item) return;

        if (accion === 'incrementar') {
            item.cantidad += 1;
        } else if (accion === 'decrementar') {
            item.cantidad -= 1;
            if (item.cantidad <= 0) {
                this.eliminarProducto(id);
                return;
            }
        }

        this.guardarCarrito();
        this.renderizarCarrito();
    }

    // Eliminar producto
    eliminarProducto(id) {
        this.carrito = this.carrito.filter(item => item.id !== id);
        this.guardarCarrito();
        this.renderizarCarrito();
        this.mostrarToast('🗑️ Producto eliminado');
    }

    // Vaciar carrito completo
    vaciarCarrito() {
        if (confirm('¿Vaciar todo el carrito?')) {
            this.carrito = [];
            this.guardarCarrito();
            this.renderizarCarrito();
            this.mostrarToast('🛒 Carrito vaciado');
        }
    }

    // Calcular total
    getTotal() {
        return this.carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    }

    // Guardar en localStorage
    guardarCarrito() {
        localStorage.setItem('yellowbox_carrito', JSON.stringify(this.carrito));
        this.actualizarContador();
    }

    // Actualizar contador flotante
    actualizarContador() {
        const contador = document.getElementById('carrito-contador');
        if (contador) {
            const total = this.carrito.reduce((sum, item) => sum + item.cantidad, 0);
            contador.textContent = total;
            contador.style.display = total > 0 ? 'flex' : 'none';
        }
    }

    // Renderizar carrito en el modal
    renderizarCarrito() {
        const contenedor = document.getElementById('carrito-items');
        const vacio = document.getElementById('carrito-vacio');
        const conItems = document.getElementById('carrito-con-items');
        const totalSpan = document.getElementById('carrito-total');

        if (!contenedor) return;

        if (this.carrito.length === 0) {
            if (vacio) vacio.style.display = 'block';
            if (conItems) conItems.style.display = 'none';
            return;
        }

        if (vacio) vacio.style.display = 'none';
        if (conItems) conItems.style.display = 'block';

        let html = '';
        this.carrito.forEach(item => {
            html += `
                <div class="carrito-item mb-3 p-2 border rounded">
                    <div class="row align-items-center">
                        <div class="col-3 col-md-2">
                            <img src="${item.imagen}" alt="${item.nombre}" class="img-fluid rounded">
                        </div>
                        <div class="col-5 col-md-6">
                            <h6 class="mb-1">${item.nombre}</h6>
                            <small class="text-muted">Cód: ${item.id}</small>
                            <div class="mt-1">
                                <span class="text-warning fw-bold">$${(item.precio * item.cantidad).toLocaleString()}</span>
                                <small class="text-muted d-block">$${item.precio.toLocaleString()} c/u</small>
                            </div>
                        </div>
                        <div class="col-4 col-md-4">
                            <div class="d-flex align-items-center justify-content-end">
                                <button class="btn btn-sm btn-outline-secondary" onclick="tienda.actualizarCantidad('${item.id}', 'decrementar')">−</button>
                                <span class="mx-2 fw-bold">${item.cantidad}</span>
                                <button class="btn btn-sm btn-outline-secondary" onclick="tienda.actualizarCantidad('${item.id}', 'incrementar')">+</button>
                                <button class="btn btn-sm btn-danger ms-2" onclick="tienda.eliminarProducto('${item.id}')">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });

        contenedor.innerHTML = html;
        if (totalSpan) totalSpan.textContent = '$' + this.getTotal().toLocaleString();
    }

    // Mostrar notificación toast
    mostrarToast(mensaje) {
        const toast = document.createElement('div');
        toast.className = 'alert alert-success position-fixed top-0 end-0 m-3';
        toast.style.zIndex = '9999';
        toast.style.minWidth = '250px';
        toast.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
        toast.innerHTML = mensaje;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 2000);
    }

    // PROCESAR PEDIDO (WEBPAY + CORREO)
    async procesarPedido(datosCliente) {
        try {
            // 1. Validar carrito
            if (this.carrito.length === 0) {
                throw new Error('El carrito está vacío');
            }

            // 2. Crear objeto del pedido
            const pedido = {
                numero: 'YB-' + Date.now(),
                fecha: new Date().toLocaleString('es-CL'),
                cliente: {
                    nombre: datosCliente.nombre,
                    email: datosCliente.email,
                    telefono: datosCliente.telefono || '',
                    direccion: datosCliente.direccion || ''
                },
                productos: this.carrito.map(item => ({
                    id: item.id,
                    nombre: item.nombre,
                    precio: item.precio,
                    cantidad: item.cantidad,
                    subtotal: item.precio * item.cantidad
                })),
                total: this.getTotal(),
                estado: 'Pendiente'
            };

            // 3. ENVIAR CORREO A VENTAS (EmailJS - YA LO TIENES CONFIGURADO)
            await this.enviarCorreoVentas(pedido);

            // 4. ENVIAR CORREO AL CLIENTE
            await this.enviarCorreoCliente(pedido);

            // 5. REDIRIGIR A WEBPAY (simulado por ahora)
            this.redirigirWebpay(pedido);

            // 6. Vaciar carrito después del pedido
            this.carrito = [];
            this.guardarCarrito();
            this.renderizarCarrito();

            return { success: true, pedido };

        } catch (error) {
            console.error('Error procesando pedido:', error);
            this.mostrarToast('❌ Error: ' + error.message);
            return { success: false, error: error.message };
        }
    }

    // Enviar correo a ventas (usando EmailJS)
    async enviarCorreoVentas(pedido) {
        const templateParams = {
            to_email: 'ventas@smkvending.cl',
            from_name: pedido.cliente.nombre,
            from_email: pedido.cliente.email,
            pedido_numero: pedido.numero,
            pedido_fecha: pedido.fecha,
            pedido_total: '$' + pedido.total.toLocaleString(),
            pedido_productos: pedido.productos.map(p => 
                `${p.cantidad}x ${p.nombre} - $${p.subtotal.toLocaleString()}`
            ).join('\n'),
            cliente_telefono: pedido.cliente.telefono,
            cliente_direccion: pedido.cliente.direccion,
            asunto: `NUEVO PEDIDO #${pedido.numero} - ${pedido.cliente.nombre}`
        };

        // Usar tu EmailService existente
        if (typeof EmailService !== 'undefined') {
            await emailjs.send('service_7b1d0wb', 'template_cbawhm6', templateParams);
        }
    }

    // Enviar correo al cliente
    async enviarCorreoCliente(pedido) {
        const templateParams = {
            to_email: pedido.cliente.email,
            from_name: 'Yellow Box Vending',
            pedido_numero: pedido.numero,
            pedido_fecha: pedido.fecha,
            pedido_total: '$' + pedido.total.toLocaleString(),
            pedido_productos: pedido.productos.map(p => 
                `${p.cantidad}x ${p.nombre} - $${p.subtotal.toLocaleString()}`
            ).join('\n'),
            mensaje: 'Gracias por tu compra. Recibirás tu pedido en 72 horas hábiles.',
            asunto: `Confirmación de pedido #${pedido.numero}`
        };

        if (typeof EmailService !== 'undefined') {
            await emailjs.send('service_7b1d0wb', 'template_cbawhm6', templateParams);
        }
    }

    // Redirigir a Webpay (simulado)
    redirigirWebpay(pedido) {
        // Aquí irá la integración real con Webpay
        console.log('🔄 Redirigiendo a Webpay...', pedido);
        
        // Por ahora, simulamos éxito
        setTimeout(() => {
            window.location.href = 'gracias-compra.html?pedido=' + pedido.numero;
        }, 1500);
    }
}

// Inicializar tienda global
const tienda = new TiendaYellowBox();