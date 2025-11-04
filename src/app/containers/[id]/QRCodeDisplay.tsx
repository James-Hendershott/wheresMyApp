// WHY: Client component to display QR code and print label
// WHAT: Shows QR code with print button for physical labels
// HOW: Uses generateQRCode server action, displays image, offers print view

"use client";
import { useEffect, useState } from "react";
import { generateQRCode } from "@/app/actions/qrActions";
import { Printer } from "lucide-react";

export function QRCodeDisplay({
  code,
  label,
}: {
  code: string;
  label: string;
}) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  useEffect(() => {
    generateQRCode(code).then(setQrDataUrl);
  }, [code]);

  const handlePrint = () => {
    // WHY: Open print-friendly view in new window
    const printWindow = window.open("", "_blank");
    if (printWindow && qrDataUrl) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Print Label: ${label}</title>
            <style>
              body {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                font-family: sans-serif;
                padding: 20px;
              }
              img { width: 300px; height: 300px; }
              .label { font-size: 18px; font-weight: bold; margin-top: 10px; text-align: center; }
              .code { font-size: 14px; font-family: monospace; margin-top: 5px; text-align: center; }
              @media print {
                body { margin: 0; padding: 20px; }
              }
            </style>
          </head>
          <body>
            <img src="${qrDataUrl}" alt="${label}" />
            <div class="label">${label}</div>
            <div class="code">${code}</div>
            <script>window.print(); window.onafterprint = () => window.close();</script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  if (!qrDataUrl) return <div className="text-gray-500">Loading QR...</div>;

  return (
    <div className="flex flex-col items-center gap-2">
      <img src={qrDataUrl} alt={`QR code for ${label}`} className="h-32 w-32" />
      <button
        onClick={handlePrint}
        className="flex items-center gap-1 rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700"
      >
        <Printer className="h-4 w-4" />
        Print Label
      </button>
    </div>
  );
}
