import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Download,
  Printer,
  CheckSquare,
  Star,
  GripVertical,
} from "lucide-react";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PremiumFeatureGate } from "@/components/premium/PremiumFeatureGate";
import { RoleGate } from "@/components/gates/RoleGate";
import { useToast } from "@/hooks/use-toast";
import { useChildren } from "@/hooks/useChildren";
import jsPDF from "jspdf";
import { format } from "date-fns";

interface Chore {
  id: string;
  name: string;
  days: boolean[];
}

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const BRAND_COLOR: [number, number, number] = [33, 176, 254];

const ChoreChartContent = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { children } = useChildren();
  
  const [selectedChild, setSelectedChild] = useState<string>("");
  const [chartTitle, setChartTitle] = useState("Weekly Chore Chart");
  const [chores, setChores] = useState<Chore[]>([
    { id: "1", name: "Make bed", days: [true, true, true, true, true, true, true] },
    { id: "2", name: "Brush teeth", days: [true, true, true, true, true, true, true] },
    { id: "3", name: "Pick up toys", days: [true, true, true, true, true, false, false] },
  ]);
  const [newChore, setNewChore] = useState("");

  const addChore = () => {
    if (!newChore.trim()) return;
    setChores([
      ...chores,
      { id: Date.now().toString(), name: newChore.trim(), days: [true, true, true, true, true, true, true] },
    ]);
    setNewChore("");
  };

  const removeChore = (id: string) => {
    setChores(chores.filter((c) => c.id !== id));
  };

  const toggleDay = (choreId: string, dayIndex: number) => {
    setChores(
      chores.map((c) =>
        c.id === choreId
          ? { ...c, days: c.days.map((d, i) => (i === dayIndex ? !d : d)) }
          : c
      )
    );
  };

  const childName = children.find((c) => c.id === selectedChild)?.name || "Child";

  const generatePdf = () => {
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "letter",
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;

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
    doc.text(chartTitle, pageWidth / 2, y, { align: "center" });
    y += 6;

    if (selectedChild) {
      doc.setFontSize(11);
      doc.setTextColor(100, 100, 100);
      doc.text(`For: ${childName}`, pageWidth / 2, y, { align: "center" });
      y += 6;
    }
    y += 8;

    // Table
    const colWidth = (pageWidth - margin * 2 - 60) / 7;
    const rowHeight = 10;
    const labelWidth = 60;

    // Header row
    doc.setFillColor(240, 248, 255);
    doc.rect(margin, y, pageWidth - margin * 2, rowHeight, "F");
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 30, 30);
    doc.text("Chore", margin + 5, y + 7);

    DAYS.forEach((day, i) => {
      const x = margin + labelWidth + colWidth * i + colWidth / 2;
      doc.text(day, x, y + 7, { align: "center" });
    });
    y += rowHeight;

    // Chore rows
    doc.setFont("helvetica", "normal");
    chores.forEach((chore, rowIndex) => {
      if (rowIndex % 2 === 0) {
        doc.setFillColor(250, 250, 250);
        doc.rect(margin, y, pageWidth - margin * 2, rowHeight, "F");
      }

      doc.setTextColor(30, 30, 30);
      doc.text(chore.name.slice(0, 25), margin + 5, y + 7);

      chore.days.forEach((active, dayIndex) => {
        const x = margin + labelWidth + colWidth * dayIndex + colWidth / 2;
        if (active) {
          // Draw checkbox
          doc.setDrawColor(180, 180, 180);
          doc.rect(x - 3, y + 2, 6, 6);
        }
      });

      y += rowHeight;
    });

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(`Generated: ${format(new Date(), "MMMM d, yyyy")}`, margin, pageHeight - 10);
    doc.text("coparrent.lovable.app", pageWidth - margin, pageHeight - 10, { align: "right" });

    doc.save(`chore-chart-${format(new Date(), "yyyy-MM-dd")}.pdf`);
    toast({ title: "Downloaded!", description: "Chore chart PDF saved." });
  };

  const openPrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast({ title: "Popup blocked", description: "Please allow popups to print.", variant: "destructive" });
      return;
    }

    const tableRows = chores
      .map(
        (chore) => `
        <tr>
          <td class="chore-name">${chore.name}</td>
          ${chore.days.map((active) => `<td class="day-cell">${active ? '<span class="checkbox">☐</span>' : ''}</td>`).join("")}
        </tr>
      `
      )
      .join("");

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${chartTitle}</title>
        <style>
          @page { size: letter landscape; margin: 0.75in; }
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 20px; }
          .header { background: #21B0FE; color: white; text-align: center; padding: 12px 20px; font-size: 16px; font-weight: bold; border-radius: 4px; margin-bottom: 20px; }
          .title { font-size: 22px; font-weight: bold; text-align: center; margin-bottom: 5px; }
          .subtitle { text-align: center; color: #666; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #ddd; padding: 10px; text-align: center; }
          th { background: #f0f8ff; font-weight: 600; }
          .chore-name { text-align: left; font-weight: 500; }
          .checkbox { font-size: 18px; }
          .footer { text-align: center; color: #888; font-size: 10px; margin-top: 30px; }
          @media print { .header { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
        </style>
      </head>
      <body>
        <div class="header">CoParrent Creations</div>
        <div class="title">${chartTitle}</div>
        ${selectedChild ? `<div class="subtitle">For: ${childName}</div>` : ''}
        <table>
          <thead>
            <tr>
              <th>Chore</th>
              ${DAYS.map((d) => `<th>${d}</th>`).join("")}
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>
        <div class="footer">coparrent.lovable.app • ${format(new Date(), "MMMM d, yyyy")}</div>
        <script>window.onload = function() { setTimeout(function() { window.print(); window.close(); }, 500); };</script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/dashboard/kids-hub")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <CheckSquare className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-semibold">Chore Chart</h1>
              <p className="text-xs text-muted-foreground">Create printable chore charts</p>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={generatePdf} className="gap-2">
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Export PDF</span>
          </Button>
          <Button variant="outline" onClick={openPrint} className="gap-2">
            <Printer className="h-4 w-4" />
            <span className="hidden sm:inline">Print</span>
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 overflow-auto">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Chart Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Chart Title</label>
                  <Input
                    value={chartTitle}
                    onChange={(e) => setChartTitle(e.target.value)}
                    placeholder="Weekly Chore Chart"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Child (optional)</label>
                  <Select value={selectedChild} onValueChange={setSelectedChild}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select child..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No child selected</SelectItem>
                      {children.map((child) => (
                        <SelectItem key={child.id} value={child.id}>
                          {child.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Chores List */}
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-base">Chores</CardTitle>
              <Badge variant="secondary">{chores.length} chores</Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add chore */}
              <div className="flex gap-2">
                <Input
                  value={newChore}
                  onChange={(e) => setNewChore(e.target.value)}
                  placeholder="Add a chore..."
                  onKeyDown={(e) => e.key === "Enter" && addChore()}
                />
                <Button onClick={addChore} disabled={!newChore.trim()}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {/* Chores table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-2 font-medium">Chore</th>
                      {DAYS.map((day) => (
                        <th key={day} className="text-center py-2 px-1 font-medium w-12">
                          {day}
                        </th>
                      ))}
                      <th className="w-10"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {chores.map((chore) => (
                      <motion.tr
                        key={chore.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="border-b hover:bg-muted/50"
                      >
                        <td className="py-2 px-2">{chore.name}</td>
                        {chore.days.map((active, i) => (
                          <td key={i} className="text-center py-2 px-1">
                            <Checkbox
                              checked={active}
                              onCheckedChange={() => toggleDay(chore.id, i)}
                            />
                          </td>
                        ))}
                        <td className="py-2 px-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => removeChore(chore.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>

                {chores.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No chores added yet. Add some above!
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Preview info */}
          <Card className="bg-muted/50 border-dashed">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Star className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium">Ready to print!</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Click Export PDF or Print to create a beautiful chore chart with the 
                    "CoParrent Creations" header. Print it out and let your kids check off 
                    their completed chores each day!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

const ChoreChartPage = () => {
  return (
    <DashboardLayout>
      <RoleGate requireParent restrictedMessage="Chore Chart is only available to parents and guardians.">
        <PremiumFeatureGate featureName="Chore Chart">
          <ChoreChartContent />
        </PremiumFeatureGate>
      </RoleGate>
    </DashboardLayout>
  );
};

export default ChoreChartPage;