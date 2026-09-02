import type { Client } from "@/lib/schemas";

export const clients: Client[] = [
  {
    id: "c1",
    name: "Acme Co.",
    email: "billing@acme.test",
    phone: "+1 415 555 0101",
    address: "100 Market St, San Francisco, CA",
    createdAt: new Date("2025-11-04"),
  },
  {
    id: "c2",
    name: "Globex Corporation",
    email: "ap@globex.test",
    phone: "+1 212 555 0142",
    address: "500 Madison Ave, New York, NY",
    createdAt: new Date("2025-12-12"),
  },
  {
    id: "c3",
    name: "Initech",
    email: "finance@initech.test",
    phone: "+1 512 555 0188",
    address: "8800 Bee Cave Rd, Austin, TX",
    createdAt: new Date("2026-01-08"),
  },
  {
    id: "c4",
    name: "Umbrella Corp",
    email: "ar@umbrella.test",
    phone: null,
    address: "1 Raccoon City Way",
    createdAt: new Date("2026-02-21"),
  },
  {
    id: "c5",
    name: "Stark Industries",
    email: "accounts@stark.test",
    phone: "+1 310 555 0190",
    address: "10880 Malibu Point, Malibu, CA",
    createdAt: new Date("2026-03-15"),
  },
  {
    id: "c6",
    name: "Wayne Enterprises",
    email: "ap@wayne.test",
    phone: "+1 201 555 0144",
    address: "1007 Mountain Dr, Gotham",
    createdAt: new Date("2026-04-02"),
  },
];
