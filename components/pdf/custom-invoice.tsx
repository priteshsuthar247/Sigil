import { Document, Page, View, Text, StyleSheet } from "@formepdf/react";

type InvoicePdfProps = {
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  companyName: string;
  companyAddress: string;
  companyEmail: string;
  client: { name: string; address: string; email: string; phone: string };
  items: { description: string; quantity: number; price: number }[];
  totalAmount: number;
};

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: "Helvetica" },
  header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20 },
  company: { fontSize: 18, fontWeight: "bold" },
  invoiceBox: { borderWidth: 1, borderColor: "#000", padding: 10, alignItems: "flex-end" },
  label: { fontSize: 8, textTransform: "uppercase", fontWeight: "bold", marginBottom: 4, color: "#555" },
  row: { flexDirection: "row", marginBottom: 12 },
  col: { flex: 1 },
  tableHeader: { flexDirection: "row", borderBottomWidth: 1, borderColor: "#ddd", paddingBottom: 4, marginTop: 20, fontWeight: "bold", fontSize: 10 },
  tableRow: { flexDirection: "row", paddingVertical: 4, fontSize: 10, borderBottomWidth: 0.5, borderColor: "#eee" },
  totalRow: { flexDirection: "row", justifyContent: "flex-end", marginTop: 20 },
});

function formatINR(n: number) {
  return `₹${n.toLocaleString("en-IN")}`;
}

export function CustomInvoicePdf({ data }: { data: InvoicePdfProps }) {
  const subtotal = data.items.reduce((s, i) => s + i.quantity * i.price, 0);
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.company}>{data.companyName}</Text>
            <Text style={{ fontSize: 10, color: "#666" }}>{data.companyAddress} · {data.companyEmail}</Text>
          </View>
          <View style={styles.invoiceBox}>
            <Text style={{ fontSize: 8, fontWeight: "bold" }}>INVOICE</Text>
            <Text style={{ fontSize: 16, fontWeight: "bold" }}>{data.invoiceNumber}</Text>
            <Text style={{ fontSize: 9, color: "#666" }}>{data.invoiceDate}</Text>
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.col}>
            <Text style={styles.label}>Bill To</Text>
            <Text style={{ fontSize: 12, fontWeight: "bold" }}>{data.client.name}</Text>
            <Text style={{ fontSize: 9, color: "#666" }}>{data.client.address}</Text>
            <Text style={{ fontSize: 9, color: "#666" }}>{data.client.email}</Text>
            <Text style={{ fontSize: 9, color: "#666" }}>{data.client.phone}</Text>
          </View>
          <View style={styles.col}>
            <Text style={styles.label}>Invoice Details</Text>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 4 }}>
              <Text style={{ fontSize: 9, color: "#666" }}>Due Date</Text>
              <Text style={{ fontSize: 9 }}>{data.dueDate}</Text>
            </View>
          </View>
        </View>

        <View style={styles.tableHeader}>
          <View style={{ flex: 3 }}><Text>DESCRIPTION</Text></View>
          <View style={{ flex: 1, alignItems: "center" }}><Text>QTY</Text></View>
          <View style={{ flex: 1, alignItems: "flex-end" }}><Text>RATE</Text></View>
          <View style={{ flex: 1, alignItems: "flex-end" }}><Text>TOTAL</Text></View>
        </View>

        {data.items.map((item, idx) => (
          <View key={idx} style={styles.tableRow}>
            <View style={{ flex: 3 }}><Text>{item.description}</Text></View>
            <View style={{ flex: 1, alignItems: "center" }}><Text>{item.quantity}</Text></View>
            <View style={{ flex: 1, alignItems: "flex-end" }}><Text>{formatINR(item.price)}</Text></View>
            <View style={{ flex: 1, alignItems: "flex-end" }}><Text>{formatINR(item.quantity * item.price)}</Text></View>
          </View>
        ))}

        <View style={styles.totalRow}>
          <View style={{ width: 200 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={{ fontSize: 10, color: "#666" }}>Subtotal</Text>
              <Text style={{ fontSize: 10 }}>{formatINR(subtotal)}</Text>
            </View>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 4 }}>
              <Text style={{ fontSize: 12, fontWeight: "bold" }}>Balance Due</Text>
              <Text style={{ fontSize: 12, fontWeight: "bold" }}>{formatINR(data.totalAmount)}</Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
}
