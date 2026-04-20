using backend.Features.Auth;
using backend.Features.Accounting.Journals;
using backend.Features.Inventory;
using backend.Features.Inventory.GoodsReceiptNotes;
using backend.Features.Masters.Categories;
using backend.Features.Masters.Customers;
using backend.Features.Masters.Currencies;
using backend.Features.Masters.Discounts;
using backend.Features.Masters.Ledgers;
using backend.Features.Masters.Products;
using backend.Features.Masters.Taxes;
using backend.Features.Masters.Uoms;
using backend.Features.Masters.Vendors;
using backend.Features.Masters.Warehouses;
using backend.Features.Settings;
using backend.Features.Transactions.BillWisePayments;
using backend.Features.Transactions.BillWiseReceipts;
using backend.Features.Transactions.PurchaseCreditNotes;
using backend.Features.Transactions.PurchaseDebitNotes;
using backend.Features.Transactions.PurchaseInvoices;
using backend.Features.Transactions.PurchaseOrders;
using backend.Features.Transactions.SalesCreditNotes;
using backend.Features.Transactions.SalesDebitNotes;
using backend.Features.Transactions.SalesInvoices;
using backend.Features.Transactions.SalesOrders;
using Microsoft.EntityFrameworkCore;

namespace backend.Infrastructure.Persistence;

public sealed class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();

    public DbSet<Role> Roles => Set<Role>();

    public DbSet<Department> Departments => Set<Department>();

    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Customer> Customers => Set<Customer>();
    public DbSet<CustomerOpeningBalance> CustomerOpeningBalances => Set<CustomerOpeningBalance>();

    public DbSet<Currency> Currencies => Set<Currency>();

    public DbSet<Discount> Discounts => Set<Discount>();

    public DbSet<LedgerGroup> LedgerGroups => Set<LedgerGroup>();

    public DbSet<Ledger> Ledgers => Set<Ledger>();

    public DbSet<Tax> Taxes => Set<Tax>();

    public DbSet<TaxSlab> TaxSlabs => Set<TaxSlab>();

    public DbSet<Uom> Uoms => Set<Uom>();

    public DbSet<Warehouse> Warehouses => Set<Warehouse>();

    public DbSet<Product> Products => Set<Product>();

    public DbSet<ProductOpeningStock> ProductOpeningStocks => Set<ProductOpeningStock>();

    public DbSet<Vendor> Vendors => Set<Vendor>();

    public DbSet<VendorOpeningBalance> VendorOpeningBalances => Set<VendorOpeningBalance>();

    public DbSet<PurchaseOrder> PurchaseOrders => Set<PurchaseOrder>();

    public DbSet<PurchaseOrderLineItem> PurchaseOrderLineItems => Set<PurchaseOrderLineItem>();

    public DbSet<JournalVoucher> JournalVouchers => Set<JournalVoucher>();

    public DbSet<JournalEntry> JournalEntries => Set<JournalEntry>();

    public DbSet<BillWisePayment> BillWisePayments => Set<BillWisePayment>();

    public DbSet<BillWisePaymentAllocation> BillWisePaymentAllocations => Set<BillWisePaymentAllocation>();

    public DbSet<BillWiseReceipt> BillWiseReceipts => Set<BillWiseReceipt>();

    public DbSet<BillWiseReceiptAllocation> BillWiseReceiptAllocations => Set<BillWiseReceiptAllocation>();

    public DbSet<PurchaseInvoice> PurchaseInvoices => Set<PurchaseInvoice>();

    public DbSet<PurchaseInvoiceLineItem> PurchaseInvoiceLineItems => Set<PurchaseInvoiceLineItem>();

    public DbSet<PurchaseCreditNote> PurchaseCreditNotes => Set<PurchaseCreditNote>();

    public DbSet<PurchaseCreditNoteLineItem> PurchaseCreditNoteItems => Set<PurchaseCreditNoteLineItem>();

    public DbSet<PurchaseDebitNote> PurchaseDebitNotes => Set<PurchaseDebitNote>();

    public DbSet<PurchaseDebitNoteLineItem> PurchaseDebitNoteItems => Set<PurchaseDebitNoteLineItem>();

    public DbSet<SalesInvoice> SalesInvoices => Set<SalesInvoice>();

    public DbSet<SalesInvoiceLineItem> SalesInvoiceLineItems => Set<SalesInvoiceLineItem>();

    public DbSet<SalesCreditNote> SalesCreditNotes => Set<SalesCreditNote>();

    public DbSet<SalesCreditNoteLineItem> SalesCreditNoteItems => Set<SalesCreditNoteLineItem>();

    public DbSet<SalesDebitNote> SalesDebitNotes => Set<SalesDebitNote>();

    public DbSet<SalesDebitNoteLineItem> SalesDebitNoteItems => Set<SalesDebitNoteLineItem>();

    public DbSet<SalesOrder> SalesOrders => Set<SalesOrder>();

    public DbSet<SalesOrderLineItem> SalesOrderLineItems => Set<SalesOrderLineItem>();

    public DbSet<AppSettings> Settings => Set<AppSettings>();

    public DbSet<StockLedgerEntry> StockLedgerEntries => Set<StockLedgerEntry>();

    public DbSet<InventoryBalance> InventoryBalances => Set<InventoryBalance>();

    public DbSet<FifoLayer> FifoLayers => Set<FifoLayer>();

    public DbSet<GoodsReceiptNote> GoodsReceiptNotes => Set<GoodsReceiptNote>();

    public DbSet<GoodsReceiptNoteItem> GoodsReceiptNoteItems => Set<GoodsReceiptNoteItem>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
    }
}

