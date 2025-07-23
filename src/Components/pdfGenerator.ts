// utils/pdfGenerator.ts
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import RNFS from 'react-native-fs';
import { Buffer } from 'buffer';
import RNPrint from 'react-native-print';

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
  Commodity_Name:"Commodity Name",
  Note:"Note"
};
export default async function generateSimplePDF(records:BLERecordArray) {
  console.log(records[1])

  const pdfDoc = await PDFDocument.create();
  let page = pdfDoc.addPage([595, 842]); // A4 size

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const { width, height } = page.getSize();

  
  function createHeader(y:number){
    
  page.drawRectangle({
    x: 50,
    y: y - 40,
    width: 80,
    height: 40,
    color: rgb(0.9, 0.4, 0.2),
  });
  page.drawText('LOGO', {
    x: 60,
    y: y - 20,
    size: 12,
    font: boldFont,
    color: rgb(1, 1, 1),
  });

  // 🏢 Company Info
  page.drawText('Innovative Instruments', {
    x: 150,
    y: y - 10,
    size: 16,
    font: boldFont,
    color: rgb(0, 0, 0),
  });
  page.drawText(
    'No. 123, Mahigan Society, Behind Convent,\nSubhanpura, Vadodara, Gujarat - 390002, India.',
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
  page.drawText('Email: info@innovative-instruments.in', {
    x: width - 230,
    y: y - 10,
    size: 8,
    font,
  });
  page.drawText('Ph No: 9328615024', {
    x: width - 230,
    y: y - 25,
    size: 8,
    font,
  });

  y -= 60;
  page.drawLine({ start: { x: 40, y }, end: { x: width - 40, y }, thickness: 1 });

  }

  const fontSize = 9;
  let Ly = height - 90;
  let Lx = 40;
  let Dx=Lx+50
  let Dy=Ly-40
  const bttomY=40
  console.log(Ly)

  
  async function createLay(x:number,y:number) {
     page.drawLine({ start: { x: x, y }, end: { x: width - 40, y }, thickness: 0.5 }); //first
     page.drawLine({ start: { x: x, y:y}, end: { x: x, y:40  }, thickness: 0.5 });   // left
     page.drawLine({ start: { x: x+40, y:y}, end: { x: x+40, y:40  }, thickness: 0.5 });   // left 2
      page.drawText("Sr. No", {
      x: x+10,
      y:y-15,
      size: fontSize,
      font:boldFont,
      color: rgb(0, 0, 0),
    });
     page.drawText("Description", {
      x: x+250,
      y:y-15,
      size: fontSize,
      font:boldFont,
      color: rgb(0, 0, 0),
    });

     page.drawLine({ start: { x: width-40, y:y}, end: { x: width-40, y:40  }, thickness: 0.5 }); //right
      y-=20;
     page.drawLine({ start: { x: x, y }, end: { x: width - 40, y }, thickness: 0.5 });  // below header
     y=40;
     page.drawLine({ start: { x: x, y }, end: { x: width - 40, y }, thickness: 0.5 });   //last
  }


  async function showData(x:number,y:number){
  records.forEach((record, index) => {
    
   
    if(y<=55){
      y=Dy
      page = pdfDoc.addPage([595, 842]); // A4 size
      createLay(Lx,Ly)
      createHeader(height-20)
    }
    let f=0
      Object.entries(record).forEach(([key, value]) => {
        if(f==3){
          f=0
          x=90
          y-=20
        }
        
      page.drawText(`${key}:`, {
    x: x,
    y,
    size: fontSize,
    font: boldFont,
    color: rgb(0, 0, 0),
  });

  const keyWidth = boldFont.widthOfTextAtSize(`${key}:`, fontSize);

  page.drawText(`${value}`, {
    x: x + keyWidth + 5, // slight gap after key
    y,
    size: fontSize,
    font: font,
    color: rgb(0, 0, 0),
  });

    x+=150
    f+=1

    });

    page.drawLine({ start: { x: 40, y:y-5 }, end: { x: width - 40, y:y-5 }, thickness: 0.5 });

      page.drawText(`${index+1}`, {
    x:  50, // slight gap after key
    y:y+10,
    size: fontSize,
    font: font,
    color: rgb(0, 0, 0),
  });
    x=90
    y -= 20;
  });




  }

  createLay(Lx,Ly)
  createHeader(height-20)
  showData(Dx,Dy)
  // Records (loop
   const pdfBytes = await pdfDoc.save();

  // ✅ Convert to base64
  const base64String = Buffer.from(pdfBytes).toString('base64');


  // ✅ Save to file
  const path = `${RNFS.DownloadDirectoryPath}/demo.pdf`;
await RNFS.writeFile(path, base64String, 'base64');
await RNPrint.print({ filePath: path });
console.log("hi")
  return path;
}
