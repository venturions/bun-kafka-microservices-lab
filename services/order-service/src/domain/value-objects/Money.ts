export class Money {
  private constructor(private readonly value: number) {}

  static create(value: number): Money {
    if (!Number.isFinite(value) || value <= 0) {
      throw new Error("Amount must be greater than zero");
    }
    return new Money(value);
  }

  get amount(): number {
    return this.value;
  }
}
