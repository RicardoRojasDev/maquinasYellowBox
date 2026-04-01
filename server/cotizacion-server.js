const fs = require("fs");
const path = require("path");
const express = require("express");
const nodemailer = require("nodemailer");

loadEnvFile(path.join(__dirname, ".env"));

const app = express();
const PORT = Number(process.env.PORT || 3001);
const QUOTE_TO_EMAIL = process.env.QUOTE_TO_EMAIL || "soporte@smkvending.cl";
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || "*";

app.use(express.json({ limit: "1mb" }));
app.use(express.static(path.resolve(__dirname, "..")));

app.use((req, res, next) => {
  const origin = req.headers.origin || "";
  const canAllowAny = ALLOWED_ORIGIN === "*";
  const canAllowSpecific = ALLOWED_ORIGIN && origin === ALLOWED_ORIGIN;

  if (canAllowAny || canAllowSpecific) {
    res.setHeader("Access-Control-Allow-Origin", canAllowAny ? "*" : ALLOWED_ORIGIN);
  }
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  return next();
});

app.get("/health", (_req, res) => {
  res.status(200).json({ ok: true, service: "cotizacion-mail" });
});

app.post("/enviar-cotizacion", async (req, res) => {
  try {
    const payload = validatePayload(req.body);
    const transporter = createTransporter();

    const html = buildHtmlMail(payload);
    const text = buildTextMail(payload);

    await transporter.sendMail({
      from: process.env.QUOTE_FROM_EMAIL || process.env.SMTP_USER,
      to: QUOTE_TO_EMAIL,
      replyTo: payload.customer.email,
      subject: `[Cotizacion Web] ${payload.customer.name}`,
      text,
      html,
    });

    return res.status(200).json({
      ok: true,
      message: "Cotizacion enviada correctamente.",
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    const message =
      error.exposeMessage ||
      "No se pudo enviar la cotizacion. Revisa la configuracion SMTP.";

    console.error("[cotizacion-server] Error:", error.message);
    return res.status(statusCode).json({ ok: false, message });
  }
});

app.listen(PORT, () => {
  console.log(`[cotizacion-server] activo en http://localhost:${PORT}`);
});

function createTransporter() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 465);
  const secure = String(process.env.SMTP_SECURE || "true").toLowerCase() !== "false";
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    throw buildError(
      "Faltan variables SMTP_HOST, SMTP_USER o SMTP_PASS.",
      500,
      "Servidor de correo no configurado correctamente.",
    );
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
  });
}

function validatePayload(body) {
  if (!body || typeof body !== "object") {
    throw buildError("Payload vacio o invalido.", 400, "Solicitud invalida.");
  }

  const customer = body.customer || {};
  const cart = Array.isArray(body.cart) ? body.cart : [];

  if (!customer.name || !customer.email || !customer.phone) {
    throw buildError("Campos de cliente incompletos.", 400, "Completa nombre, correo y telefono.");
  }

  if (!isValidEmail(customer.email)) {
    throw buildError("Correo invalido.", 400, "Correo invalido.");
  }

  if (!cart.length) {
    throw buildError("Carrito vacio.", 400, "No hay productos para cotizar.");
  }

  const normalizedCart = cart
    .map((item) => ({
      name: String(item.name || "").trim(),
      quantity: Number(item.quantity) || 0,
      price: Number(item.price) || 0,
    }))
    .filter((item) => item.name && item.quantity > 0 && item.price > 0);

  if (!normalizedCart.length) {
    throw buildError("Items del carrito invalidos.", 400, "Los productos del carrito no son validos.");
  }

  return {
    customer: {
      name: String(customer.name).trim(),
      email: String(customer.email).trim(),
      phone: String(customer.phone).trim(),
      message: String(customer.message || "").trim(),
    },
    cart: normalizedCart,
    total: Number(body.total) || normalizedCart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    createdAt: body.createdAt || new Date().toISOString(),
  };
}

function buildTextMail(payload) {
  const lines = payload.cart.map(
    (item, index) =>
      `${index + 1}. ${item.name} | Cantidad: ${item.quantity} | Unitario: ${formatCurrency(item.price)} | Subtotal: ${formatCurrency(item.price * item.quantity)}`,
  );

  return [
    "Nueva cotizacion desde productos.html",
    "",
    `Fecha: ${new Date(payload.createdAt).toLocaleString("es-CL")}`,
    "",
    "Datos cliente:",
    `Nombre: ${payload.customer.name}`,
    `Correo: ${payload.customer.email}`,
    `Telefono: ${payload.customer.phone}`,
    "",
    "Mensaje:",
    payload.customer.message || "Sin mensaje adicional.",
    "",
    "Detalle carrito:",
    ...lines,
    "",
    `Total referencial: ${formatCurrency(payload.total)}`,
  ].join("\n");
}

function buildHtmlMail(payload) {
  const rows = payload.cart
    .map(
      (item) => `
        <tr>
          <td style="padding:8px;border:1px solid #ddd;">${escapeHtml(item.name)}</td>
          <td style="padding:8px;border:1px solid #ddd;text-align:center;">${item.quantity}</td>
          <td style="padding:8px;border:1px solid #ddd;text-align:right;">${formatCurrency(item.price)}</td>
          <td style="padding:8px;border:1px solid #ddd;text-align:right;">${formatCurrency(item.price * item.quantity)}</td>
        </tr>
      `,
    )
    .join("");

  return `
    <div style="font-family:Arial, sans-serif; color:#1f1d18; line-height:1.4;">
      <h2 style="margin:0 0 12px;">Nueva cotizacion web</h2>
      <p style="margin:0 0 18px;">Fecha: ${new Date(payload.createdAt).toLocaleString("es-CL")}</p>

      <h3 style="margin:0 0 8px;">Datos del cliente</h3>
      <p style="margin:0;">Nombre: ${escapeHtml(payload.customer.name)}</p>
      <p style="margin:0;">Correo: ${escapeHtml(payload.customer.email)}</p>
      <p style="margin:0 0 14px;">Telefono: ${escapeHtml(payload.customer.phone)}</p>

      <h3 style="margin:0 0 8px;">Mensaje</h3>
      <p style="margin:0 0 16px;white-space:pre-wrap;">${escapeHtml(payload.customer.message || "Sin mensaje adicional.")}</p>

      <h3 style="margin:0 0 8px;">Productos solicitados</h3>
      <table style="width:100%; border-collapse:collapse; margin-bottom:12px;">
        <thead>
          <tr style="background:#f7f0db;">
            <th style="padding:8px;border:1px solid #ddd;text-align:left;">Producto</th>
            <th style="padding:8px;border:1px solid #ddd;text-align:center;">Cantidad</th>
            <th style="padding:8px;border:1px solid #ddd;text-align:right;">Unitario</th>
            <th style="padding:8px;border:1px solid #ddd;text-align:right;">Subtotal</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>

      <p style="font-size:16px; font-weight:700; margin:0;">Total referencial: ${formatCurrency(payload.total)}</p>
    </div>
  `;
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || "").trim());
}

function formatCurrency(value) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(value);
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildError(message, statusCode, exposeMessage) {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.exposeMessage = exposeMessage;
  return error;
}

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;

  const raw = fs.readFileSync(filePath, "utf8");
  raw.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;

    const separator = trimmed.indexOf("=");
    if (separator < 1) return;

    const key = trimmed.slice(0, separator).trim();
    const value = trimmed.slice(separator + 1).trim();

    if (!process.env[key]) {
      process.env[key] = value;
    }
  });
}
