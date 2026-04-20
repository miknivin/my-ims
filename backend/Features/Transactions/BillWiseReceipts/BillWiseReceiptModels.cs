using backend.Features.Masters.Customers;
using backend.Features.Masters.Ledgers;
using backend.Features.Transactions.SalesInvoices;

namespace backend.Features.Transactions.BillWiseReceipts;

public sealed class BillWiseReceipt : BillWiseDocumentBase<BillWiseReceiptAllocation>
{
    public BillWiseReceiptCustomerInformation CustomerInformation { get; set; } = new();

    public BillWiseReceiptAccountInformation AccountInformation { get; set; } = new();
}

public sealed class BillWiseReceiptCustomerInformation
{
    public Guid CustomerId { get; set; }

    public Customer? Customer { get; set; }

    public string CustomerNameSnapshot { get; set; } = string.Empty;

    public string Address { get; set; } = string.Empty;
}

public sealed class BillWiseReceiptAccountInformation
{
    public Guid LedgerId { get; set; }

    public Ledger? Ledger { get; set; }

    public string LedgerNameSnapshot { get; set; } = string.Empty;
}

public sealed class BillWiseReceiptAllocation : BillWiseAllocationBase
{
    public Guid BillWiseReceiptId { get; set; }

    public BillWiseReceipt? BillWiseReceipt { get; set; }

    public Guid SalesInvoiceId { get; set; }

    public SalesInvoice? SalesInvoice { get; set; }
}
