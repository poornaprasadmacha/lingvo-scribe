
// Type definitions for pdf-lib
declare module 'pdf-lib' {
  export interface PDFDocument {
    getPageCount(): number;
    getPage(pageIndex: number): PDFPage;
    addPage(pageSize?: [number, number]): PDFPage;
    save(): Promise<Uint8Array>;
    load(arrayBuffer: ArrayBuffer): Promise<PDFDocument>;
  }

  export interface PDFPage {
    drawText(text: string, options?: {
      x?: number;
      y?: number;
      size?: number;
      color?: Color;
    }): void;
  }

  export class PDFDocument {
    static create(): Promise<PDFDocument>;
    static load(arrayBuffer: ArrayBuffer): Promise<PDFDocument>;
    getPageCount(): number;
    getPage(pageIndex: number): PDFPage;
    addPage(pageSize?: [number, number]): PDFPage;
    save(): Promise<Uint8Array>;
  }

  export type Color = ReturnType<typeof rgb>;
  
  export function rgb(r: number, g: number, b: number): Color;
}

