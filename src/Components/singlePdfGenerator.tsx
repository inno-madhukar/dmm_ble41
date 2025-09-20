// utils/detailedPdfGenerator.ts
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import RNFS from 'react-native-fs';
import RNPrint from 'react-native-print';
import { Buffer } from 'buffer';
import { Platform, Image as RNImage } from 'react-native';

global.Buffer = Buffer;

export async function generateStyledPDF({
  DeviceID,
  commodityName,
  moisture,
  temperature,
  time,
  sampleQty,
  note,
  ClientName,
  Location,
  TruckNumber,
  VendorId,
  TotalWeight,
  Remarks,

}: {

  DeviceID: string;
  commodityName: string;
  moisture: string;
  temperature: string;
  time: string;
  sampleQty: string;
  note: string;
  ClientName: string;
  Location: string;
  TruckNumber: string;
  VendorId: string;
  TotalWeight: string;
  Remarks: string;

}) {



  let profile1 = {
    image: '',
    company: '',
    email: '',
    phone: '',
    address: '',
  };
  const profileFilePath1 = `${RNFS.DocumentDirectoryPath}/profile.json`;

  if (await RNFS.exists(profileFilePath1)) {
    const data = await RNFS.readFile(profileFilePath1, 'utf8');
    profile1 = JSON.parse(data);
  }

  console.log(profile1);

  const getImageBase64 = async (uri: string): Promise<string> => {
    const path = uri.replace('file://', '');
    return await RNFS.readFile(path, 'base64');
  };


  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]); // A4 size

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const { width, height } = page.getSize();
  let y = height - 40;

  let embeddedImage: any;

  async function createHeader() {

    const base64 = await getImageBase64(profile1.image);
    if (base64.startsWith('/9j/')) {
      embeddedImage = await pdfDoc.embedJpg(base64);
    } else if (base64.startsWith('iVBORw0KGgo')) {
      embeddedImage = await pdfDoc.embedPng(base64);
    } else {
      throw new Error('Unsupported image format (not JPG or PNG)');
    }

    page.drawImage(embeddedImage, {
      x: 40,
      y: height - 75,
      width: 80,
      height: 60,
    });


    // 🏢 Company Info
    page.drawText(profile1.company, {
      x: 150,
      y: y - 10,
      size: 16,
      font: boldFont,
      color: rgb(0, 0, 0),
    });
    page.drawText(
      profile1.address,
      {
        x: 150,
        y: y - 30,
        size: 10,
        font,
        color: rgb(0.1, 0.1, 0.1),
        lineHeight: 12,
      }
    );

    // 📧 Contact Info
    page.drawText(`Email: ${profile1.email}`, {
      x: width - 230,
      y: y - 10,
      size: 8,
      font,
    });
    page.drawText(`Ph No: ${profile1.phone}`, {
      x: width - 230,
      y: y - 25,
      size: 8,
      font,
    });

  }

  if (await RNFS.exists(profileFilePath1)) {
    await createHeader();
  }

  y -= 60;
  page.drawLine({ start: { x: 40, y }, end: { x: width - 40, y }, thickness: 1 });

  y -= 50;
  // 🧾 Info Block
  const info = [

    ['Device ID', DeviceID],
    ['Commodity Name', commodityName],
    ['Moisture', `${moisture} %`],
    ['Sample Temperature', `${temperature} °C`],
    ['Time', time],
    ['Sample Quantity Required ', sampleQty],
  ];

  info.forEach(([label, value]) => {
    page.drawText(`${label} :`, {
      x: 60,
      y,
      font: boldFont,
      size: 11,
      color: rgb(0, 0, 0),
    });
    page.drawText(value, {
      x: 220,
      y,
      font,
      size: 11,
      color: rgb(0, 0, 0),
    });
    y -= 25;
  });

  y -= 30;
  page.drawText('Other Information:', {
    x: 50,
    y,
    font: boldFont,
    size: 14,
    color: rgb(0, 0, 0),
  });
  y -= 25;
   page.drawText("Client Name :", {
      x: 60,
      y,
       font: boldFont,
      size: 11,
      color: rgb(0, 0, 0),
    });
    if(ClientName.trim().length>0){
   page.drawText(ClientName, {
      x: 220,
      y,
      font,
      size: 11,
      color: rgb(0, 0, 0),
    });
    y -= 25 //we can also utilize this way
    }
    else{
         page.drawText(" - ", {
      x: 220,
      y,
      font,
      size: 11,
      color: rgb(0, 0, 0),
    });
    y -= 25 //we can also utilize this way

    }
 
     page.drawText("Location :", {
      x: 60,
      y,
       font: boldFont,
      size: 11,
      color: rgb(0, 0, 0),
    });
     if(Location.trim().length>0){
   page.drawText(Location, {
      x: 220,
      y,
      font,
      size: 11,
      color: rgb(0, 0, 0),
    });
    y -= 25 //we can also utilize this way
    }
    else{
         page.drawText(" - ", {
      x: 220,
      y,
      font,
      size: 11,
      color: rgb(0, 0, 0),
    });
    y -= 25 //we can also utilize this way

    }
     page.drawText("Truck Number :", {
      x: 60,
      y,
       font: boldFont,
      size: 11,
      color: rgb(0, 0, 0),
    });
    if(TruckNumber.trim().length>0){
   page.drawText(TruckNumber, {
      x: 220,
      y,
      font,
      size: 11,
      color: rgb(0, 0, 0),
    });
    y -= 25 //we can also utilize this way
    }
    else{
         page.drawText(" - ", {
      x: 220,
      y,
      font,
      size: 11,
      color: rgb(0, 0, 0),
    });
    y -= 25 //we can also utilize this way

    }
     page.drawText("Vendor ID :", {
      x: 60,
      y,
       font: boldFont,
      size: 11,
      color: rgb(0, 0, 0),
    });
    if(VendorId.trim().length>0){
   page.drawText(VendorId, {
      x: 220,
      y,
      font,
      size: 11,
      color: rgb(0, 0, 0),
    });
    y -= 25 //we can also utilize this way
    }
    else{
         page.drawText(" - ", {
      x: 220,
      y,
      font,
      size: 11,
      color: rgb(0, 0, 0),
    });
    y -= 25 //we can also utilize this way

    }
     page.drawText("Total Weight :", {
      x: 60,
      y,
      font: boldFont,
      size: 11,
      color: rgb(0, 0, 0),
    });
   if(TotalWeight.trim().length>0){
   page.drawText(TotalWeight, {
      x: 220,
      y,
      font,
      size: 11,
      color: rgb(0, 0, 0),
    });
    y -= 25 //we can also utilize this way
    }
    else{
         page.drawText(" - ", {
      x: 220,
      y,
      font,
      size: 11,
      color: rgb(0, 0, 0),
    });
    y -= 25 //we can also utilize this way

    }
     page.drawText("Remarks :", {
      x: 60,
      y,
      font: boldFont,
      size: 11,
      color: rgb(0, 0, 0),
    });
     if(Remarks.trim().length>0){
   page.drawText(Remarks, {
      x: 220,
      y,
      font,
      size: 11,
      color: rgb(0, 0, 0),
    });
    y -= 25 //we can also utilize this way
    }
    else{
         page.drawText(" - ", {
      x: 220,
      y,
      font,
      size: 11,
      color: rgb(0, 0, 0),
    });
    y -= 25 //we can also utilize this way

    }
  y -= 50;
  page.drawLine({ start: { x: 40, y }, end: { x: width - 40, y }, thickness: 0.5 });
  // 🦶 Footer
  page.drawLine({
    start: { x: 40, y: 50 },
    end: { x: width - 40, y: 50 },
    thickness: 0.5,
  });

  page.drawText(
    'Measured in Digital Moisture Meter by Innovative Instruments, Vadodara, Gujarat, India.',
    {
      x: 50,
      y: 35,
      font,
      size: 8,
      color: rgb(0.3, 0.3, 0.3),
    }
  );
  page.drawText('Visit Us: www.innovative-instruments.in', {
    x: 50,
    y: 22,
    font,
    size: 8,
    color: rgb(0.3, 0.3, 0.3),
  });

  // 📝 Save to Temporary Path
  const pdfBytes = await pdfDoc.save();
  const base64String = Buffer.from(pdfBytes).toString('base64');

  const fileName = 'Temp_record_report.pdf';
  const path =
    Platform.OS === 'android'
      ? `${RNFS.CachesDirectoryPath}/${fileName}`
      : `${RNFS.TemporaryDirectoryPath}${fileName}`;

  await RNFS.writeFile(path, base64String, 'base64');

  if (note != "share") {
    try {
      await RNPrint.print({ filePath: path });
    } catch (err) {
      console.warn('Printing was cancelled or failed:', err);
    } finally {
      // ✅ Delete temp file
      RNFS.unlink(path)
        .then(() => console.log('Temporary PDF deleted.'))
        .catch(err => console.warn('Failed to delete temp PDF:', err));
    }
  }


  return path;
}
