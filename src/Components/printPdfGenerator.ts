// utils/pdfGenerator.ts
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { Platform } from 'react-native';
let RNFS: typeof import('react-native-fs') | undefined;
let RNPrint: typeof import('react-native-print') | undefined;
import { Buffer } from 'buffer';
import { useState } from 'react';

global.Buffer = Buffer;

type BLERecord = {
  Date: string;
  DeviceID: string;
  Temp: string;
  Moisture: string;
  Weight: string;
  CommodityName: string;
  Note: string;
};
type BLERecordArray = BLERecord[];

const Recobj = {
  Date: "Date",
  Device_ID: "Device ID",
  Temp: "Temp °C",
  Moisture: "Moisture %",
  Weight: "Weight (gm)",
  Commodity_Name: "Commodity Name",
  Note: "Note"
};
export default async function generateSimplePrintAndPDF(records: BLERecordArray, Dtype: string) {
  if (Platform.OS !== 'android' && Platform.OS !== 'ios') {
    throw new Error('PDF generation is only supported on Android/iOS.');
  }
  RNFS = require('react-native-fs');
  RNPrint = require('react-native-print');

  let profile1 = {
    image: '',
    company: '',
    email: '',
    phone: '',
    address: '',
  };
  if (!RNFS) throw new Error('File system not available.');
  const profileFilePath1 = `${RNFS.DocumentDirectoryPath}/profile.json`;
  const fileexists = await RNFS.exists(profileFilePath1);
  if (await RNFS.exists(profileFilePath1)) {
    const data = await RNFS.readFile(profileFilePath1, 'utf8');
    profile1 = JSON.parse(data);
  }
  console.log(profile1);

  const getImageBase64 = async (uri: string): Promise<string> => {
    if (!RNFS) throw new Error('File system not available.');
    const path = uri.replace('file://', '');
    return await RNFS.readFile(path, 'base64');
  };



  const pdfDoc = await PDFDocument.create();
  let page = pdfDoc.addPage([595, 842]); // A4 size
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const { width, height } = page.getSize();
  let embeddedImage: any;

  if (RNFS && await RNFS.exists(profileFilePath1)) {
    const base64 = await getImageBase64(profile1.image);
    if (base64.startsWith('/9j/')) {
      embeddedImage = await pdfDoc.embedJpg(base64);
    } else if (base64.startsWith('iVBORw0KGgo')) {
      embeddedImage = await pdfDoc.embedPng(base64);
    } else {
      throw new Error('Unsupported image format (not JPG or PNG)');
    }
  }


  function createHeader(y: number) {
    
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

    y -= 60;
    page.drawLine({ start: { x: 40, y }, end: { x: width - 40, y }, thickness: 1 });


    page.drawText(
      'Measured in Digital Moisture Meter by Innovative Instruments, Vadodara, Gujarat, India.',
      {
        x: 50,
        y: 30,
        font,
        size: 8,
        color: rgb(0.3, 0.3, 0.3),
      }
    );
    page.drawText('Visit Us: www.innovative-instruments.in', {
      x: 50,
      y: 17,
      font,
      size: 8,
      color: rgb(0.3, 0.3, 0.3),
    });
  }

  const fontSize = 9;
  let Ly = height - 90;
  let Lx = 40;
  let Dx = Lx + 50
  let Dy = Ly - 40
  const bttomY = 40
  console.log(Ly)


  async function createLay(x: number, y: number) {
    page.drawLine({ start: { x: x, y }, end: { x: width - 40, y }, thickness: 0.5 }); //first
    page.drawLine({ start: { x: x, y: y }, end: { x: x, y: 40 }, thickness: 0.5 });   // left
    page.drawLine({ start: { x: x + 40, y: y }, end: { x: x + 40, y: 40 }, thickness: 0.5 });   // left 2
    page.drawText("Sr. No", {
      x: x + 10,
      y: y - 15,
      size: fontSize,
      font: boldFont,
      color: rgb(0, 0, 0),
    });
    page.drawText("Description", {
      x: x + 250,
      y: y - 15,
      size: fontSize,
      font: boldFont,
      color: rgb(0, 0, 0),
    });

    page.drawLine({ start: { x: width - 40, y: y }, end: { x: width - 40, y: 40 }, thickness: 0.5 }); //right
    y -= 20;
    page.drawLine({ start: { x: x, y }, end: { x: width - 40, y }, thickness: 0.5 });  // below header
    y = 40;
    page.drawLine({ start: { x: x, y }, end: { x: width - 40, y }, thickness: 0.5 });   //last
  }
function insertNewline(str:string, interval = 25) {
  let result = '';
  for (let i = 0; i < str.length; i += interval) {
    result += str.slice(i, i + interval) + '|';
  }
  return result;
}

  async function showData(x: number, y: number) {
    records.forEach(async (record, index) => {


      if (y <= 100) {
        y = Dy
        page = pdfDoc.addPage([595, 842]); // A4 size
        createLay(Lx, Ly)
        if (fileexists) {
          console.log("conditionddd")
          createHeader(height - 20)
        }

      }
      let f = 0
      Object.entries(record).forEach(([key, value]) => {

        if (f == 3) {
          console.log("conditionddd", f)
          f = 0
          x = 90
          y -= 15
        }
        if (key == "Date") {
          value = value.replace("\n", " ")
        }
        if(key=="Remarks"){
          value=insertNewline(value)
        }
        else if (key == "Note") {
          value = value.replaceAll("\n", " ")

        }
        page.drawText(`${key}:`, {
          x: x,
          y,
          size: fontSize,
          font: boldFont,
          color: rgb(0, 0, 0),
        });

        const keyWidth = boldFont.widthOfTextAtSize(`${key}:`, fontSize);
        if (key == "Remarks") {
          const varr = value.split("|");
          console.log(varr)

          if (varr.length > 1) {
            varr.forEach((val) => {
             
              page.drawText(`${val}`, {
                x: x + keyWidth + 5, // slight gap after key
                y,
                size: fontSize,
                font: font,
                color: rgb(0, 0, 0),
              });
               if(val!=""){
              y -= 10
               }
            })
          }
          else {
            page.drawText(`${value}`, {
              x: x + keyWidth + 5, // slight gap after key
              y,
              size: fontSize,
              font: font,
              color: rgb(0, 0, 0),
            });
          }
        }
        else {
          page.drawText(`${value}`, {
            x: x + keyWidth + 5, // slight gap after key
            y,
            size: fontSize,
            font: font,
            color: rgb(0, 0, 0),
          });
        }

        x += 150
        f += 1

      });

      page.drawLine({ start: { x: 40, y: y - 5 }, end: { x: width - 40, y: y - 5 }, thickness: 0.5 });

      page.drawText(`${index + 1}`, {
        x: 50, // slight gap after key
        y: y + 25,
        size: fontSize,
        font: font,
        color: rgb(0, 0, 0),
      });
      x = 90
      y -= 20;
    });

  }

  createLay(Lx, Ly)
  if (RNFS && await RNFS.exists(profileFilePath1)) {
              console.log("conditionddd00000000000000000")
    createHeader(height - 50)
  }
  showData(Dx, Dy)
  // Records (loop
  const pdfBytes = await pdfDoc.save();

  // ✅ Convert to base64
  const base64String = Buffer.from(pdfBytes).toString('base64');
  if (!RNFS) throw new Error('File system not available.');
  let path = `${RNFS.DocumentDirectoryPath}/Temp_Print_Table.pdf`;  // ✅ Save to file

  if (Dtype !== "print") {
    const fName = Dtype.replace(/\.csv$/i, "");
    let path1 = `${RNFS.DocumentDirectoryPath}/${fName}.pdf`;
    await RNFS.writeFile(path1, base64String, 'base64');
    return path1
  }
  await RNFS.writeFile(path, base64String, 'base64');
  return path;
}
