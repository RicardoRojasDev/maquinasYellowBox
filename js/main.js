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
        smartSpeed: 200,
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
        smartSpeed: 200,
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

      // Función para cambiar entre vistas
      function mostrarVista(vista) {
        document.getElementById("vista-compra").style.display =
          vista === "compra" ? "block" : "none";
        document.getElementById("vista-devolucion").style.display =
          vista === "devolucion" ? "block" : "none";

        // Actualizar botones activos
        const botones = document.querySelectorAll(".btn-group .btn");
        botones.forEach((btn) => btn.classList.remove("active"));
        if (vista === "compra") botones[0].classList.add("active");
        if (vista === "devolucion") botones[1].classList.add("active");
      }

      // Función para mostrar/ocultar sección de reclamos
      function updateReclamoVisibility() {
        const asuntoSelect = document.getElementById("asunto");
        const reclamoSection = document.getElementById("reclamo-section");

        if (!asuntoSelect || !reclamoSection) return;

        if (asuntoSelect.value === "reclamo") {
          reclamoSection.style.display = "block";
          console.log("✅ Mostrando sección de reclamos");
        } else {
          reclamoSection.style.display = "none";
          console.log("❌ Ocultando sección de reclamos");
        }
      }

      document.addEventListener("DOMContentLoaded", function () {
        console.log("🔄 Página cargada, verificando EmailJS...");

        if (typeof emailjs === "undefined") {
          console.error("❌ EmailJS SDK no cargado");
          return;
        }

        if (typeof EmailService === "undefined") {
          console.error("❌ EmailService no definido");
          return;
        }

        console.log("✅ EmailJS y EmailService listos");

        // 1. Configurar visibilidad de reclamos
        const asuntoSelect = document.getElementById("asunto");
        if (asuntoSelect) {
          updateReclamoVisibility();
          asuntoSelect.addEventListener("change", updateReclamoVisibility);
        }

        // 2. Configurar visibilidad de medios de pago
        const medioPagoInputs = document.querySelectorAll(
          'input[name="medio-pago"]'
        );
        const billeteSection = document.getElementById(
          "billete-denominacion-extra"
        );
        const tarjetaSection = document.getElementById("tarjeta-details");

        medioPagoInputs.forEach((input) => {
          input.addEventListener("change", function () {
            if (billeteSection) billeteSection.style.display = "none";
            if (tarjetaSection) tarjetaSection.style.display = "none";

            if (this.value === "billete" && billeteSection) {
              billeteSection.style.display = "block";
            } else if (this.value === "tarjeta" && tarjetaSection) {
              tarjetaSection.style.display = "block";
            }
          });
        });

        // 3. Configurar tipo de máquina
        const tipoMaquinaInputs = document.querySelectorAll(
          'input[name="tipo-maquina"]'
        );
        const snackProblems = document.getElementById("snack-problems");
        const cafeProblems = document.getElementById("cafe-problems");

        tipoMaquinaInputs.forEach((input) => {
          input.addEventListener("change", function () {
            if (snackProblems) snackProblems.style.display = "none";
            if (cafeProblems) cafeProblems.style.display = "none";

            if (this.value === "snack" && snackProblems) {
              snackProblems.style.display = "block";
            } else if (this.value === "cafe" && cafeProblems) {
              cafeProblems.style.display = "block";
            }
          });
        });

        // 4. Configurar banco (Otro banco)
        const bancoSelect = document.getElementById("banco-select");
        const otroBancoContainer = document.getElementById(
          "otro-banco-container"
        );
        const bancoOtroInput = document.getElementById("banco-otro");

        if (bancoSelect) {
          bancoSelect.addEventListener("change", function () {
            if (this.value === "otro") {
              otroBancoContainer.style.display = "block";
              bancoOtroInput.required = true;
            } else {
              otroBancoContainer.style.display = "none";
              bancoOtroInput.required = false;
              bancoOtroInput.value = "";
            }
          });
        }

        // 5. Configurar formulario de ventas
        const ventasForm = document.getElementById("ventasForm");
        const successVentas = document.getElementById("success-ventas");

        if (ventasForm) {
          ventasForm.addEventListener("submit", async function (e) {
            e.preventDefault();
            e.stopPropagation();

            // Validación
            if (!ventasForm.checkValidity()) {
              ventasForm.classList.add("was-validated");
              return;
            }

            const submitBtn = ventasForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;

            try {
              // Estado de carga
              submitBtn.innerHTML =
                '<span class="spinner-border spinner-border-sm"></span> Enviando...';
              submitBtn.disabled = true;

              // Preparar datos para EmailJS
              const formData = new FormData(ventasForm);
              const templateParams = {
                to_email: "expendedorasyellowbox@gmail.com",
                from_name: formData.get("personaContacto") || "Cliente",
                from_email: formData.get("correo") || "no-email@yellowbox.cl",
                nombreEmpresa: formData.get("nombreEmpresa"),
                rut: formData.get("rut"),
                ciudad: formData.get("ciudad"),
                direccion: formData.get("direccion"),
                personaContacto: formData.get("personaContacto"),
                telefono: formData.get("telefono"),
                correo: formData.get("correo"),
                cantidadFuncionarios: formData.get("cantidadFuncionarios"),
                tipoServicio: formData.get("tipoServicio"),
                fecha_envio: new Date().toLocaleString("es-CL"),
                timestamp: Date.now(),
                pagina_origen: window.location.href,
                asunto:
                  "SOLICITUD DE CONTRATACIÓN - " +
                  formData.get("nombreEmpresa"),
              };

              console.log("📤 Enviando formulario de ventas...");
              console.log("Datos:", templateParams);

              // Enviar con EmailJS - usa el MISMO template o crea uno nuevo
              const response = await emailjs.send(
                "service_7b1d0wb", // Tu Service ID
                "template_cbawhm6", // MISMO template ID (o crea uno nuevo para ventas)
                templateParams
              );

              console.log("✅ Formulario de ventas enviado:", response);

              // Mostrar éxito
              successVentas.style.display = "block";
              ventasForm.style.display = "none";
              successVentas.scrollIntoView({ behavior: "smooth" });

              // Auto-redireccionar después de 8 segundos
              setTimeout(() => {
                mostrarVista("compra"); // Volver al primer formulario
                successVentas.style.display = "none";
                ventasForm.style.display = "block";
                ventasForm.reset();
                ventasForm.classList.remove("was-validated");
              }, 8000);
            } catch (error) {
              console.error("❌ Error en formulario de ventas:", error);

              // Mostrar error específico
              let errorMessage = "Error al enviar la solicitud";
              if (error.text) {
                if (error.text.includes("Invalid template")) {
                  errorMessage =
                    "Error de configuración del template. Contacta al soporte.";
                } else if (error.text.includes("Invalid user id")) {
                  errorMessage = "Error de configuración. Recarga la página.";
                } else if (error.text.includes("429")) {
                  errorMessage =
                    "Límite de envíos alcanzado. Intenta más tarde.";
                }
              }

              // Crear mensaje de error
              const errorDiv = document.createElement("div");
              errorDiv.className = "alert alert-danger mt-3";
              errorDiv.innerHTML = `
                        <h4 class="alert-heading">⚠️ Error</h4>
                        <p>${errorMessage}</p>
                        <hr>
                        <p class="mb-0 small">Si el problema persiste, contacta a <strong>soporte@yellowbox.cl</strong></p>
                    `;

              ventasForm.parentNode.insertBefore(
                errorDiv,
                ventasForm.nextSibling
              );

              // Auto-remover error después de 10 segundos
              setTimeout(() => {
                errorDiv.remove();
              }, 10000);
            } finally {
              // Restaurar botón
              submitBtn.innerHTML = originalText;
              submitBtn.disabled = false;
            }
          });
        }
      });
      document.addEventListener("DOMContentLoaded", function () {
        console.log("🔄 Página cargada, verificando EmailJS...");

        if (typeof emailjs === "undefined") {
          console.error("❌ EmailJS SDK no cargado");
          return;
        }

        if (typeof EmailService === "undefined") {
          console.error("❌ EmailService no definido");
          return;
        }

        console.log("✅ EmailJS y EmailService listos");

        // DEBUG: Verificar todos los campos del formulario
        const form = document.getElementById("contactForm");
        if (form) {
          console.log(
            "📝 Formulario encontrado con",
            form.elements.length,
            "elementos"
          );
        }
      });

