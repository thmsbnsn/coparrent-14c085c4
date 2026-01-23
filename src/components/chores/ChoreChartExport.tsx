/**
 * ChoreChartExport - PDF and Print export for chore charts
 * 
 * Follows the CoParrent Creations branding contract.
 * Exports per-child or all children (grouped, not merged).
 */

import jsPDF from "jspdf";
import { format, startOfWeek, addDays } from "date-fns";
import type { Chore, ChoreList, CompletionStyle } from "@/hooks/useChoreCharts";

const BRAND_COLOR: [number, number, number] = [33, 176, 254];
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

interface Child {
  id: string;
  name: string;
}

interface ExportOptions {
  choreList: ChoreList;
  chores: Chore[];
  children: Child[];
  selectedChildId?: string | null; // null = all children
  weekStart?: Date;
}

const SHAPE_CHARS: Record<CompletionStyle, string> = {
  box: "☐",
  circle: "○",
  star: "☆",
  heart: "♡",
};

export const generateChoreChartPDF = ({
  choreList,
  chores,
  children,
  selectedChildId,
  weekStart = startOfWeek(new Date(), { weekStartsOn: 1 }),
}: ExportOptions) => {
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "letter",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;

  // Filter children to export
  const childrenToExport = selectedChildId
    ? children.filter((c) => c.id === selectedChildId)
    : children;

  // Generate week dates
  const weekDates = DAYS.map((_, i) => addDays(weekStart, i));

  childrenToExport.forEach((child, childIndex) => {
    if (childIndex > 0) {
      doc.addPage();
    }

    // Filter chores for this child
    const childChores = chores.filter((chore) => {
      const assignments = chore.assignments || [];
      return assignments.some((a) => a.child_id === null || a.child_id === child.id);
    });

    // Header
    doc.setFillColor(...BRAND_COLOR);
    doc.rect(0, 0, pageWidth, 18, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("CoParrent Creations", pageWidth / 2, 12, { align: "center" });

    // Title
    let y = 28;
    doc.setTextColor(30, 30, 30);
    doc.setFontSize(16);
    const title = choreList.household_label || "Weekly Chore Chart";
    doc.text(title, pageWidth / 2, y, { align: "center" });
    y += 6;

    // Child name
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text(`For: ${child.name}`, pageWidth / 2, y, { align: "center" });
    y += 4;

    // Week info
    doc.setFontSize(10);
    doc.text(
      `Week of ${format(weekStart, "MMMM d, yyyy")}`,
      pageWidth / 2,
      y,
      { align: "center" }
    );
    y += 10;

    // Table
    const colWidth = (pageWidth - margin * 2 - 55) / 7;
    const rowHeight = 10;
    const labelWidth = 55;

    // Header row
    doc.setFillColor(240, 248, 255);
    doc.rect(margin, y, pageWidth - margin * 2, rowHeight, "F");
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 30, 30);
    doc.text("Chore", margin + 4, y + 7);

    weekDates.forEach((date, i) => {
      const x = margin + labelWidth + colWidth * i + colWidth / 2;
      doc.text(DAYS[i], x, y + 4, { align: "center" });
      doc.setFontSize(8);
      doc.text(format(date, "M/d"), x, y + 8, { align: "center" });
      doc.setFontSize(10);
    });
    y += rowHeight;

    // Chore rows
    doc.setFont("helvetica", "normal");
    childChores.forEach((chore, rowIndex) => {
      if (rowIndex % 2 === 0) {
        doc.setFillColor(252, 252, 252);
        doc.rect(margin, y, pageWidth - margin * 2, rowHeight, "F");
      }

      doc.setTextColor(30, 30, 30);
      doc.text(chore.title.slice(0, 28), margin + 4, y + 7);

      chore.days_active.forEach((active, dayIndex) => {
        const x = margin + labelWidth + colWidth * dayIndex + colWidth / 2;
        if (active) {
          // Draw shape based on style
          doc.setFontSize(16);
          doc.text(SHAPE_CHARS[chore.completion_style], x, y + 7, { align: "center" });
          doc.setFontSize(10);
        }
      });

      y += rowHeight;
    });

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(`Generated: ${format(new Date(), "MMMM d, yyyy")}`, margin, pageHeight - 10);
    doc.text("coparrent.lovable.app", pageWidth - margin, pageHeight - 10, { align: "right" });
  });

  const fileName = selectedChildId
    ? `chore-chart-${children.find((c) => c.id === selectedChildId)?.name || "child"}-${format(weekStart, "yyyy-MM-dd")}.pdf`
    : `chore-chart-all-children-${format(weekStart, "yyyy-MM-dd")}.pdf`;

  doc.save(fileName);
  return fileName;
};

