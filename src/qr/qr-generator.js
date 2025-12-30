"use strict";

/**
 * Minimal QR generator module (v4.4 baseline).
 * - Generates PNG dataURL for a given text payload.
 * - Keeps implementation small and dependency-light.
 *
 * If you later need signed QR / anti-counterfeit:
 * add a `signPayload(payload, secret)` layer before encoding.
 */

const QRCode = require("qrcode");

/**
 * @param {string} payload
 * @param {{ errorCorrectionLevel?: "L"|"M"|"Q"|"H", margin?: number, scale?: number }} [opts]
 * @returns {Promise<{ dataUrl: string }>}
 */
async function generateQrDataUrl(payload, opts = {}) {
  if (typeof payload !== "string" || !payload.trim()) {
    throw new Error("payload must be a non-empty string");
  }
  const dataUrl = await QRCode.toDataURL(payload, {
    errorCorrectionLevel: opts.errorCorrectionLevel || "M",
    margin: Number.isFinite(opts.margin) ? opts.margin : 2,
    scale: Number.isFinite(opts.scale) ? opts.scale : 6,
  });
  return { dataUrl };
}

module.exports = {
  generateQrDataUrl,
};
