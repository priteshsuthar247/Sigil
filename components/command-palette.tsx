"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "cmdk";
import { PlusIcon, ReceiptIcon, UsersIcon, HomeIcon } from "lucide-react";

export function CommandPalette() {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const run = (action: () => void) => {
    setOpen(false);
    action();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <Command>
          <CommandInput placeholder="Type a command or search..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="Navigation">
              <CommandItem onSelect={() => run(() => router.push("/dashboard"))}>
                <HomeIcon className="mr-2 size-4" /> Dashboard
              </CommandItem>
              <CommandItem onSelect={() => run(() => router.push("/dashboard/clients"))}>
                <UsersIcon className="mr-2 size-4" /> Clients
              </CommandItem>
              <CommandItem onSelect={() => run(() => router.push("/dashboard/invoices"))}>
                <ReceiptIcon className="mr-2 size-4" /> Invoices
              </CommandItem>
            </CommandGroup>
            <CommandGroup heading="Create">
              <CommandItem onSelect={() => run(() => {
                router.push("/dashboard/clients");
                // New client is opened via button, keep simple
              })}>
                <PlusIcon className="mr-2 size-4" /> New Client
              </CommandItem>
              <CommandItem onSelect={() => run(() => router.push("/dashboard/invoices"))}>
                <PlusIcon className="mr-2 size-4" /> New Invoice
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
