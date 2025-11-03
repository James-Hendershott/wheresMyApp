// WHY: QR code scanner page using device camera
// WHAT: Client component that accesses camera and decodes QR codes
// HOW: Uses @zxing/browser to scan, redirects to /c/[code] on success

"use client";
import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { useRouter } from "next/navigation";

export default function ScanPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const codeReader = new BrowserMultiFormatReader();
    let activeStream: MediaStream | null = null;

    const startScanning = async () => {
      try {
        setScanning(true);
        setError(null);
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });
        activeStream = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        codeReader.decodeFromVideoDevice(
          undefined,
          videoRef.current!,
          (result, error) => {
            if (result) {
              // WHY: Stop scanning and redirect to container
              if (activeStream) {
                activeStream.getTracks().forEach((track) => track.stop());
              }
              router.push(`/c/${result.getText()}`);
            }
            if (error && error.name !== "NotFoundException") {
              console.error(error);
            }
          }
        );
      } catch (err) {
        console.error(err);
        setError("Camera access denied or unavailable. Please allow camera access.");
        setScanning(false);
      }
    };

    startScanning();

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [router]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-900 p-4">
      <div className="w-full max-w-md">
        <h1 className="mb-4 text-center text-2xl font-bold text-white">Scan QR Code</h1>
        {error && (
          <div className="mb-4 rounded bg-red-600 p-3 text-white">{error}</div>
        )}
        <div className="relative overflow-hidden rounded-lg bg-black">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="h-auto w-full"
            style={{ aspectRatio: "1" }}
          />
          {scanning && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-48 w-48 rounded-lg border-4 border-blue-500"></div>
            </div>
          )}
        </div>
        <p className="mt-4 text-center text-sm text-gray-400">
          Position the QR code within the frame. Scanning will happen automatically.
        </p>
      </div>
    </main>
  );
}
