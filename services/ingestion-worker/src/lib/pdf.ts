// Polyfill DOMMatrix for pdfjs-dist in Node.js (normally provided by @napi-rs/canvas).
// Only basic 2D operations are needed since we only use getTextContent().
if (typeof globalThis.DOMMatrix === "undefined") {
  class DOMMatrixPolyfill {
    a: number;
    b: number;
    c: number;
    d: number;
    e: number;
    f: number;
    is2D = true;

    constructor(init?: string | ArrayLike<number>) {
      if (init && typeof init !== "string" && init.length) {
        if (init.length === 6) {
          this.a = init[0]!;
          this.b = init[1]!;
          this.c = init[2]!;
          this.d = init[3]!;
          this.e = init[4]!;
          this.f = init[5]!;
        } else if (init.length === 16) {
          this.a = init[0]!;
          this.b = init[1]!;
          this.c = init[4]!;
          this.d = init[5]!;
          this.e = init[12]!;
          this.f = init[13]!;
        } else {
          this.a = 1;
          this.b = 0;
          this.c = 0;
          this.d = 1;
          this.e = 0;
          this.f = 0;
        }
      } else {
        this.a = 1;
        this.b = 0;
        this.c = 0;
        this.d = 1;
        this.e = 0;
        this.f = 0;
      }
    }

    get m11() {
      return this.a;
    }
    set m11(v) {
      this.a = v;
    }
    get m12() {
      return this.b;
    }
    set m12(v) {
      this.b = v;
    }
    get m21() {
      return this.c;
    }
    set m21(v) {
      this.c = v;
    }
    get m22() {
      return this.d;
    }
    set m22(v) {
      this.d = v;
    }
    get m41() {
      return this.e;
    }
    set m41(v) {
      this.e = v;
    }
    get m42() {
      return this.f;
    }
    set m42(v) {
      this.f = v;
    }
    get m13() {
      return 0;
    }
    get m14() {
      return 0;
    }
    get m23() {
      return 0;
    }
    get m24() {
      return 0;
    }
    get m31() {
      return 0;
    }
    get m32() {
      return 0;
    }
    get m33() {
      return 1;
    }
    get m34() {
      return 0;
    }
    get m43() {
      return 0;
    }
    get m44() {
      return 1;
    }
    get isIdentity() {
      return (
        this.a === 1 &&
        this.b === 0 &&
        this.c === 0 &&
        this.d === 1 &&
        this.e === 0 &&
        this.f === 0
      );
    }

    multiply(other: DOMMatrixPolyfill) {
      return new DOMMatrixPolyfill([
        this.a * other.a + this.c * other.b,
        this.b * other.a + this.d * other.b,
        this.a * other.c + this.c * other.d,
        this.b * other.c + this.d * other.d,
        this.a * other.e + this.c * other.f + this.e,
        this.b * other.e + this.d * other.f + this.f,
      ]);
    }

    translate(tx: number, ty: number) {
      return this.multiply(new DOMMatrixPolyfill([1, 0, 0, 1, tx, ty]));
    }

    scale(sx: number, sy?: number) {
      return this.multiply(new DOMMatrixPolyfill([sx, 0, 0, sy ?? sx, 0, 0]));
    }

    inverse() {
      const det = this.a * this.d - this.b * this.c;
      if (det === 0) return new DOMMatrixPolyfill([0, 0, 0, 0, 0, 0]);
      return new DOMMatrixPolyfill([
        this.d / det,
        -this.b / det,
        -this.c / det,
        this.a / det,
        (this.c * this.f - this.d * this.e) / det,
        (this.b * this.e - this.a * this.f) / det,
      ]);
    }

    transformPoint(point?: { x?: number; y?: number }) {
      const x = point?.x ?? 0;
      const y = point?.y ?? 0;
      return {
        x: this.a * x + this.c * y + this.e,
        y: this.b * x + this.d * y + this.f,
        z: 0,
        w: 1,
      };
    }

    toFloat64Array() {
      return new Float64Array([
        this.a,
        this.b,
        0,
        0,
        this.c,
        this.d,
        0,
        0,
        0,
        0,
        1,
        0,
        this.e,
        this.f,
        0,
        1,
      ]);
    }

    static fromMatrix(other: any) {
      return new DOMMatrixPolyfill([
        other.a ?? other.m11 ?? 1,
        other.b ?? other.m12 ?? 0,
        other.c ?? other.m21 ?? 0,
        other.d ?? other.m22 ?? 1,
        other.e ?? other.m41 ?? 0,
        other.f ?? other.m42 ?? 0,
      ]);
    }

    static fromFloat64Array(arr: Float64Array) {
      return new DOMMatrixPolyfill(arr as any);
    }

    static fromFloat32Array(arr: Float32Array) {
      return new DOMMatrixPolyfill(arr as any);
    }
  }

  (globalThis as any).DOMMatrix = DOMMatrixPolyfill;
}

interface TextItem {
  str: string;
  transform: number[];
  width: number;
  height: number;
}

/**
 * Extract text from a PDF buffer, preserving tabular layout.
 *
 * pdfjs gives us individual text items with x/y coordinates. We sort them
 * into rows (by Y position) and columns (by X position), inserting tab
 * characters between columns so the AI can correctly associate values
 * with their column headers in table-based documents like lab trend reports.
 */
export async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  const { getDocument } = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const doc = await getDocument({ data: new Uint8Array(buffer) }).promise;

  let text = "";
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    const items = content.items as TextItem[];

    if (items.length === 0) {
      text += "\n";
      continue;
    }

    // Group items into rows by Y coordinate (transform[5]).
    // Items within a small vertical threshold are on the same row.
    const ROW_THRESHOLD = 3; // points
    const rows: { y: number; items: { x: number; str: string }[] }[] = [];

    for (const item of items) {
      if (!item.str.trim() && !item.str.includes(" ")) continue;
      const x = item.transform[4]!;
      const y = item.transform[5]!;

      let row = rows.find((r) => Math.abs(r.y - y) < ROW_THRESHOLD);
      if (!row) {
        row = { y, items: [] };
        rows.push(row);
      }
      row.items.push({ x, str: item.str });
    }

    // Sort rows top-to-bottom (higher Y = higher on page in PDF coords)
    rows.sort((a, b) => b.y - a.y);

    for (const row of rows) {
      // Sort items left-to-right within each row
      row.items.sort((a, b) => a.x - b.x);

      // Insert tab separators when there's a significant horizontal gap
      let line = "";
      let prevEnd = -Infinity;
      for (const item of row.items) {
        const gap = item.x - prevEnd;
        if (prevEnd > -Infinity && gap > 15) {
          line += "\t";
        } else if (prevEnd > -Infinity && gap > 2) {
          line += " ";
        }
        line += item.str;
        // Estimate end position: x + approximate character width
        prevEnd = item.x + item.str.length * 5;
      }
      text += line + "\n";
    }

    text += "\n";
  }

  doc.destroy();
  return text;
}
