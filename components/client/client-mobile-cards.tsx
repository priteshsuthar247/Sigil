"use client";

import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PencilIcon, Trash2Icon, PlusIcon, EyeIcon } from "lucide-react";
import type { Client } from "@/lib/schemas";

interface ClientMobileCardsProps {
  clients: Client[];
  onEdit?: (client: Client) => void;
  onDelete?: (client: Client) => void;
  onCreateInvoice?: (clientId: string) => void;
}

export function ClientMobileCards({ clients, onEdit, onDelete, onCreateInvoice }: ClientMobileCardsProps) {
  return (
    <div className="block md:hidden space-y-3">
      {clients.map((client) => (
        <Card key={client.id} className="overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <CardTitle className="text-base font-semibold">
                  <Link href={`/dashboard/clients/${client.id}`} className="hover:underline">
                    {client.name}
                  </Link>
                </CardTitle>
                <div className="mt-0.5 text-sm text-muted-foreground">{client.email}</div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            {client.phone && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Phone</span>
                <span className="font-medium">{client.phone}</span>
              </div>
            )}
            {client.address && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Address</span>
                <span className="font-medium">{client.address}</span>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-wrap gap-2 pt-3">
            <Button size="sm" variant="ghost" nativeButton={false} render={<Link href={`/dashboard/clients/${client.id}`} />}>
                <EyeIcon className="h-4 w-4" />
                View
            </Button>
            {onEdit && (
              <Button size="sm" variant="ghost" onClick={() => onEdit(client)}>
                <PencilIcon className="h-4 w-4" />
                Edit
              </Button>
            )}
            {onCreateInvoice && (
              <Button size="sm" variant="ghost" onClick={() => onCreateInvoice(client.id)}>
                <PlusIcon className="h-4 w-4" />
                New Invoice
              </Button>
            )}
            {onDelete && (
              <Button size="sm" variant="destructive" onClick={() => onDelete(client)}>
                <Trash2Icon className="h-4 w-4" />
                Delete
              </Button>
            )}
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
