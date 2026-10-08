import { dateSq, den } from "./format";

/**
 * One table, three file formats. Pages build an ExportDoc and call
 * exportCsv / exportXlsx / exportPdf. Numbers stay real numbers in CSV and
 * Excel (so they can be summed); the PDF shows them formatted.
 */

export type ExportColumn = { label: string; kind?: "text" | "number" | "money" | "date" };
export type ExportCell = string | number;

export type ExportDoc = {
  fileName: string; // without extension
  title: string;
  meta: string[]; // lines under the title, e.g. "Phone: 044 …"
  columns: ExportColumn[];
  rows: ExportCell[][];
  total: { label: string; value: number }; // value goes in the last column
};

/* ---------- CSV ---------- */

export function exportCsv(doc: ExportDoc) {
  const esc = (v: ExportCell) => {
    const s = String(v);
    return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const cell = (v: ExportCell, c: ExportColumn) => (c.kind === "date" ? dateSq(String(v)) : v);
  const lines = [
    doc.columns.map((c) => esc(headerLabel(c))).join(","),
    ...doc.rows.map((r) => r.map((v, i) => esc(cell(v, doc.columns[i]))).join(",")),
    [doc.total.label, ...Array(doc.columns.length - 2).fill(""), doc.total.value].map(esc).join(","),
  ];
  // BOM so Excel opens UTF-8 (ë, ç) correctly
  download(new Blob(["﻿" + lines.join("\r\n")], { type: "text/csv;charset=utf-8" }), `${safe(doc.fileName)}.csv`);
}

/* ---------- Excel (.xlsx, no dependency) ---------- */

export function exportXlsx(doc: ExportDoc) {
  const n = doc.columns.length;
  const rows: string[] = [];
  let r = 0;
  const row = (cells: string[]) => rows.push(`<row r="${++r}">${cells.join("")}</row>`);

  row([str(0, r + 1, doc.title, S.title)]);
  doc.meta.forEach((m) => row([str(0, r + 1, m, S.muted)]));
  row([]);
  row(doc.columns.map((c, i) => str(i, r + 1, headerLabel(c), S.header)));
  doc.rows.forEach((cells) =>
    row(
      cells.map((v, i) => {
        const kind = doc.columns[i].kind;
        if (kind === "date") return num(i, r + 1, excelDate(String(v)), S.date);
        if (kind === "money") return num(i, r + 1, Number(v), S.money);
        if (kind === "number") return num(i, r + 1, Number(v), S.plain);
        return str(i, r + 1, String(v), S.plain);
      })
    )
  );
  row([str(0, r + 1, doc.total.label, S.bold), num(n - 1, r + 1, doc.total.value, S.boldMoney)]);

  const widths = doc.columns.map((c, i) => {
    const longest = Math.max(headerLabel(c).length, ...doc.rows.map((x) => String(x[i]).length));
    return Math.min(Math.max(longest + 2, c.kind === "date" ? 12 : 8), 45);
  });

  const sheet =
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
    `<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">` +
    `<cols>${widths.map((w, i) => `<col min="${i + 1}" max="${i + 1}" width="${w}" customWidth="1"/>`).join("")}</cols>` +
    `<sheetData>${rows.join("")}</sheetData></worksheet>`;

  const files = {
    "[Content_Types].xml":
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
      `<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">` +
      `<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>` +
      `<Default Extension="xml" ContentType="application/xml"/>` +
      `<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>` +
      `<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>` +
      `<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>` +
      `</Types>`,
    "_rels/.rels":
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
      `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">` +
      `<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>` +
      `</Relationships>`,
    "xl/workbook.xml":
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
      `<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">` +
      `<sheets><sheet name="${xml(sheetName(doc.title))}" sheetId="1" r:id="rId1"/></sheets></workbook>`,
    "xl/_rels/workbook.xml.rels":
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
      `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">` +
      `<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>` +
      `<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>` +
      `</Relationships>`,
    "xl/styles.xml": STYLES,
    "xl/worksheets/sheet1.xml": sheet,
  };

  const enc = new TextEncoder();
  const data = zip(Object.entries(files).map(([name, s]) => ({ name, data: enc.encode(s) })));
  download(
    new Blob([data as BlobPart], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }),
    `${safe(doc.fileName)}.xlsx`
  );
}