export const openChoreChartPrint = ({
  choreList,
  chores,
  children,
  selectedChildId,
  weekStart = startOfWeek(new Date(), { weekStartsOn: 1 }),
}: ExportOptions) => {
  const printWindow = window.open("", "_blank");
  if (!printWindow) return false;

  // Filter children
  const childrenToExport = selectedChildId
    ? children.filter((c) => c.id === selectedChildId)
    : children;

  const weekDates = DAYS.map((_, i) => addDays(weekStart, i));

  // Generate child sections
  const childSections = childrenToExport
    .map((child) => {
      const childChores = chores.filter((chore) => {
        const assignments = chore.assignments || [];
        return assignments.some((a) => a.child_id === null || a.child_id === child.id);
      });

      const tableRows = childChores
        .map(
          (chore) => `
          <tr>
            <td class="chore-name">${chore.title}</td>
            ${chore.days_active
              .map(
                (active) =>
                  `<td class="day-cell">${active ? `<span class="shape">${SHAPE_CHARS[chore.completion_style]}</span>` : ""}</td>`
              )
              .join("")}
          </tr>
        `
        )
        .join("");

      return `
        <div class="chart-section">
          <h2>For: ${child.name}</h2>
          <table>
            <thead>
              <tr>
                <th>Chore</th>
                ${weekDates.map((d, i) => `<th>${DAYS[i]}<br><small>${format(d, "M/d")}</small></th>`).join("")}
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
        </div>
      `;
    })
    .join('<div class="page-break"></div>');

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>${choreList.household_label || "Chore Chart"}</title>
      <style>
        @page { size: letter landscape; margin: 0.75in; }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 20px; }
        .header { background: #21B0FE; color: white; text-align: center; padding: 12px 20px; font-size: 16px; font-weight: bold; border-radius: 4px; margin-bottom: 15px; }
        .title { font-size: 20px; font-weight: bold; text-align: center; margin-bottom: 5px; }
        .subtitle { text-align: center; color: #666; margin-bottom: 15px; font-size: 12px; }
        .chart-section { margin-bottom: 20px; }
        .chart-section h2 { font-size: 14px; color: #333; margin-bottom: 10px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: center; }
        th { background: #f0f8ff; font-weight: 600; font-size: 11px; }
        th small { font-weight: normal; color: #666; }
        .chore-name { text-align: left; font-weight: 500; }
        .shape { font-size: 18px; }
        .footer { text-align: center; color: #888; font-size: 10px; margin-top: 20px; }
        .page-break { page-break-after: always; margin: 20px 0; border-top: 1px dashed #ccc; }
        @media print { 
          .header { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .page-break { page-break-after: always; border: none; margin: 0; }
        }
      </style>
    </head>
    <body>
      <div class="header">CoParrent Creations</div>
      <div class="title">${choreList.household_label || "Weekly Chore Chart"}</div>
      <div class="subtitle">Week of ${format(weekStart, "MMMM d, yyyy")}</div>
      ${childSections}
      <div class="footer">coparrent.lovable.app • ${format(new Date(), "MMMM d, yyyy")}</div>
      <script>window.onload = function() { setTimeout(function() { window.print(); window.close(); }, 500); };</script>
    </body>
    </html>
  `);
  printWindow.document.close();
  return true;
};
