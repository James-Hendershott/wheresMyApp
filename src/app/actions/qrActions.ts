// WHY: Generate QR codes for container labels
// WHAT: Server action that creates a QR code data URL from a container code
// HOW: Uses qrcode library to generate PNG data URLs for printing or display

"use server";
import QRCode from "qrcode";

export async function generateQRCode(code: string): Promise<string> {
  // WHY: Generate QR at high resolution for print quality
  const dataUrl = await QRCode.toDataURL(code, {
    errorCorrectionLevel: "H",
    type: "image/png",
    width: 512,
    margin: 2,
  });
  return dataUrl;
}
