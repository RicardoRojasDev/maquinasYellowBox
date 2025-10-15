(function ($) {
    "use strict";
    
    // Dropdown on mouse hover
    $(document).ready(function () {
        function toggleNavbarMethod() {
            if ($(window).width() > 992) {
                $('.navbar .dropdown').on('mouseover', function () {
                    $('.dropdown-toggle', this).trigger('click');
                }).on('mouseout', function () {
                    $('.dropdown-toggle', this).trigger('click').blur();
                });
            } else {
                $('.navbar .dropdown').off('mouseover').off('mouseout');
            }
        }
        toggleNavbarMethod();
        $(window).resize(toggleNavbarMethod);
    });
    
    
    // Back to top button
    $(window).scroll(function () {
        if ($(this).scrollTop() > 100) {
            $('.back-to-top').fadeIn('slow');
        } else {
            $('.back-to-top').fadeOut('slow');
        }
    });
    $('.back-to-top').click(function () {
        $('html, body').animate({scrollTop: 0}, 1500, 'easeInOutExpo');
        return false;
    });


    // Vendor carousel
    $('.vendor-carousel').owlCarousel({
        loop: true,
        margin: 29,
        nav: false,
        autoplay: true,
        smartSpeed: 1000,
        responsive: {
            0:{
                items:2
            },
            576:{
                items:3
            },
            768:{
                items:4
            },
            992:{
                items:5
            },
            1200:{
                items:6
            }
        }
    });


    // Related carousel
    $('.related-carousel').owlCarousel({
        loop: true,
        margin: 29,
        nav: false,
        autoplay: true,
        smartSpeed: 1000,
        responsive: {
            0:{
                items:1
            },
            576:{
                items:2
            },
            768:{
                items:3
            },
            992:{
                items:4
            }
        }
    });


    // Product Quantity
    $('.quantity button').on('click', function () {
        var button = $(this);
        var oldValue = button.parent().parent().find('input').val();
        if (button.hasClass('btn-plus')) {
            var newVal = parseFloat(oldValue) + 1;
        } else {
            if (oldValue > 0) {
                var newVal = parseFloat(oldValue) - 1;
            } else {
                newVal = 0;
            }
        }
        button.parent().parent().find('input').val(newVal);
    });
    
})(jQuery);

const botones = document.querySelectorAll('.accion');
const modal = document.getElementById('modalFormulario');
const cerrar = document.querySelector('.modal__cerrar');
const titulo = document.getElementById('modalTitulo');
const camposDinamicos = document.getElementById('camposDinamicos');
const formulario = document.getElementById('formularioGeneral');

// Estructura de campos por tipo
const formularios = {
  reclamo: [
    { label: "Apellido", name: "apellido" },
    { label: "RUT", name: "rut" },
    { label: "Teléfono", name: "telefono" },
    { label: "Medio de pago", name: "medio_pago", type: "select", options: ["Billete", "Moneda", "Tarjeta"] },
    { label: "Últimos 4 dígitos de tarjeta", name: "digitos_tarjeta" },
    { label: "Tipo de tarjeta", name: "tipo_tarjeta", type: "select", options: ["Débito", "Crédito"] },
    { label: "Hora de compra", name: "hora", type: "time" },
    { label: "Fecha de compra", name: "fecha", type: "date" },
    { label: "Ciudad", name: "ciudad", type: "select", options: ["Los Ángeles", "Angol", "Santa Bárbara", "Huepil", "Mulchén", "Nacimiento", "Laja", "Concepción"] },
    { label: "Recinto", name: "recinto" },
    { label: "Número de máquina", name: "numero_maquina" },
    { label: "Relato de lo ocurrido", name: "relato", type: "textarea" },
    { label: "Adjuntar imagen", name: "imagen", type: "file" },
    { label: "Datos para devolución", name: "devolucion", type: "group", fields: [
      { label: "Nombre", name: "nombre_transferencia" },
      { label: "RUT", name: "rut_transferencia" },
      { label: "Banco", name: "banco" },
      { label: "Número de cuenta", name: "cuenta" },
      { label: "Tipo de cuenta", name: "tipo_cuenta", type: "select", options: ["Cta Vista", "Cta Corriente", "Cta Rut", "Chequera Electrónica"] },
      { label: "Correo electrónico", name: "correo_transferencia" }
    ]}
  ],
  sugerencia: [
    { label: "Tu sugerencia", name: "sugerencia", type: "textarea" }
  ],
  felicitacion: [
    { label: "¿A quién va dirigida?", name: "destinatario" },
    { label: "Mensaje", name: "mensaje", type: "textarea" }
  ],
  contratacion: [
    { label: "Empresa o contacto", name: "empresa" },
    { label: "Propuesta", name: "propuesta", type: "textarea" }
  ]
};

// Abrir modal y cargar campos
botones.forEach(btn => {
  btn.addEventListener('click', () => {
    const tipo = btn.dataset.tipo;
    titulo.textContent = `Formulario de ${tipo.charAt(0).toUpperCase() + tipo.slice(1)}`;
    camposDinamicos.innerHTML = '';
    const campos = formularios[tipo];
    campos.forEach(campo => {
      if (campo.type === "group") {
        const groupTitle = document.createElement('h4');
        groupTitle.textContent = campo.label;
        camposDinamicos.appendChild(groupTitle);
        campo.fields.forEach(sub => crearCampo(sub));
      } else {
        crearCampo(campo);
      }
    });
    modal.hidden = false;
  });
});

function crearCampo(campo) {
  const label = document.createElement('label');
  label.textContent = campo.label;
  let input;
  if (campo.type === "textarea") {
    input = document.createElement('textarea');
  } else if (campo.type === "select") {
    input = document.createElement('select');
    campo.options.forEach(opt => {
      const option = document.createElement('option');
      option.value = opt.toLowerCase();
      option.textContent = opt;
      input.appendChild(option);
    });
  } else if (campo.type === "file") {
    input = document.createElement('input');
    input.type = "file";
    input.accept = "image/*";
  } else {
    input = document.createElement('input');
    input.type = campo.type || "text";
  }
  input.name = campo.name;
  input.required = true;
  camposDinamicos.appendChild(label);
  camposDinamicos.appendChild(input);
}

// Cerrar modal
cerrar.addEventListener('click', () => {
  modal.hidden = true;
});