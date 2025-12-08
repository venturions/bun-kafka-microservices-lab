export class OrderItem {
  private constructor(
    public readonly sku: string,
    public readonly quantity: number
  ) {}

  static create(sku: string, quantity: number): OrderItem {
    if (!sku || sku.trim().length === 0) {
      throw new Error("SKU must not be empty");
    }
    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new Error("Quantity must be a positive integer");
    }
    return new OrderItem(sku, quantity);
  }
}
