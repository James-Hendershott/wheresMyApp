// WHY: Generate PWA icons for mobile app installation
// WHAT: Creates PNG icons in various sizes required by different devices
// HOW: Uses canvas to draw simple placeholder icons with the app branding
// GOTCHA: Requires node-canvas package - install with: npm install canvas

import { createCanvas } from "canvas";
import fs from "fs";
import path from "path";

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const publicDir = path.join(process.cwd(), "public");

function generateIcon(size: number, isMaskable = false) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext("2d");

  // Background
  ctx.fillStyle = "#2563eb"; // Blue theme color
  ctx.fillRect(0, 0, size, size);

  // If maskable, add safe zone padding (20% on each side)
  const padding = isMaskable ? size * 0.2 : 0;
  const iconSize = size - padding * 2;
  const centerX = size / 2;
  const centerY = size / 2;

  // Draw package icon (simplified)
  ctx.fillStyle = "#ffffff";
  const boxSize = iconSize * 0.6;
  const boxX = centerX - boxSize / 2;
  const boxY = centerY - boxSize / 2;

  // Box body
  ctx.fillRect(boxX, boxY, boxSize, boxSize);

  // Box flap (top)
  ctx.fillStyle = "#dbeafe";
  ctx.beginPath();
  ctx.moveTo(boxX, boxY);
  ctx.lineTo(centerX, boxY - boxSize * 0.2);
  ctx.lineTo(boxX + boxSize, boxY);
  ctx.closePath();
  ctx.fill();

  // Box tape (vertical line)
  ctx.fillStyle = "#93c5fd";
  ctx.fillRect(centerX - boxSize * 0.05, boxY, boxSize * 0.1, boxSize);

  // Text
  const fontSize = isMaskable ? size * 0.12 : size * 0.15;
  ctx.fillStyle = "#ffffff";
  ctx.font = `bold ${fontSize}px Arial`;
  ctx.textAlign = "center";
  ctx.textBaseline = "bottom";
  ctx.fillText("Where's My?", centerX, size - (isMaskable ? padding : size * 0.05));

  // Save to file
  const filename = isMaskable ? `icon-maskable-${size}.png` : `icon-${size}.png`;
  const buffer = canvas.toBuffer("image/png");
  fs.writeFileSync(path.join(publicDir, filename), buffer);
  console.log(`✅ Generated ${filename}`);
}

// Generate all sizes
console.log("Generating PWA icons...");
sizes.forEach((size) => {
  generateIcon(size, false);
});

// Generate maskable variants for 192 and 512
[192, 512].forEach((size) => {
  generateIcon(size, true);
});

console.log("\n✨ All icons generated successfully!");
console.log("📝 Note: These are placeholder icons. Replace with professionally designed icons for production.");
