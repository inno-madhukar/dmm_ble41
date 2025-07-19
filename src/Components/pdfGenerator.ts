// utils/pdfGenerator.ts
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import RNFS from 'react-native-fs';
import { Buffer } from 'buffer';
import RNPrint from 'react-native-print';

global.Buffer = Buffer;

export default async function generateSimplePDF(records: string[]) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]); // A4 size

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const { width, height } = page.getSize();

  const fontSize = 12;
  let y = height - 50;

  // Header
  page.drawText('Record Report', {
    x: 50,
    y,
    size: 18,
    font,
    color: rgb(0.2, 0.2, 0.7),
  });

  y -= 30;

  // Records (loop)
  records.forEach((record, index) => {
    if (y < 40) return; // avoid overflow, or create a new page
    page.drawText(`${index + 1}. ${record}`, {
      x: 50,
      y,
      size: fontSize,
      font,
      color: rgb(0, 0, 0),
    });
    y -= 20;
  });

   const pdfBytes = await pdfDoc.save();

  // ✅ Convert to base64
  const base64String = Buffer.from(pdfBytes).toString('base64');


  // ✅ Save to file
  const path = `${RNFS.DownloadDirectoryPath}/example11.pdf`;
await RNFS.writeFile(path, base64String, 'base64');
await RNPrint.print({ filePath: path });
console.log("hi")
  return path;
}
