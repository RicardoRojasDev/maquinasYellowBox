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

// SOLO ESTO DEBE QUEDAR EN main.js
function mostrarVista(vista) {
    const vistaCompra = document.getElementById("vista-compra");
    const vistaDevolucion = document.getElementById("vista-ventas");
    const botones = document.querySelectorAll(".btn-group .btn");
    
    if (vistaCompra) {
        vistaCompra.style.display = vista === "compra" ? "block" : "none";
    }
    if (vistaDevolucion) {
        vistaDevolucion.style.display = vista === "devolucion" ? "block" : "none";
    }

    botones.forEach((btn) => btn.classList.remove("active"));
    if (vista === "compra" && botones[0]) botones[0].classList.add("active");
    if (vista === "devolucion" && botones[1]) botones[1].classList.add("active");
}