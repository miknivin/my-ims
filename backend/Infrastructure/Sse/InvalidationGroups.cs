namespace backend.Infrastructure.Sse;

public static class InvalidationGroups
{
    public static readonly string[] Inventory =
    [
        "StockSummary", "StockSummaryEnhanced", "StockStatement",
        "ItemWiseStock", "StockMovement", "InventoryValuation"
    ];

    public static readonly string[] Financial =
        ["TrialBalance", "ProfitAndLoss", "BalanceSheet", "CashFlow"];

    public static readonly string[] Receivables =
        ["ReceivablesAgeing", "BillWiseReceivables"];

    public static readonly string[] Payables =
        ["PayablesAgeing", "BillWisePayables"];

    public static readonly string[] SalesRegister    = ["SalesRegisterReport"];
    public static readonly string[] PurchaseRegister = ["PurchaseRegisterReport"];

    // Pre-built compound groups used by posting handlers
    public static readonly string[] GrnPosted =
        [.. Inventory, .. Financial, .. PurchaseRegister];

    public static readonly string[] DnPosted =
        [.. Inventory, .. Financial, .. SalesRegister];

    public static readonly string[] SalesPosted =
        [.. SalesRegister, .. Financial, .. Inventory, .. Receivables];

    public static readonly string[] PurchasePosted =
        [.. PurchaseRegister, .. Financial, .. Inventory, .. Payables];

    public static readonly string[] PurchaseCreditDebitPosted =
        [.. PurchaseRegister, .. Financial, .. Payables, .. Inventory];

    public static readonly string[] SalesCreditDebitPosted =
        [.. SalesRegister, .. Financial, .. Receivables, .. Inventory];

    public static readonly string[] PaymentPosted =
        [.. Financial, .. Payables];

    public static readonly string[] ReceiptPosted =
        [.. Financial, .. Receivables];

    public static readonly string[] JournalPosted = Financial;
}
