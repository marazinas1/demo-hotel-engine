import { useEffect, useState } from "react";
import { Download, Eye, Loader2 } from "lucide-react";
import type { jsPDF } from "jspdf";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  buildInvoicePdf,
  type InvoiceDocData,
  type InvoiceLineItem,
  type InvoicePartyData,
} from "@/lib/invoice-pdf";

export type InvoiceRow = {
  full_number: string;
  issue_date: string;
  is_vat_invoice: boolean;
  vat_rate: number;
  currency: string;
  seller: InvoicePartyData;
  buyer: InvoicePartyData;
  line_items: InvoiceLineItem[];
  subtotal_net: number;
  vat_amount: number;
  total: number;
  notes: string;
  issued_by: string;
};

function toDocData(row: InvoiceRow): InvoiceDocData {
  return {
    fullNumber: row.full_number,
    issueDate: row.issue_date,
    isVatInvoice: row.is_vat_invoice,
    vatRate: Number(row.vat_rate) || 0,
    currency: row.currency || "EUR",
    seller: row.seller,
    buyer: row.buyer,
    lineItems: row.line_items,
    subtotalNet: Number(row.subtotal_net) || 0,
    vatAmount: Number(row.vat_amount) || 0,
    total: Number(row.total) || 0,
    notes: row.notes || "",
    issuedBy: row.issued_by || "",
  };
}

export function InvoiceViewerDialog({ invoice }: { invoice: InvoiceRow }) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState<string | null>(null);
  const [pdfDoc, setPdfDoc] = useState<jsPDF | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoading(true);
    buildInvoicePdf(toDocData(invoice)).then((doc) => {
      if (cancelled) return;
      setUrl(doc.output("bloburl") as unknown as string);
      setPdfDoc(doc);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, invoice]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline">
          <Eye className="mr-2 h-4 w-4" />
          Peržiūrėti sąskaitą Nr. {invoice.full_number}
        </Button>
      </DialogTrigger>
      <DialogContent className="flex max-h-[90vh] max-w-3xl flex-col">
        <DialogHeader>
          <DialogTitle>Sąskaita Nr. {invoice.full_number}</DialogTitle>
          <DialogDescription>Sugeneruota {invoice.issue_date}.</DialogDescription>
        </DialogHeader>
        {loading || !url ? (
          <div className="flex h-64 items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Kraunama…
          </div>
        ) : (
          <>
            <iframe src={url} title="Sąskaita" className="h-[70vh] w-full rounded-md border" />
            <Button
              type="button"
              onClick={() => pdfDoc?.save(`saskaita-${invoice.full_number}.pdf`)}
              className="mt-2 w-fit"
            >
              <Download className="mr-2 h-4 w-4" />
              Atsisiųsti PDF
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}