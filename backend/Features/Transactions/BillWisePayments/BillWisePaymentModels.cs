using backend.Features.Masters.Ledgers;
using backend.Features.Masters.Vendors;
using backend.Features.Transactions.PurchaseInvoices;

namespace backend.Features.Transactions.BillWisePayments;

public sealed class BillWisePayment : BillWiseDocumentBase<BillWisePaymentAllocation>
{
    public BillWisePaymentVendorInformation VendorInformation { get; set; } = new();

    public BillWisePaymentAccountInformation AccountInformation { get; set; } = new();
}

public sealed class BillWisePaymentVendorInformation
{
    public Guid VendorId { get; set; }

    public Vendor? Vendor { get; set; }

    public string VendorNameSnapshot { get; set; } = string.Empty;

    public string Address { get; set; } = string.Empty;

    public string? Attention { get; set; }

    public string? Phone { get; set; }
}

public sealed class BillWisePaymentAccountInformation
{
    public Guid LedgerId { get; set; }

    public Ledger? Ledger { get; set; }

    public string LedgerNameSnapshot { get; set; } = string.Empty;
}

public sealed class BillWisePaymentAllocation : BillWiseAllocationBase
{
    public Guid BillWisePaymentId { get; set; }

    public BillWisePayment? BillWisePayment { get; set; }

    public Guid PurchaseInvoiceId { get; set; }

    public PurchaseInvoice? PurchaseInvoice { get; set; }
}
