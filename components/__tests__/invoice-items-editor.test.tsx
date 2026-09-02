import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { InvoiceItemsEditor, makeInitialItemRows } from "@/components/invoice/invoice-items-editor";

function TestWrapper() {
  const [items, setItems] = React.useState(makeInitialItemRows());
  return <InvoiceItemsEditor value={items} onChange={setItems} />;
}

describe("InvoiceItemsEditor", () => {
  it("renders with one empty row", () => {
    render(<TestWrapper />);
    expect(screen.getByPlaceholderText("Description")).toBeInTheDocument();
  });

  it("displays price in dollar format", () => {
    const items = [
      { id: "1", description: "Test", quantity: 1, price: 1999 },
    ];
    render(<InvoiceItemsEditor value={items} onChange={vi.fn()} />);
    const priceInputs = screen.getAllByLabelText("Price");
    expect(priceInputs[0]).toHaveValue(19.99);
  });

  it("converts dollar input to cents on change", () => {
    const onChange = vi.fn();
    const items = [
      { id: "1", description: "Test", quantity: 1, price: 0 },
    ];
    render(<InvoiceItemsEditor value={items} onChange={onChange} />);
    const priceInputs = screen.getAllByLabelText("Price");
    fireEvent.change(priceInputs[0], { target: { value: "19.99" } });
    expect(onChange).toHaveBeenCalledWith([
      { id: "1", description: "Test", quantity: 1, price: 1999 },
    ]);
  });

  it("converts empty input to 0 cents", () => {
    const onChange = vi.fn();
    const items = [
      { id: "1", description: "Test", quantity: 1, price: 500 },
    ];
    render(<InvoiceItemsEditor value={items} onChange={onChange} />);
    const priceInputs = screen.getAllByLabelText("Price");
    fireEvent.change(priceInputs[0], { target: { value: "" } });
    expect(onChange).toHaveBeenCalledWith([
      { id: "1", description: "Test", quantity: 1, price: 0 },
    ]);
  });

  it("clamps negative input to 0", () => {
    const onChange = vi.fn();
    const items = [
      { id: "1", description: "Test", quantity: 1, price: 0 },
    ];
    render(<InvoiceItemsEditor value={items} onChange={onChange} />);
    const priceInputs = screen.getAllByLabelText("Price");
    fireEvent.change(priceInputs[0], { target: { value: "-5" } });
    expect(onChange).toHaveBeenCalledWith([
      { id: "1", description: "Test", quantity: 1, price: 0 },
    ]);
  });

  it("enforces minimum quantity of 1", () => {
    const onChange = vi.fn();
    const items = [
      { id: "1", description: "Test", quantity: 5, price: 100 },
    ];
    render(<InvoiceItemsEditor value={items} onChange={onChange} />);
    const qtyInputs = screen.getAllByLabelText("Quantity");
    fireEvent.change(qtyInputs[0], { target: { value: "0" } });
    expect(onChange).toHaveBeenCalledWith([
      { id: "1", description: "Test", quantity: 1, price: 100 },
    ]);
  });

  it("displays line total in correct format", () => {
    const items = [
      { id: "1", description: "Test", quantity: 2, price: 1999 },
    ];
    render(<InvoiceItemsEditor value={items} onChange={vi.fn()} />);
    // 2 * $19.99 = $39.98
    expect(screen.getByText("$39.98")).toBeInTheDocument();
  });
});
