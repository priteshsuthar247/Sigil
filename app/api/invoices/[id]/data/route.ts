import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db/drizzle";
import { invoices, invoiceItems, clients, companyProfiles } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });
  const { id } = await params;
  const [invoice] = await db.select().from(invoices).where(and(eq(invoices.id, id), eq(invoices.userId, session.user.id))).limit(1);
  if (!invoice) return new NextResponse("Not found", { status: 404 });
  const client = await db.select().from(clients).where(eq(clients.id, invoice.clientId)).limit(1).then(r => r[0]);
  const items = await db.select().from(invoiceItems).where(eq(invoiceItems.invoiceId, invoice.id));
  const [company] = await db.select().from(companyProfiles).where(eq(companyProfiles.userId, session.user.id)).limit(1);
  if (!company) return new NextResponse("Company profile not found", { status: 400 });
  return NextResponse.json({ invoice, client, items, company });
}
