"use client";

import { ChevronDown, Download, FileDown, FileSpreadsheet, FileText, Printer } from "lucide-react";
import { Button, Menu } from "./ui";
import { useToast } from "./toast";
import { exportCsv, exportPdf, exportXlsx, type ExportDoc } from "@/lib/export";
import { useT } from "@/lib/i18n";

/** "Export ▾" → Print / Save as PDF / Download CSV / Download Excel. */
export function ExportMenu({ getDoc, size = "md" }: { getDoc: () => ExportDoc; size?: "sm" | "md" }) {
  const { t } = useT();
  const toast = useToast();
  const icon = size === "sm" ? 14 : 16;

  const run = async (fn: (d: ExportDoc) => void | Promise<void>) => {
    try {
      await fn(getDoc());
      toast(t.exports.downloaded);
    } catch {
      toast(t.exports.failed);
    }
  };

  return (
    <Menu
      trigger={() => (
        <Button variant="secondary" size={size}>
          <Download size={icon} /> {t.exports.button} <ChevronDown size={icon - 2} className="-ml-0.5 text-muted" />
        </Button>
      )}
      items={[
        { label: t.exports.print, icon: <Printer size={15} />, onClick: () => window.print() },
        { label: t.exports.pdf, icon: <FileText size={15} />, onClick: () => run(exportPdf) },
        { label: t.exports.csv, icon: <FileDown size={15} />, onClick: () => run(exportCsv) },
        { label: t.exports.excel, icon: <FileSpreadsheet size={15} />, onClick: () => run(exportXlsx) },
      ]}
    />
  );
}
