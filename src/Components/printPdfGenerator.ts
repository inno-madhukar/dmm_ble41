// utils/pdfGenerator.ts
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { Platform } from 'react-native';
let RNFS: typeof import('react-native-fs') | undefined;
let RNPrint: typeof import('react-native-print') | undefined;
import { Buffer } from 'buffer';
import { useState } from 'react';
import { Image } from 'react-native';
import string1 from "../assets/logob64"
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
export default async function generateSimplePrintAndPDF(records: any[], Dtype: string) {
  if (Platform.OS !== 'android' && Platform.OS !== 'ios') {
    throw new Error('PDF generation is only supported on Android/iOS.');
  }
  RNFS = require('react-native-fs');
  RNPrint = require('react-native-print');
  const chunkSize = 30;
  const companyChunkSize = 50;
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
  const getImageBase64footer = async (): Promise<string> => {
  return string1;
};



  const pdfDoc = await PDFDocument.create();
  let page = pdfDoc.addPage([595, 842]); // A4 size
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const { width, height } = page.getSize();
  let embeddedImage: any;
  const fontSize = 7;
  let Ly = height;
  let Lx = 40;
  let Dx = Lx + 50
  let Dy = Ly
  const bttomY = 40
  let ammbedlogo: any;
  console.log(Ly)
  if (RNFS && await RNFS.exists(profileFilePath1)) {
    const base64 = await getImageBase64(profile1.image);
    const logo= await getImageBase64footer();
    if (base64.startsWith('/9j/')) {
      embeddedImage = await pdfDoc.embedJpg(base64);
    } else if (base64.startsWith('iVBORw0KGgo')) {
      embeddedImage = await pdfDoc.embedPng(base64);
    } else {
      throw new Error('Unsupported image format (not JPG or PNG)');
    }

        if (logo.startsWith('/9j/')) {
      ammbedlogo = await pdfDoc.embedJpg(logo);
    } else if (logo.startsWith('iVBORw0KGgo')) {
      ammbedlogo = await pdfDoc.embedPng(logo);
    } else {
      throw new Error('Unsupported image format (not JPG or PNG)');
    }
  }


  function createHeader(y: number) {

    page.drawImage(embeddedImage, {
      x: 40,
      y: height - 85,
      width: 100,
      height: 60,
    });


    // 🏢 Company Info
    page.drawText("Company : ", {
      x: width - 300,
      y: y - 10,
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
      y -= 10;
      page.drawText(chunk, {
        x: width - 250,
        y: y,
        size: 8,
        color: rgb(0, 0, 0),
      });

    });
    // 📧 Contact Info
    page.drawText(`Email :`, {
      x: width - 300,
      y: y -= 15,
      size: 8,
      font: boldFont,
    });
    page.drawText(`${profile1.email}`, {
      x: width - 265,
      y: y,
      size: 8,
      font,
    });
    page.drawText(`Ph No :`, {
      x: width - 300,
      y: y -= 15,
      size: 8,
      font: boldFont,
    });
    page.drawText(`${profile1.phone}`, {
      x: width - 265,
      y: y,
      size: 8,
      font,
    });

    page.drawText(
      "Address :",
      {
        x: width - 300,
        y: y -= 15,
        size: 8,
        font: boldFont,
        color: rgb(0.1, 0.1, 0.1),
        lineHeight: 12,
      }
    );

    console.log(profile1.address)
    profile1.address = profile1.address.replace(/\n/g, ' ');
    const chunks1 = [];
    for (let i = 0; i < profile1.address.length; i += companyChunkSize) {
      chunks1.push(profile1.address.slice(i, i + companyChunkSize));
    }
    // let formattedAddress = profile1.address.replace(/(.{50})/g, '$1\n');

    chunks1.forEach((chunk, index) => {

      page.drawText(chunk, {
        x: width - 250,
        y: y,
        size: 8,
        color: rgb(0, 0, 0),
      });
      y -= 10;
    });
    Ly = y;
    Dy = y - 35;
    // page.drawLine({ start: { x: 40, y }, end: { x: width - 40, y }, thickness: 1 });
    page.drawImage(ammbedlogo, {
      x: 40,
      y: 15,
      width: 100,
      height: 20,
    });

    page.drawText(
      'Measured in Digital Moisture Meter by Innovative Instruments, Vadodara, Gujarat, India.',
      {
        x: 160,
        y: 25,
        font,
        size: 8,
        color: rgb(0.3, 0.3, 0.3),
      }
    );
    page.drawText('Visit Us: www.innovative-instruments.in', {
      x: 160,
      y: 12,
      font,
      size: 8,
      color: rgb(0.3, 0.3, 0.3),
    });
  }


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
  function insertNewline(str: string, interval = 100) {
    let result = '';
    for (let i = 0; i < str.length; i += interval) {
      result += str.slice(i, i + interval) + '|';
    }
    return result;
  }

  function insertNewline1(str: string, interval = 35) {
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
      const reorderedRecord = {
        "Date": record["Date"],
        "Device ID": record["Device ID"],
        "Moisture %": record["Moisture %"],
        "Temp °C": record["Temp °C"],
        "Weight (gm)": record["Weight (gm)"],
        "Commodity Name": record["Commodity Name"],
        "Truck Number": record["Truck Number"],
        "Total Weight": record["Total Weight"],
        "Vendor ID": record["Vendor ID"],
        "Client Name": record["Client Name"],
        "Location": record["Location"],
        "Remarks": record["Remarks"],
      };
      // console.log("record", record["Device ID"])
      Object.entries(reorderedRecord).forEach(([key, value]) => {

        if (f == 3) {
          console.log("conditionddd", f)
          f = 0
          x = 90
          y -= 10
        }
        if (key == "Vendor ID") {
          value = insertNewline1(value);
        }
        if (key == "Client Name" || key == "Location" || key == "Remarks") {
          value = insertNewline(value);
          x = 90;
        }
        if (key == "Date") {
          value = value.replace("\n", " ")
        }
        // if (key == "Remarks") {
        //   value = insertNewline(value)
        // }
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

        if (key == "Remarks" || key == "Client Name" || key == "Location") {
          const varr = value.split("|");
          console.log(varr)

          if (varr.length > 1) {
            varr.forEach((val: any) => {
              page.drawText(`${val}`, {
                x: x + keyWidth + 5, // slight gap after key
                y,
                size: fontSize,
                font: font,
                color: rgb(0, 0, 0),
              });
              if (val != "") {
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
            y -= 10;
          }
        }
        else if (key == "Vendor ID") {
          const varr = value.split("|");
          if (varr.length > 1) {
            varr.forEach((val: any) => {
              page.drawText(`${val}`, {
                x: x + keyWidth + 5, // slight gap after key
                y,
                size: fontSize,
                font: font,
                color: rgb(0, 0, 0),
              });
              if (val != "") {
                y -= 10
              }
            })
             y += 10;
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

        x += 130
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


  if (RNFS && await RNFS.exists(profileFilePath1)) {
    console.log("conditionddd00000000000000000")
    createHeader(height - 20)
  }
  createLay(Lx, Ly)
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
