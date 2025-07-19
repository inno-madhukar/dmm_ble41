declare module 'react-native-pdf-lib' {
  export interface PDFOptions {
    html?: string;
    fileName?: string;
    directory?: string;
    base64?: boolean;
    width?: number;
    height?: number;
    padding?: number;
  }

  export interface PDFResult {
    filePath?: string;
    base64?: string;
  }

  export class PDFDocument {
    static create(filePath: string): PDFDocument;
    addPage(): PDFPage;
    write(): Promise<void>;
  }

  export class PDFPage {
    addText(text: string, x: number, y: number, options?: any): void;
  }

  export default class PDFLib {
    static convert(options: PDFOptions): Promise<PDFResult>;
    
  }
}