// server.js
const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Configuración de multer para manejar archivos
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Configuración de Nodemailer
const transporter = nodemailer.createTransporter({
    host: 'tu-servidor-smtp.com', // Reemplaza con tu servidor SMTP
    port: 587,
    secure: false,
    auth: {
        user: 'tu-correo@dominio.com', // Reemplaza con tu correo
        pass: 'tu-contraseña' // Reemplaza con tu contraseña
    }
});

// Ruta para enviar el correo
app.post('/send-email', upload.single('imagen'), async (req, res) => {
    try {
        const {
            name, email, asunto, message,
            apellido, rut, telefono, 'medio-pago': medioPago,
            'digitos-tarjeta': digitosTarjeta, 'tipo-tarjeta': tipoTarjeta,
            'hora-compra': horaCompra, 'fecha-compra': fechaCompra,
            ciudad, recinto, 'numero-maquina': numeroMaquina,
            'tipo-maquina': tipoMaquina, descripcion,
            'nombre-banco': nombreBanco, 'rut-banco': rutBanco,
            banco, 'numero-cuenta': numeroCuenta, 'tipo-cuenta': tipoCuenta,
            'correo-devolucion': correoDevolucion
        } = req.body;

        // Construir el contenido del correo
        let emailContent = `
            <h2>Nuevo formulario de contacto recibido</h2>
            <h3>Información básica:</h3>
            <p><strong>Nombre:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Asunto:</strong> ${asunto}</p>
            <p><strong>Mensaje:</strong> ${message}</p>
        `;

        // Si es un reclamo, agregar información adicional
        if (asunto === 'reclamo') {
            emailContent += `
                <h3>Detalles del reclamo:</h3>
                <p><strong>Apellido:</strong> ${apellido || 'No proporcionado'}</p>
                <p><strong>RUT:</strong> ${rut || 'No proporcionado'}</p>
                <p><strong>Teléfono:</strong> ${telefono || 'No proporcionado'}</p>
                <p><strong>Medio de pago:</strong> ${medioPago || 'No proporcionado'}</p>
                ${medioPago === 'tarjeta' ? `
                    <p><strong>Últimos 4 dígitos de tarjeta:</strong> ${digitosTarjeta || 'No proporcionado'}</p>
                    <p><strong>Tipo de tarjeta:</strong> ${tipoTarjeta || 'No proporcionado'}</p>
                ` : ''}
                <p><strong>Hora de compra:</strong> ${horaCompra || 'No proporcionada'}</p>
                <p><strong>Fecha de compra:</strong> ${fechaCompra || 'No proporcionada'}</p>
                <p><strong>Ciudad:</strong> ${ciudad || 'No proporcionada'}</p>
                <p><strong>Recinto:</strong> ${recinto || 'No proporcionado'}</p>
                <p><strong>Número de máquina:</strong> ${numeroMaquina || 'No proporcionado'}</p>
                <p><strong>Tipo de máquina:</strong> ${tipoMaquina || 'No proporcionado'}</p>
                <p><strong>Descripción del problema:</strong> ${descripcion || 'No proporcionada'}</p>
                
                <h3>Datos para devolución:</h3>
                <p><strong>Nombre completo:</strong> ${nombreBanco || 'No proporcionado'}</p>
                <p><strong>RUT:</strong> ${rutBanco || 'No proporcionado'}</p>
                <p><strong>Banco:</strong> ${banco || 'No proporcionado'}</p>
                <p><strong>Número de cuenta:</strong> ${numeroCuenta || 'No proporcionado'}</p>
                <p><strong>Tipo de cuenta:</strong> ${tipoCuenta || 'No proporcionado'}</p>
                <p><strong>Correo para devolución:</strong> ${correoDevolucion || 'No proporcionado'}</p>
            `;
        }

        // Configurar el correo
        const mailOptions = {
            from: '"Formulario Web" <tu-correo@dominio.com>',
            to: 'buzon@yellowbox.cl',
            subject: `Nuevo ${asunto}: ${name}`,
            html: emailContent,
            attachments: req.file ? [{
                filename: req.file.originalname,
                content: req.file.buffer
            }] : []
        };

        // Enviar el correo
        await transporter.sendMail(mailOptions);
        
        res.status(200).json({ success: true, message: 'Formulario enviado correctamente' });
    } catch (error) {
        console.error('Error al enviar el correo:', error);
        res.status(500).json({ success: false, message: 'Error al enviar el formulario' });
    }
});

// Servir archivos estáticos
app.use(express.static('public'));

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});