// Style ids (cellXfs order in STYLES)
const S = { plain: 0, title: 1, muted: 2, header: 3, date: 4, money: 5, bold: 6, boldMoney: 7 };

const STYLES =
  `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
  `<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">` +
  `<numFmts count="2"><numFmt numFmtId="164" formatCode="dd.mm.yyyy"/><numFmt numFmtId="165" formatCode="#,##0.00"/></numFmts>` +
  `<fonts count="4">` +
  `<font><sz val="11"/><name val="Calibri"/></font>` +
  `<font><b/><sz val="14"/><name val="Calibri"/></font>` +
  `<font><sz val="10"/><color rgb="FF64748B"/><name val="Calibri"/></font>` +
  `<font><b/><sz val="11"/><name val="Calibri"/></font>` +
  `</fonts>` +
  `<fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill>` +
  `<fill><patternFill patternType="solid"><fgColor rgb="FFEEF4FF"/><bgColor indexed="64"/></patternFill></fill></fills>` +
  `<borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>` +
  `<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>` +
  `<cellXfs count="8">` +
  `<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>` +
  `<xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/>` +
  `<xf numFmtId="0" fontId="2" fillId="0" borderId="0" xfId="0" applyFont="1"/>` +
  `<xf numFmtId="0" fontId="3" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1"/>` +
  `<xf numFmtId="164" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/>` +
  `<xf numFmtId="165" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/>` +
  `<xf numFmtId="0" fontId="3" fillId="0" borderId="0" xfId="0" applyFont="1"/>` +
  `<xf numFmtId="165" fontId="3" fillId="0" borderId="0" xfId="0" applyFont="1" applyNumberFormat="1"/>` +
  `</cellXfs>` +
  `<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>` +
  `</styleSheet>`;

const colName = (i: number) => {
  let s = "";
  for (let n = i + 1; n > 0; n = Math.floor((n - 1) / 26)) s = String.fromCharCode(65 + ((n - 1) % 26)) + s;
  return s;
};
const str = (c: number, r: number, v: string, s: number) =>
  `<c r="${colName(c)}${r}" t="inlineStr" s="${s}"><is><t xml:space="preserve">${xml(v)}</t></is></c>`;
const num = (c: number, r: number, v: number, s: number) => `<c r="${colName(c)}${r}" s="${s}"><v>${v}</v></c>`;
const xml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "");
/** YYYY-MM-DD -> Excel serial day */
const excelDate = (iso: string) => {
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  return (Date.UTC(y, m - 1, d) - Date.UTC(1899, 11, 30)) / 86400000;
};
/** Excel sheet names: max 31 chars, no []:*?/\ */
const sheetName = (s: string) => s.replace(/[[\]:*?/\\]/g, " ").slice(0, 31) || "Sheet1";

/** Minimal ZIP writer (stored, no compression) — enough for an .xlsx package. */
function zip(files: { name: string; data: Uint8Array }[]) {
  const enc = new TextEncoder();
  const chunks: Uint8Array[] = [];
  const central: Uint8Array[] = [];
  let offset = 0;

  for (const f of files) {
    const name = enc.encode(f.name);
    const crc = crc32(f.data);
    const local = new DataView(new ArrayBuffer(30));
    local.setUint32(0, 0x04034b50, true);
    local.setUint16(4, 20, true);
    local.setUint16(6, 0x0800, true); // UTF-8 names
    local.setUint16(8, 0, true); // stored
    local.setUint16(10, 0, true);
    local.setUint16(12, 0x21, true); // 1980-01-01
    local.setUint32(14, crc, true);
    local.setUint32(18, f.data.length, true);
    local.setUint32(22, f.data.length, true);
    local.setUint16(26, name.length, true);
    local.setUint16(28, 0, true);
    chunks.push(new Uint8Array(local.buffer), name, f.data);

    const cd = new DataView(new ArrayBuffer(46));
    cd.setUint32(0, 0x02014b50, true);
    cd.setUint16(4, 20, true);
    cd.setUint16(6, 20, true);
    cd.setUint16(8, 0x0800, true);
    cd.setUint16(10, 0, true);
    cd.setUint16(12, 0, true);
    cd.setUint16(14, 0x21, true);
    cd.setUint32(16, crc, true);
    cd.setUint32(20, f.data.length, true);
    cd.setUint32(24, f.data.length, true);
    cd.setUint16(28, name.length, true);
    cd.setUint32(42, offset, true);
    central.push(new Uint8Array(cd.buffer), name);

    offset += 30 + name.length + f.data.length;
  }

  const cdSize = central.reduce((s, c) => s + c.length, 0);
  const end = new DataView(new ArrayBuffer(22));
  end.setUint32(0, 0x06054b50, true);
  end.setUint16(8, files.length, true);
  end.setUint16(10, files.length, true);
  end.setUint32(12, cdSize, true);
  end.setUint32(16, offset, true);

  const parts = [...chunks, ...central, new Uint8Array(end.buffer)];
  const out = new Uint8Array(parts.reduce((s, p) => s + p.length, 0));
  let pos = 0;
  for (const p of parts) {
    out.set(p, pos);
    pos += p.length;
  }
  return out;
}

