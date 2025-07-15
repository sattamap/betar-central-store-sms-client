// fontconverter.cjs

const fs = require('fs');
const path = require('path');
const PdfPrinter = require('pdfmake/src/printer'); // Use this for pdfmake

// Resolve the font path relative to this script's folder
const fontPath = path.resolve(__dirname, '../src/fonts/NotoSansBengali.ttf');
console.log('Font path:', fontPath);


// Check if font exists
if (!fs.existsSync(fontPath)) {
  console.error("Font file does NOT exist at this path!");
  process.exit(1);
}

// Define font descriptors for pdfmake
const fontDescriptors = {
  NotoSansBengali: {
    normal: fs.readFileSync(fontPath),
  },
};

// Create printer instance
const printer = new PdfPrinter(fontDescriptors);

// Get the virtual file system object (base64 font data)
const vfs = printer.vfs;

if (!vfs) {
  console.error("VFS not generated! Check font file paths.");
  process.exit(1);
}

// Write the vfs to JSON file
const outputPath = path.resolve(__dirname, 'src/fonts/vfs_fonts.json');
fs.writeFileSync(outputPath, JSON.stringify(vfs, null, 2));

console.log(`vfs_fonts.json created successfully at ${outputPath}`);
