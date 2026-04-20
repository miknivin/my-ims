using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddPurchaseInvoices : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "purchase_invoices",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    source_type = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    source_reference_id = table.Column<Guid>(type: "uuid", nullable: true),
                    source_reference_no = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    voucher_type = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    no = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    date = table.Column<DateOnly>(type: "date", nullable: false),
                    due_date = table.Column<DateOnly>(type: "date", nullable: false),
                    ledger_id = table.Column<Guid>(type: "uuid", nullable: true),
                    ledger_name_snapshot = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: true),
                    vendor_id = table.Column<Guid>(type: "uuid", nullable: false),
                    vendor_name_snapshot = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    vendor_address = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    vendor_attention = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: true),
                    vendor_phone = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    payment_mode = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    invoice_no = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: true),
                    lr_no = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: true),
                    currency_id = table.Column<Guid>(type: "uuid", nullable: true),
                    currency_code_snapshot = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    currency_symbol_snapshot = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    balance = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    vendor_products = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    own_products_only = table.Column<bool>(type: "boolean", nullable: false),
                    general_notes = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    search_barcode = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: true),
                    taxable = table.Column<bool>(type: "boolean", nullable: false),
                    tax_application = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    inter_state = table.Column<bool>(type: "boolean", nullable: false),
                    tax_on_foc = table.Column<bool>(type: "boolean", nullable: false),
                    footer_notes = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    total = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    discount = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    addition = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    deduction = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    paid = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    net_total = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    Status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_purchase_invoices", x => x.Id);
                    table.ForeignKey(
                        name: "FK_purchase_invoices_currencies_currency_id",
                        column: x => x.currency_id,
                        principalTable: "currencies",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_purchase_invoices_ledgers_ledger_id",
                        column: x => x.ledger_id,
                        principalTable: "ledgers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_purchase_invoices_vendors_vendor_id",
                        column: x => x.vendor_id,
                        principalTable: "vendors",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "purchase_invoice_additions",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    type = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    ledger_id = table.Column<Guid>(type: "uuid", nullable: true),
                    ledger_name_snapshot = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    amount = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    purchase_invoice_id = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_purchase_invoice_additions", x => x.id);
                    table.ForeignKey(
                        name: "FK_purchase_invoice_additions_ledgers_ledger_id",
                        column: x => x.ledger_id,
                        principalTable: "ledgers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_purchase_invoice_additions_purchase_invoices_purchase_invoi~",
                        column: x => x.purchase_invoice_id,
                        principalTable: "purchase_invoices",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "purchase_invoice_lines",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    PurchaseInvoiceId = table.Column<Guid>(type: "uuid", nullable: false),
                    sno = table.Column<int>(type: "integer", nullable: false),
                    product_code_snapshot = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    foc = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    discount_percent = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    tax_percent = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    tax_amount = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    cost = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    profit_percent = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    profit_amount = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    selling_rate = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    wholesale_rate = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    mrp = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    line_total = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    ProductId = table.Column<Guid>(type: "uuid", nullable: false),
                    product_name_snapshot = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    hsn_code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    Quantity = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    UnitId = table.Column<Guid>(type: "uuid", nullable: false),
                    Rate = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    GrossAmount = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    DiscountAmount = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    TaxableAmount = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    WarehouseId = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_purchase_invoice_lines", x => x.Id);
                    table.ForeignKey(
                        name: "FK_purchase_invoice_lines_products_ProductId",
                        column: x => x.ProductId,
                        principalTable: "products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_purchase_invoice_lines_purchase_invoices_PurchaseInvoiceId",
                        column: x => x.PurchaseInvoiceId,
                        principalTable: "purchase_invoices",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_purchase_invoice_lines_uoms_UnitId",
                        column: x => x.UnitId,
                        principalTable: "uoms",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_purchase_invoice_lines_warehouses_WarehouseId",
                        column: x => x.WarehouseId,
                        principalTable: "warehouses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_purchase_invoice_additions_ledger_id",
                table: "purchase_invoice_additions",
                column: "ledger_id");

            migrationBuilder.CreateIndex(
                name: "IX_purchase_invoice_additions_purchase_invoice_id",
                table: "purchase_invoice_additions",
                column: "purchase_invoice_id");

            migrationBuilder.CreateIndex(
                name: "IX_purchase_invoice_lines_ProductId",
                table: "purchase_invoice_lines",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_purchase_invoice_lines_PurchaseInvoiceId",
                table: "purchase_invoice_lines",
                column: "PurchaseInvoiceId");

            migrationBuilder.CreateIndex(
                name: "IX_purchase_invoice_lines_UnitId",
                table: "purchase_invoice_lines",
                column: "UnitId");

            migrationBuilder.CreateIndex(
                name: "IX_purchase_invoice_lines_WarehouseId",
                table: "purchase_invoice_lines",
                column: "WarehouseId");

            migrationBuilder.CreateIndex(
                name: "IX_purchase_invoices_currency_id",
                table: "purchase_invoices",
                column: "currency_id");

            migrationBuilder.CreateIndex(
                name: "IX_purchase_invoices_ledger_id",
                table: "purchase_invoices",
                column: "ledger_id");

            migrationBuilder.CreateIndex(
                name: "IX_purchase_invoices_no",
                table: "purchase_invoices",
                column: "no",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_purchase_invoices_vendor_id",
                table: "purchase_invoices",
                column: "vendor_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "purchase_invoice_additions");

            migrationBuilder.DropTable(
                name: "purchase_invoice_lines");

            migrationBuilder.DropTable(
                name: "purchase_invoices");
        }
    }
}