let CRC_TABLE: Uint32Array | null = null;
function crc32(data: Uint8Array) {
  if (!CRC_TABLE) {
    CRC_TABLE = new Uint32Array(256);
    for (let i = 0; i < 256; i++) {
      let c = i;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      CRC_TABLE[i] = c >>> 0;
    }
  }
  let crc = 0xffffffff;
  for (let i = 0; i < data.length; i++) crc = CRC_TABLE[(crc ^ data[i]) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

/* ---------- PDF (jsPDF, loaded only when used) ---------- */

export async function exportPdf(doc: ExportDoc) {
  const [{ jsPDF }, { autoTable }] = await Promise.all([import("jspdf"), import("jspdf-autotable")]);
  const pdf = new jsPDF({ unit: "pt", format: "a4" });
  const left = 40;

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(18);
  pdf.text(doc.title, left, 50);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10);
  pdf.setTextColor(100, 116, 139);
  doc.meta.forEach((m, i) => pdf.text(m, left, 70 + i * 14));

  const isNum = (c: ExportColumn) => c.kind === "money" || c.kind === "number";
  const fmt = (v: ExportCell, c: ExportColumn) =>
    c.kind === "money" ? den(Number(v)) : c.kind === "date" ? dateSq(String(v)) : String(v);

  autoTable(pdf, {
    startY: 70 + doc.meta.length * 14 + 10,
    margin: { left, right: left },
    head: [doc.columns.map((c) => c.label)],
    body: doc.rows.map((r) => r.map((v, i) => fmt(v, doc.columns[i]))),
    foot: [[{ content: doc.total.label, colSpan: doc.columns.length - 1 }, den(doc.total.value)]],
    showFoot: "lastPage",
    styles: { font: "helvetica", fontSize: 9, cellPadding: 5, textColor: [15, 23, 42], lineColor: [231, 234, 240] },
    headStyles: { fillColor: [37, 87, 235], textColor: 255, fontStyle: "bold" },
    footStyles: { fillColor: [238, 244, 255], textColor: [15, 23, 42], fontStyle: "bold", fontSize: 10 },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: Object.fromEntries(doc.columns.map((c, i) => [i, { halign: isNum(c) ? "right" : "left" }])),
    didParseCell: (d) => {
      // right-align numeric headers and the total amount
      const c = doc.columns[d.column.index];
      if ((d.section === "head" || d.section === "foot") && c && isNum(c)) d.cell.styles.halign = "right";
    },
    didDrawPage: () => {
      const pages = pdf.getNumberOfPages();
      pdf.setFontSize(8);
      pdf.setTextColor(148, 163, 184);
      pdf.text(`${pages}`, pdf.internal.pageSize.getWidth() - left, pdf.internal.pageSize.getHeight() - 20, { align: "right" });
    },
  });

  pdf.save(`${safe(doc.fileName)}.pdf`);
}

/* ---------- helpers ---------- */

/** CSV/Excel keep raw numbers, so money headers carry the currency. */
const headerLabel = (c: ExportColumn) => (c.kind === "money" ? `${c.label} (Den)` : c.label);

const safe = (s: string) => s.replace(/[\\/:*?"<>|]+/g, "-").trim() || "export";

function download(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
