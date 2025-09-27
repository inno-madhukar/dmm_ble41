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
  let y = height - 10;

  let embeddedImage: any;
  const chunkSize = 30;
  const companyChunkSize = 50;

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
      y: height - 85,
      width: 100,
      height: 70,
    });


    // 🏢 Company Info
     page.drawText("Company : ", {
      x: width - 260,
      y: y-10,
      size: 8,
      font: boldFont,
      color: rgb(0, 0, 0),
    });
    // profile1.company=profile1.company.length
    const chunks = [];
    for (let i = 0; i < profile1.company.length; i += companyChunkSize) {
  chunks.push(profile1.company.slice(i, i + companyChunkSize));
}

    chunks.forEach((chunk, index) => {
       y-=10;
      page.drawText(chunk, {
        x: width - 210,
        y: y,
        size: 8,
        color: rgb(0, 0, 0),
      });
     
    }); 
    // 📧 Contact Info
    page.drawText(`Email :`, {
      x: width - 260,
      y: y -= 15,
      size: 8,
      font:boldFont,
    });
     page.drawText(`${profile1.email}`, {
      x: width - 225,
      y: y,
      size: 8,
      font,
    });
    page.drawText(`Ph No :`, {
      x: width - 260,
      y: y -=15,
      size: 8,
      font: boldFont,
    });
     page.drawText(`${profile1.phone}`, {
      x: width - 225,
      y: y,
      size: 8,
      font,
    });
    
     page.drawText(
      "Address :",
      {
        x: width-260,
        y: y -=15,
        size: 8,
        font:boldFont,
        color: rgb(0.1, 0.1, 0.1),
        lineHeight: 12,
      }
    );

      console.log(profile1.address)
      profile1.address =profile1.address.replace(/\n/g, ' ');
      let formattedAddress = profile1.address.replace(/(.{50})/g, '$1\n');

     page.drawText(
      formattedAddress,
      {
        x: width-220,
        y: y,
        size: 8,
        font,
        color: rgb(0.1, 0.1, 0.1),
        lineHeight: 12,
      }
    );

  }

  if (await RNFS.exists(profileFilePath1)) {
    await createHeader();
  }

  y -= 40;
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
  if (ClientName.trim().length > 0) {
    if (ClientName.length > 30) {
      for (let i = 0; i < ClientName.length; i += chunkSize) {
        const chunk = ClientName.slice(i, i + chunkSize);
        page.drawText(chunk, {
          x: 220,
          y,
          font,
          size: 11,
          color: rgb(0, 0, 0),
        });
        y -= 10;
      }
    }
    else {
      page.drawText(ClientName, {
        x: 220,
        y,
        font,
        size: 11,
        color: rgb(0, 0, 0),
      });
    }

    y -= 20 //we can also utilize this way
  }
  else {
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
  if (Location.trim().length > 0) {
    if (Location.length > 30) {
      for (let i = 0; i < Location.length; i += chunkSize) {
        const chunk = Location.slice(i, i + chunkSize);
        page.drawText(chunk, {
          x: 220,
          y,
          font,
          size: 11,
          color: rgb(0, 0, 0),
        });
        y -= 10;
      }
    }
    else {
      page.drawText(Location, {
        x: 220,
        y,
        font,
        size: 11,
        color: rgb(0, 0, 0),
      });
    }

    y -= 20 //we can also utilize this way
  }
  else {
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
  if (TruckNumber.trim().length > 0) {
    page.drawText(TruckNumber, {
      x: 220,
      y,
      font,
      size: 11,
      color: rgb(0, 0, 0),
    });
    y -= 25 //we can also utilize this way
  }
  else {
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
  if (VendorId.trim().length > 0) {
    page.drawText(VendorId, {
      x: 220,
      y,
      font,
      size: 11,
      color: rgb(0, 0, 0),
    });
    y -= 25 //we can also utilize this way
  }
  else {
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
  if (TotalWeight.trim().length > 0) {
    page.drawText(TotalWeight, {
      x: 220,
      y,
      font,
      size: 11,
      color: rgb(0, 0, 0),
    });
    y -= 25 //we can also utilize this way
  }
  else {
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
  if (Remarks.trim().length > 0) {
  if (Remarks.length > 30) {
      for (let i = 0; i < Remarks.length; i += chunkSize) {
        const chunk = Remarks.slice(i, i + chunkSize);
        page.drawText(chunk, {
          x: 220,
          y,
          font,
          size: 11,
          color: rgb(0, 0, 0),
        });
        y -= 10;
      }
    }
    else {
      page.drawText(Remarks, {
        x: 220,
        y,
        font,
        size: 11,
        color: rgb(0, 0, 0),
      });
    }

    y -= 20 //we can also utilize this way
  }
  else {
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
