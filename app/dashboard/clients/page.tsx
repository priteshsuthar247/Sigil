"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { ClientTable } from "@/components/client/client-table";
import { ClientFormDialog } from "@/components/client/client-form-dialog";
import { clients } from "@/lib/mock/clients";

export default function Page() {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-end gap-2">
        <Button size="sm" onClick={() => setOpen(true)}>
          <PlusIcon data-icon="inline-start" />
          New Client
        </Button>
      </div>
      <ClientTable clients={clients} />
      <ClientFormDialog open={open} onOpenChange={setOpen} />
    </div>
  );
}
