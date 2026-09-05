"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DownloadIcon } from "lucide-react";
import { renderDocument } from "@formepdf/core/browser";
import { InvoicePdf, buildInvoicePdfData } from "@/components/pdf/invoice-pdf";
import { formatDate } from "@/lib/schemas";

export function PdfClientDownloadButton({ invoiceId, invoiceNumber }: { invoiceId: string; invoiceNumber: string }) {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/invoices/${invoiceId}/data`);
      if (!res.ok) throw new Error("Failed to load data");
      const { invoice, client, items, company } = await res.json();
      if (!company) throw new Error("Company profile missing");

      const invoiceDate = formatDate(new Date(invoice.createdAt));
      const dueDate = formatDate(new Date(Date.now() + 30 * 86400000));

      const pdfData = buildInvoicePdfData(
        String(invoice.number),
        invoiceDate,
        dueDate,
        {
          name: client?.name || "",
          email: client?.email || "",
          phone: client?.phone || "",
          address: client?.address || "",
        },
        items.map((i: any) => ({
          description: i.description,
          quantity: i.quantity,
          price: i.price,
        })),
        invoice.totalAmount,
        {
          companyName: company.companyName,
          companyAddress: company.companyAddress,
          companyEmail: company.companyEmail,
          companyPhone: company.companyPhone,
          paymentTerms: company.paymentTerms,
          gstin: company.gstin,
          notes: company.notes,
        }
      );

      const pdfBytes = await renderDocument(<InvoicePdf data={pdfData} />);
      const blob = new Blob([Buffer.from(pdfBytes)], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice-${invoiceNumber}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={loading}
      onClick={handleDownload}
    >
      <DownloadIcon data-icon="inline-start" />
      {loading ? "Generating..." : "PDF"}
    </Button>
  );
}
