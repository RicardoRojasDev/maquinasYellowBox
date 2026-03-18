// Clase Tienda para manejar toda la lógica del e-commerce
class Tienda {
    constructor() {
        this.carrito = this.cargarCarrito();
        this.productos = [];
        this.inicializarEventos();
        this.actualizarInterfazCarrito();
    }

    // Cargar carrito del localStorage
    cargarCarrito() {
        const carritoGuardado = localStorage.getItem('yellowbox_carrito');
        return carritoGuardado ? JSON.parse(carritoGuardado) : [];
    }

    // Guardar carrito en localStorage
    guardarCarrito() {
        localStorage.setItem('yellowbox_carrito', JSON.stringify(this.carrito));
        this.actualizarInterfazCarrito();
    }

    // Inicializar todos los eventos
    inicializarEventos() {
        // Evento para botones "Agregar al carrito"
        document.querySelectorAll('.btn-add-to-cart').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const card = e.target.closest('.promotion-card');
                if (card) {
                    this.agregarProducto(card);
                }
            });
        });

        // Evento para filtrar productos
        document.querySelectorAll('.category-button').forEach(btn => {
            btn.addEventListener('click', () => {
                const filter = btn.getAttribute('data-filter');
                this.filtrarProductos(filter, btn);
            });
        });

        // Evento para cerrar notificaciones
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('notificacion-cerrar')) {
                e.target.closest('.notificacion').remove();
            }
        });
    }

    // Filtrar productos por categoría
    filtrarProductos(filter, botonActivo) {
        const cards = document.querySelectorAll('.promotion-card');
        
        cards.forEach(card => {
            const category = card.getAttribute('data-category');
            if (filter === 'all' || category === filter) {
                card.style.display = 'flex';
            } else {
                card.style.display = 'none';
            }
        });

        // Actualizar botón activo
        document.querySelectorAll('.category-button').forEach(b => {
            b.classList.remove('active');
        });
        botonActivo.classList.add('active');
    }

    // Agregar producto al carrito
    agregarProducto(card) {
        const productoId = this.generarIdUnico();
        const producto = {
            id: productoId,
            nombre: card.querySelector('.promotion-title').textContent,
            descripcion: card.querySelector('.promotion-description')?.textContent || '',
            precio: this.extraerPrecio(card),
            imagen: this.extraerImagen(card),
            cantidad: 1,
            categoria: card.getAttribute('data-category')
        };

        // Verificar si el producto ya existe en el carrito
        const productoExistente = this.carrito.find(p => p.nombre === producto.nombre);
        
        if (productoExistente) {
            productoExistente.cantidad += 1;
            this.mostrarNotificacion('Cantidad actualizada', `${producto.nombre} ahora tienes ${productoExistente.cantidad} unidades`, 'exito');
        } else {
            this.carrito.push(producto);
            this.mostrarNotificacion('Producto agregado', `${producto.nombre} se agregó al carrito`, 'exito');
        }

        this.guardarCarrito();
        this.animarBotonAgregar(card);
    }

    // Extraer precio del producto (si no existe, asignar uno por defecto)
    extraerPrecio(card) {
        // Buscar si ya tiene un precio definido
        const precioExistente = card.querySelector('.product-price');
        if (precioExistente) {
            return parseInt(precioExistente.getAttribute('data-precio') || precioExistente.textContent.replace(/[^0-9]/g, ''));
        }
        
        // Si no tiene precio, asignar según categoría
        const categoria = card.getAttribute('data-category');
        const preciosPorCategoria = {
            'mokador': 8990,
            'leches': 12990,
            'capuchinos': 10990,
            'chai': 11990,
            'chocolates': 9990
        };
        
        return preciosPorCategoria[categoria] || 9990;
    }

    // Extraer imagen del producto
    extraerImagen(card) {
        const img = card.querySelector('.promotion-image img');
        return img ? img.src : '';
    }

    // Generar ID único para el producto
    generarIdUnico() {
        return 'prod_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Animar botón al agregar producto
    animarBotonAgregar(card) {
        const btn = card.querySelector('.btn-add-to-cart');
        if (btn) {
            btn.style.transform = 'scale(0.95)';
            setTimeout(() => {
                btn.style.transform = '';
            }, 200);
        }
    }

    // Actualizar toda la interfaz del carrito
    actualizarInterfazCarrito() {
        this.actualizarContador();
        this.actualizarModalCarrito();
    }

    // Actualizar contador del carrito
    actualizarContador() {
        const contador = document.getElementById('carrito-contador');
        if (contador) {
            const totalItems = this.carrito.reduce((sum, item) => sum + item.cantidad, 0);
            if (totalItems > 0) {
                contador.textContent = totalItems;
                contador.style.display = 'inline';
            } else {
                contador.style.display = 'none';
            }
        }
    }

    // Actualizar el contenido del modal del carrito
    actualizarModalCarrito() {
        const carritoVacio = document.getElementById('carrito-vacio');
        const carritoConItems = document.getElementById('carrito-con-items');
        const carritoItems = document.getElementById('carrito-items');
        const carritoTotal = document.getElementById('carrito-total');

        if (!carritoItems || !carritoTotal) return;

        if (this.carrito.length === 0) {
            if (carritoVacio) carritoVacio.style.display = 'block';
            if (carritoConItems) carritoConItems.style.display = 'none';
            return;
        }

        if (carritoVacio) carritoVacio.style.display = 'none';
        if (carritoConItems) carritoConItems.style.display = 'block';

        // Generar HTML de los items
        carritoItems.innerHTML = this.carrito.map(item => `
            <div class="carrito-item" data-id="${item.id}">
                <img src="${item.imagen}" alt="${item.nombre}" class="carrito-item-img">
                <div class="carrito-item-info">
                    <div class="carrito-item-title">${item.nombre}</div>
                    <div class="carrito-item-precio">$${this.formatearPrecio(item.precio * item.cantidad)}</div>
                    <div class="carrito-item-cantidad">
                        <button class="cantidad-btn" onclick="tienda.cambiarCantidad('${item.id}', -1)">-</button>
                        <span class="cantidad-valor">${item.cantidad}</span>
                        <button class="cantidad-btn" onclick="tienda.cambiarCantidad('${item.id}', 1)">+</button>
                        <button class="btn-eliminar-item" onclick="tienda.eliminarProducto('${item.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');

        // Calcular y mostrar total
        const total = this.carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
        carritoTotal.textContent = `$${this.formatearPrecio(total)}`;
    }

    // Cambiar cantidad de un producto
    cambiarCantidad(productoId, cambio) {
        const producto = this.carrito.find(p => p.id === productoId);
        if (producto) {
            producto.cantidad += cambio;
            if (producto.cantidad <= 0) {
                this.eliminarProducto(productoId);
            } else {
                this.guardarCarrito();
            }
        }
    }

    // Eliminar producto del carrito
    eliminarProducto(productoId) {
        this.carrito = this.carrito.filter(p => p.id !== productoId);
        this.guardarCarrito();
        this.mostrarNotificacion('Producto eliminado', 'El producto se eliminó del carrito', 'exito');
    }

    // Vaciar carrito completamente
    vaciarCarrito() {
        if (this.carrito.length === 0) return;
        
        if (confirm('¿Estás seguro de vaciar el carrito?')) {
            this.carrito = [];
            this.guardarCarrito();
            this.mostrarNotificacion('Carrito vaciado', 'Todos los productos han sido eliminados', 'exito');
            
            // Cerrar modales si están abiertos
            const modalCarrito = bootstrap.Modal.getInstance(document.getElementById('modalCarrito'));
            if (modalCarrito) modalCarrito.hide();
        }
    }

    // Mostrar formulario de pago
    mostrarFormularioPago() {
        if (this.carrito.length === 0) {
            this.mostrarNotificacion('Carrito vacío', 'Agrega productos antes de continuar', 'error');
            return;
        }

        const modalCarrito = bootstrap.Modal.getInstance(document.getElementById('modalCarrito'));
        if (modalCarrito) modalCarrito.hide();

        const modalPago = new bootstrap.Modal(document.getElementById('modalPago'));
        modalPago.show();
    }

    // Procesar el pago y enviar cotización por email
    async procesarPago() {
        // Validar formulario
        const nombre = document.getElementById('cliente-nombre').value.trim();
        const email = document.getElementById('cliente-email').value.trim();
        const telefono = document.getElementById('cliente-telefono').value.trim();
        const direccion = document.getElementById('cliente-direccion').value.trim();

        if (!nombre || !email) {
            this.mostrarNotificacion('Error', 'Por favor completa los campos requeridos', 'error');
            return;
        }

        if (!this.validarEmail(email)) {
            this.mostrarNotificacion('Error', 'Por ingresa un email válido', 'error');
            return;
        }

        // Mostrar indicador de carga
        this.mostrarNotificacion('Enviando...', 'Estamos procesando tu cotización', 'exito', true);

        try {
            // Preparar datos para enviar
            const datosPedido = {
                cliente: {
                    nombre,
                    email,
                    telefono: telefono || 'No proporcionado',
                    direccion: direccion || 'No proporcionada'
                },
                productos: this.carrito,
                total: this.carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0),
                fecha: new Date().toLocaleString('es-CL', { timeZone: 'America/Santiago' }),
                numeroPedido: 'PED-' + Date.now()
            };

            // Enviar por email (usando EmailJS o similar)
            await this.enviarEmailCotizacion(datosPedido);

            // Guardar en localStorage como pedido enviado
            this.guardarPedidoEnviado(datosPedido);

            // Limpiar carrito
            this.carrito = [];
            this.guardarCarrito();

            // Cerrar modal de pago
            const modalPago = bootstrap.Modal.getInstance(document.getElementById('modalPago'));
            if (modalPago) modalPago.hide();

            // Limpiar formulario
            document.getElementById('formPago').reset();

            // Mostrar mensaje de éxito
            this.mostrarNotificacion(
                '¡Cotización enviada!', 
                'Hemos recibido tu solicitud. Te contactaremos pronto a ' + email,
                'exito'
            );

            // Redirigir a página de gracias (opcional)
            setTimeout(() => {
                window.location.href = 'gracias-compra.html';
            }, 3000);

        } catch (error) {
            console.error('Error al procesar pedido:', error);
            this.mostrarNotificacion('Error', 'No se pudo procesar tu solicitud. Intenta nuevamente.', 'error');
        }
    }

    // Validar formato de email
    validarEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    // Enviar email de cotización
    async enviarEmailCotizacion(datos) {
        // Aquí implementarías EmailJS o tu servicio de email
        // Por ahora simulamos el envío
        console.log('Enviando cotización:', datos);
        
        // Construir el cuerpo del email
        const productosHTML = datos.productos.map(item => `
            <tr>
                <td style="padding: 10px; border-bottom: 1px solid #ddd;">${item.nombre}</td>
                <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: center;">${item.cantidad}</td>
                <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">$${this.formatearPrecio(item.precio)}</td>
                <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">$${this.formatearPrecio(item.precio * item.cantidad)}</td>
            </tr>
        `).join('');

        const emailHTML = `
            <h2>Nueva Cotización - Yellow Box Vending</h2>
            <p><strong>Número de Pedido:</strong> ${datos.numeroPedido}</p>
            <p><strong>Fecha:</strong> ${datos.fecha}</p>
            
            <h3>Datos del Cliente:</h3>
            <ul>
                <li><strong>Nombre:</strong> ${datos.cliente.nombre}</li>
                <li><strong>Email:</strong> ${datos.cliente.email}</li>
                <li><strong>Teléfono:</strong> ${datos.cliente.telefono}</li>
                <li><strong>Dirección:</strong> ${datos.cliente.direccion}</li>
            </ul>
            
            <h3>Productos Solicitados:</h3>
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="background: #f8f9fa;">
                        <th style="padding: 10px; text-align: left;">Producto</th>
                        <th style="padding: 10px; text-align: center;">Cantidad</th>
                        <th style="padding: 10px; text-align: right;">Precio Unit.</th>
                        <th style="padding: 10px; text-align: right;">Subtotal</th>
                    </tr>
                </thead>
                <tbody>
                    ${productosHTML}
                </tbody>
                <tfoot>
                    <tr>
                        <td colspan="3" style="padding: 10px; text-align: right;"><strong>TOTAL:</strong></td>
                        <td style="padding: 10px; text-align: right;"><strong>$${this.formatearPrecio(datos.total)}</strong></td>
                    </tr>
                </tfoot>
            </table>
            
            <p style="margin-top: 20px;">Este es un mensaje automático. Por favor contacta al cliente para confirmar disponibilidad y proceder con la venta.</p>
        `;

        // Simular envío exitoso después de 1 segundo
        return new Promise((resolve) => {
            setTimeout(() => {
                // Aquí iría la llamada real a EmailJS
                // emailjs.send('service_id', 'template_id', {
                //     to_email: 'soporte@smkvending.cl',
                //     from_name: datos.cliente.nombre,
                //     from_email: datos.cliente.email,
                //     message: emailHTML,
                //     pedido_numero: datos.numeroPedido
                // });
                
                console.log('Email enviado a soporte@smkvending.cl');
                resolve();
            }, 1000);
        });
    }

    // Guardar pedido enviado en localStorage
    guardarPedidoEnviado(datos) {
        const pedidosEnviados = JSON.parse(localStorage.getItem('yellowbox_pedidos') || '[]');
        pedidosEnviados.push(datos);
        localStorage.setItem('yellowbox_pedidos', JSON.stringify(pedidosEnviados));
    }

    // Formatear precio
    formatearPrecio(precio) {
        return precio.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    }

    // Mostrar notificaciones
    mostrarNotificacion(titulo, mensaje, tipo = 'exito', permanente = false) {
        // Eliminar notificaciones anteriores
        const notificacionesAnteriores = document.querySelectorAll('.notificacion');
        notificacionesAnteriores.forEach(notif => notif.remove());

        const notificacion = document.createElement('div');
        notificacion.className = `notificacion ${tipo}`;
        notificacion.innerHTML = `
            <i class="fas ${tipo === 'exito' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
            <div class="notificacion-contenido">
                <div class="notificacion-titulo">${titulo}</div>
                <div class="notificacion-mensaje">${mensaje}</div>
            </div>
            <i class="fas fa-times notificacion-cerrar"></i>
        `;

        document.body.appendChild(notificacion);

        // Auto-cerrar después de 5 segundos (a menos que sea permanente)
        if (!permanente) {
            setTimeout(() => {
                if (notificacion.parentNode) {
                    notificacion.remove();
                }
            }, 5000);
        }
    }
}

// Inicializar la tienda cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.tienda = new Tienda();
});

// Funciones globales para usar desde HTML
function abrirModalCarrito() {
    const modal = new bootstrap.Modal(document.getElementById('modalCarrito'));
    modal.show();
}

function mostrarFormularioPago() {
    if (window.tienda) {
        window.tienda.mostrarFormularioPago();
    }
}

function procesarPago() {
    if (window.tienda) {
        window.tienda.procesarPago();
    }
}