# Envio de Cotizacion por Correo

## 1) Dependencias

Desde la raiz del proyecto:

```bash
npm install
```

## 2) Configurar variables de entorno

1. Copia `server/.env.example`.
2. Crea un archivo `.env` en la carpeta `server/` o define las variables en tu terminal.
3. Configura al menos:

- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_SECURE`
- `SMTP_USER`
- `SMTP_PASS`
- `QUOTE_TO_EMAIL=soporte@smkvending.cl`

## 3) Levantar el servidor

Desde la raiz del proyecto:

```bash
npm run start:cotizacion
```

El endpoint de envio queda en:

`POST http://localhost:3001/enviar-cotizacion`

## 4) Probar la pagina

Abre `productos.html` desde tu servidor local habitual.
El frontend ya viene apuntando a:

`http://localhost:3001/enviar-cotizacion`

Si prefieres otro puerto o dominio, define:

`window.YELLOWBOX_QUOTE_ENDPOINT`

antes de cargar `js/tienda.js`.
