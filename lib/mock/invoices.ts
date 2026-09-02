import { clients } from "@/lib/mock/clients";
import { invoiceItems } from "@/lib/mock/invoice-items";
import type { Invoice } from "@/lib/schemas";

function clientById(id: string) {
  return clients.find((c) => c.id === id)!;
}

function totalFor(invoiceId: string): number {
  return invoiceItems
    .filter((it) => it.invoiceId === invoiceId)
    .reduce((sum, it) => sum + it.quantity * it.price, 0);
}

export const invoices: Invoice[] = [
  {
    id: "inv1",
    number: 1001,
    clientId: "c1",
    clientName: clientById("c1").name,
    status: "paid",
    totalAmount: totalFor("inv1"),
    createdAt: new Date("2026-08-12"),
    paidAt: new Date("2026-08-20"),
  },
  {
    id: "inv2",
    number: 1002,
    clientId: "c2",
    clientName: clientById("c2").name,
    status: "sent",
    totalAmount: totalFor("inv2"),
    createdAt: new Date("2026-08-25"),
    paidAt: null,
  },
  {
    id: "inv3",
    number: 1003,
    clientId: "c3",
    clientName: clientById("c3").name,
    status: "paid",
    totalAmount: totalFor("inv3"),
    createdAt: new Date("2026-08-02"),
    paidAt: new Date("2026-08-15"),
  },
  {
    id: "inv4",
    number: 1004,
    clientId: "c4",
    clientName: clientById("c4").name,
    status: "sent",
    totalAmount: totalFor("inv4"),
    createdAt: new Date("2026-08-28"),
    paidAt: null,
  },
  {
    id: "inv5",
    number: 1005,
    clientId: "c5",
    clientName: clientById("c5").name,
    status: "paid",
    totalAmount: totalFor("inv5"),
    createdAt: new Date("2026-07-30"),
    paidAt: new Date("2026-08-09"),
  },
  {
    id: "inv6",
    number: 1006,
    clientId: "c6",
    clientName: clientById("c6").name,
    status: "sent",
    totalAmount: totalFor("inv6"),
    createdAt: new Date("2026-09-01"),
    paidAt: null,
  },
  {
    id: "inv7",
    number: 1007,
    clientId: "c1",
    clientName: clientById("c1").name,
    status: "sent",
    totalAmount: totalFor("inv7"),
    createdAt: new Date("2026-09-04"),
    paidAt: null,
  },
  {
    id: "inv8",
    number: 1008,
    clientId: "c3",
    clientName: clientById("c3").name,
    status: "sent",
    totalAmount: totalFor("inv8"),
    createdAt: new Date("2026-09-08"),
    paidAt: null,
  },
];
