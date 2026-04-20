using backend.Features.Masters.Products;
using backend.Features.Masters.Uoms;
using backend.Features.Masters.Warehouses;

namespace backend.Features.Transactions;

public abstract class LineItemBase
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid ProductId { get; set; }
    public Product? Product { get; set; }
    public string ProductNameSnapshot { get; set; } = string.Empty;
    public string? HsnCode { get; set; }
    public decimal Quantity { get; set; }
    public Guid UnitId { get; set; }
    public Uom? Unit { get; set; }
    public decimal Rate { get; set; }
    public decimal GrossAmount { get; set; }
    public decimal DiscountAmount { get; set; }
    public decimal TaxableAmount { get; set; }
    public Guid? WarehouseId { get; set; }
    public Warehouse? Warehouse { get; set; }
}
