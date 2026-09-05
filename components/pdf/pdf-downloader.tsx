"use client";

import { useEffect } from "react";

export function PdfDownloader({ invoiceId }: { invoiceId: string }) {
  useEffect(() => {
    const generate = async () => {
      const res = await fetch(`/api/invoices/${invoiceId}/data`);
      if (!res.ok) return;
      const data = await res.json();
      // client-side PDF generation would go here
    };
  }, [invoiceId]);
  return null;
}
