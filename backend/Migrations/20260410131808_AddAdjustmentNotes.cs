using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddAdjustmentNotes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "purchase_credit_notes",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    source_reference_id = table.Column<Guid>(type: "uuid", nullable: true),
                    source_reference_no = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    voucher_type = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    no = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    date = table.Column<DateOnly>(type: "date", nullable: false),
                    due_date = table.Column<DateOnly>(type: "date", nullable: false),
                    vendor_id = table.Column<Guid>(type: "uuid", nullable: false),
                    vendor_name_snapshot = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    vendor_address = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    vendor_attention = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: true),
                    vendor_phone = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    payment_mode = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    supplier_invoice_no = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: true),
                    lr_no = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: true),
                    currency_id = table.Column<Guid>(type: "uuid", nullable: true),
                    currency_code_snapshot = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    currency_symbol_snapshot = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
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
                    net_total = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    note_nature = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false),
                    status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_purchase_credit_notes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_purchase_credit_notes_currencies_currency_id",
                        column: x => x.currency_id,
                        principalTable: "currencies",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_purchase_credit_notes_vendors_vendor_id",
                        column: x => x.vendor_id,
                        principalTable: "vendors",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "purchase_debit_notes",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    source_reference_id = table.Column<Guid>(type: "uuid", nullable: true),
                    source_reference_no = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    voucher_type = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    no = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    date = table.Column<DateOnly>(type: "date", nullable: false),
                    due_date = table.Column<DateOnly>(type: "date", nullable: false),
                    vendor_id = table.Column<Guid>(type: "uuid", nullable: false),
                    vendor_name_snapshot = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    vendor_address = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    vendor_attention = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: true),
                    vendor_phone = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    payment_mode = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    supplier_invoice_no = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: true),
                    lr_no = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: true),
                    currency_id = table.Column<Guid>(type: "uuid", nullable: true),
                    currency_code_snapshot = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    currency_symbol_snapshot = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
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
                    net_total = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    note_nature = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false),
                    status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_purchase_debit_notes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_purchase_debit_notes_currencies_currency_id",
                        column: x => x.currency_id,
                        principalTable: "currencies",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_purchase_debit_notes_vendors_vendor_id",
                        column: x => x.vendor_id,
                        principalTable: "vendors",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "sales_credit_notes",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    source_reference_id = table.Column<Guid>(type: "uuid", nullable: true),
                    source_reference_no = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    voucher_type = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    no = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    date = table.Column<DateOnly>(type: "date", nullable: false),
                    due_date = table.Column<DateOnly>(type: "date", nullable: false),
                    customer_id = table.Column<Guid>(type: "uuid", nullable: false),
                    customer_name_snapshot = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    customer_address = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    payment_mode = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    invoice_no = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: true),
                    lr_no = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: true),
                    currency_id = table.Column<Guid>(type: "uuid", nullable: true),
                    currency_code_snapshot = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    currency_symbol_snapshot = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    balance = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    general_notes = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    taxable = table.Column<bool>(type: "boolean", nullable: false),
                    tax_application = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    inter_state = table.Column<bool>(type: "boolean", nullable: false),
                    footer_notes = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    total = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    addition = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    deduction = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    paid = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    net_total = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    note_nature = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false),
                    status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_sales_credit_notes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_sales_credit_notes_currencies_currency_id",
                        column: x => x.currency_id,
                        principalTable: "currencies",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_sales_credit_notes_customers_customer_id",
                        column: x => x.customer_id,
                        principalTable: "customers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "sales_debit_notes",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    source_reference_id = table.Column<Guid>(type: "uuid", nullable: true),
                    source_reference_no = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    voucher_type = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    no = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    date = table.Column<DateOnly>(type: "date", nullable: false),
                    due_date = table.Column<DateOnly>(type: "date", nullable: false),
                    customer_id = table.Column<Guid>(type: "uuid", nullable: false),
                    customer_name_snapshot = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    customer_address = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    payment_mode = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    invoice_no = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: true),
                    lr_no = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: true),
                    currency_id = table.Column<Guid>(type: "uuid", nullable: true),
                    currency_code_snapshot = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    currency_symbol_snapshot = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    balance = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    general_notes = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    taxable = table.Column<bool>(type: "boolean", nullable: false),
                    tax_application = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    inter_state = table.Column<bool>(type: "boolean", nullable: false),
                    footer_notes = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    total = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    addition = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    deduction = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    paid = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    net_total = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    note_nature = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false),
                    status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_sales_debit_notes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_sales_debit_notes_currencies_currency_id",
                        column: x => x.currency_id,
                        principalTable: "currencies",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_sales_debit_notes_customers_customer_id",
                        column: x => x.customer_id,
                        principalTable: "customers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "purchase_credit_note_additions",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    type = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    ledger_id = table.Column<Guid>(type: "uuid", nullable: true),
                    ledger_name_snapshot = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    amount = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    purchase_credit_note_id = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_purchase_credit_note_additions", x => x.id);
                    table.ForeignKey(
                        name: "FK_purchase_credit_note_additions_ledgers_ledger_id",
                        column: x => x.ledger_id,
                        principalTable: "ledgers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_purchase_credit_note_additions_purchase_credit_notes_purcha~",
                        column: x => x.purchase_credit_note_id,
                        principalTable: "purchase_credit_notes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "purchase_credit_note_lines",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    PurchaseCreditNoteId = table.Column<Guid>(type: "uuid", nullable: false),
                    source_line_id = table.Column<Guid>(type: "uuid", nullable: false),
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
                    table.PrimaryKey("PK_purchase_credit_note_lines", x => x.Id);
                    table.ForeignKey(
                        name: "FK_purchase_credit_note_lines_products_ProductId",
                        column: x => x.ProductId,
                        principalTable: "products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_purchase_credit_note_lines_purchase_credit_notes_PurchaseCr~",
                        column: x => x.PurchaseCreditNoteId,
                        principalTable: "purchase_credit_notes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_purchase_credit_note_lines_uoms_UnitId",
                        column: x => x.UnitId,
                        principalTable: "uoms",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_purchase_credit_note_lines_warehouses_WarehouseId",
                        column: x => x.WarehouseId,
                        principalTable: "warehouses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "purchase_debit_note_additions",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    type = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    ledger_id = table.Column<Guid>(type: "uuid", nullable: true),
                    ledger_name_snapshot = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    amount = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    purchase_debit_note_id = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_purchase_debit_note_additions", x => x.id);
                    table.ForeignKey(
                        name: "FK_purchase_debit_note_additions_ledgers_ledger_id",
                        column: x => x.ledger_id,
                        principalTable: "ledgers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_purchase_debit_note_additions_purchase_debit_notes_purchase~",
                        column: x => x.purchase_debit_note_id,
                        principalTable: "purchase_debit_notes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "purchase_debit_note_lines",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    PurchaseDebitNoteId = table.Column<Guid>(type: "uuid", nullable: false),
                    source_line_id = table.Column<Guid>(type: "uuid", nullable: false),
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
                    table.PrimaryKey("PK_purchase_debit_note_lines", x => x.Id);
                    table.ForeignKey(
                        name: "FK_purchase_debit_note_lines_products_ProductId",
                        column: x => x.ProductId,
                        principalTable: "products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_purchase_debit_note_lines_purchase_debit_notes_PurchaseDebi~",
                        column: x => x.PurchaseDebitNoteId,
                        principalTable: "purchase_debit_notes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_purchase_debit_note_lines_uoms_UnitId",
                        column: x => x.UnitId,
                        principalTable: "uoms",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_purchase_debit_note_lines_warehouses_WarehouseId",
                        column: x => x.WarehouseId,
                        principalTable: "warehouses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "sales_credit_note_additions",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    type = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    ledger_id = table.Column<Guid>(type: "uuid", nullable: true),
                    ledger_name_snapshot = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    amount = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    sales_credit_note_id = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_sales_credit_note_additions", x => x.id);
                    table.ForeignKey(
                        name: "FK_sales_credit_note_additions_ledgers_ledger_id",
                        column: x => x.ledger_id,
                        principalTable: "ledgers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_sales_credit_note_additions_sales_credit_notes_sales_credit~",
                        column: x => x.sales_credit_note_id,
                        principalTable: "sales_credit_notes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "sales_credit_note_lines",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    SalesCreditNoteId = table.Column<Guid>(type: "uuid", nullable: false),
                    source_line_id = table.Column<Guid>(type: "uuid", nullable: false),
                    sno = table.Column<int>(type: "integer", nullable: false),
                    product_code_snapshot = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    discount_percent = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    tax_percent = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    tax_amount = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    cost_rate = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    cogs_amount = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    gross_profit_amount = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
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
                    table.PrimaryKey("PK_sales_credit_note_lines", x => x.Id);
                    table.ForeignKey(
                        name: "FK_sales_credit_note_lines_products_ProductId",
                        column: x => x.ProductId,
                        principalTable: "products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_sales_credit_note_lines_sales_credit_notes_SalesCreditNoteId",
                        column: x => x.SalesCreditNoteId,
                        principalTable: "sales_credit_notes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_sales_credit_note_lines_uoms_UnitId",
                        column: x => x.UnitId,
                        principalTable: "uoms",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_sales_credit_note_lines_warehouses_WarehouseId",
                        column: x => x.WarehouseId,
                        principalTable: "warehouses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "sales_debit_note_additions",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    type = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    ledger_id = table.Column<Guid>(type: "uuid", nullable: true),
                    ledger_name_snapshot = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    amount = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    sales_debit_note_id = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_sales_debit_note_additions", x => x.id);
                    table.ForeignKey(
                        name: "FK_sales_debit_note_additions_ledgers_ledger_id",
                        column: x => x.ledger_id,
                        principalTable: "ledgers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_sales_debit_note_additions_sales_debit_notes_sales_debit_no~",
                        column: x => x.sales_debit_note_id,
                        principalTable: "sales_debit_notes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "sales_debit_note_lines",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    SalesDebitNoteId = table.Column<Guid>(type: "uuid", nullable: false),
                    source_line_id = table.Column<Guid>(type: "uuid", nullable: false),
                    sno = table.Column<int>(type: "integer", nullable: false),
                    product_code_snapshot = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    discount_percent = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    tax_percent = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    tax_amount = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    cost_rate = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    cogs_amount = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    gross_profit_amount = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
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
                    table.PrimaryKey("PK_sales_debit_note_lines", x => x.Id);
                    table.ForeignKey(
                        name: "FK_sales_debit_note_lines_products_ProductId",
                        column: x => x.ProductId,
                        principalTable: "products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_sales_debit_note_lines_sales_debit_notes_SalesDebitNoteId",
                        column: x => x.SalesDebitNoteId,
                        principalTable: "sales_debit_notes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_sales_debit_note_lines_uoms_UnitId",
                        column: x => x.UnitId,
                        principalTable: "uoms",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_sales_debit_note_lines_warehouses_WarehouseId",
                        column: x => x.WarehouseId,
                        principalTable: "warehouses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_purchase_credit_note_additions_ledger_id",
                table: "purchase_credit_note_additions",
                column: "ledger_id");

            migrationBuilder.CreateIndex(
                name: "IX_purchase_credit_note_additions_purchase_credit_note_id",
                table: "purchase_credit_note_additions",
                column: "purchase_credit_note_id");

            migrationBuilder.CreateIndex(
                name: "IX_purchase_credit_note_lines_ProductId",
                table: "purchase_credit_note_lines",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_purchase_credit_note_lines_PurchaseCreditNoteId",
                table: "purchase_credit_note_lines",
                column: "PurchaseCreditNoteId");

            migrationBuilder.CreateIndex(
                name: "IX_purchase_credit_note_lines_UnitId",
                table: "purchase_credit_note_lines",
                column: "UnitId");

            migrationBuilder.CreateIndex(
                name: "IX_purchase_credit_note_lines_WarehouseId",
                table: "purchase_credit_note_lines",
                column: "WarehouseId");

            migrationBuilder.CreateIndex(
                name: "IX_purchase_credit_notes_currency_id",
                table: "purchase_credit_notes",
                column: "currency_id");

            migrationBuilder.CreateIndex(
                name: "IX_purchase_credit_notes_no",
                table: "purchase_credit_notes",
                column: "no",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_purchase_credit_notes_vendor_id",
                table: "purchase_credit_notes",
                column: "vendor_id");

            migrationBuilder.CreateIndex(
                name: "IX_purchase_debit_note_additions_ledger_id",
                table: "purchase_debit_note_additions",
                column: "ledger_id");

            migrationBuilder.CreateIndex(
                name: "IX_purchase_debit_note_additions_purchase_debit_note_id",
                table: "purchase_debit_note_additions",
                column: "purchase_debit_note_id");

            migrationBuilder.CreateIndex(
                name: "IX_purchase_debit_note_lines_ProductId",
                table: "purchase_debit_note_lines",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_purchase_debit_note_lines_PurchaseDebitNoteId",
                table: "purchase_debit_note_lines",
                column: "PurchaseDebitNoteId");

            migrationBuilder.CreateIndex(
                name: "IX_purchase_debit_note_lines_UnitId",
                table: "purchase_debit_note_lines",
                column: "UnitId");

            migrationBuilder.CreateIndex(
                name: "IX_purchase_debit_note_lines_WarehouseId",
                table: "purchase_debit_note_lines",
                column: "WarehouseId");

            migrationBuilder.CreateIndex(
                name: "IX_purchase_debit_notes_currency_id",
                table: "purchase_debit_notes",
                column: "currency_id");

            migrationBuilder.CreateIndex(
                name: "IX_purchase_debit_notes_no",
                table: "purchase_debit_notes",
                column: "no",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_purchase_debit_notes_vendor_id",
                table: "purchase_debit_notes",
                column: "vendor_id");

            migrationBuilder.CreateIndex(
                name: "IX_sales_credit_note_additions_ledger_id",
                table: "sales_credit_note_additions",
                column: "ledger_id");

            migrationBuilder.CreateIndex(
                name: "IX_sales_credit_note_additions_sales_credit_note_id",
                table: "sales_credit_note_additions",
                column: "sales_credit_note_id");

            migrationBuilder.CreateIndex(
                name: "IX_sales_credit_note_lines_ProductId",
                table: "sales_credit_note_lines",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_sales_credit_note_lines_SalesCreditNoteId",
                table: "sales_credit_note_lines",
                column: "SalesCreditNoteId");

            migrationBuilder.CreateIndex(
                name: "IX_sales_credit_note_lines_UnitId",
                table: "sales_credit_note_lines",
                column: "UnitId");

            migrationBuilder.CreateIndex(
                name: "IX_sales_credit_note_lines_WarehouseId",
                table: "sales_credit_note_lines",
                column: "WarehouseId");

            migrationBuilder.CreateIndex(
                name: "IX_sales_credit_notes_currency_id",
                table: "sales_credit_notes",
                column: "currency_id");

            migrationBuilder.CreateIndex(
                name: "IX_sales_credit_notes_customer_id",
                table: "sales_credit_notes",
                column: "customer_id");

            migrationBuilder.CreateIndex(
                name: "IX_sales_credit_notes_no",
                table: "sales_credit_notes",
                column: "no",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_sales_debit_note_additions_ledger_id",
                table: "sales_debit_note_additions",
                column: "ledger_id");

            migrationBuilder.CreateIndex(
                name: "IX_sales_debit_note_additions_sales_debit_note_id",
                table: "sales_debit_note_additions",
                column: "sales_debit_note_id");

            migrationBuilder.CreateIndex(
                name: "IX_sales_debit_note_lines_ProductId",
                table: "sales_debit_note_lines",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_sales_debit_note_lines_SalesDebitNoteId",
                table: "sales_debit_note_lines",
                column: "SalesDebitNoteId");

            migrationBuilder.CreateIndex(
                name: "IX_sales_debit_note_lines_UnitId",
                table: "sales_debit_note_lines",
                column: "UnitId");

            migrationBuilder.CreateIndex(
                name: "IX_sales_debit_note_lines_WarehouseId",
                table: "sales_debit_note_lines",
                column: "WarehouseId");

            migrationBuilder.CreateIndex(
                name: "IX_sales_debit_notes_currency_id",
                table: "sales_debit_notes",
                column: "currency_id");

            migrationBuilder.CreateIndex(
                name: "IX_sales_debit_notes_customer_id",
                table: "sales_debit_notes",
                column: "customer_id");

            migrationBuilder.CreateIndex(
                name: "IX_sales_debit_notes_no",
                table: "sales_debit_notes",
                column: "no",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "purchase_credit_note_additions");

            migrationBuilder.DropTable(
                name: "purchase_credit_note_lines");

            migrationBuilder.DropTable(
                name: "purchase_debit_note_additions");

            migrationBuilder.DropTable(
                name: "purchase_debit_note_lines");

            migrationBuilder.DropTable(
                name: "sales_credit_note_additions");

            migrationBuilder.DropTable(
                name: "sales_credit_note_lines");

            migrationBuilder.DropTable(
                name: "sales_debit_note_additions");

            migrationBuilder.DropTable(
                name: "sales_debit_note_lines");

            migrationBuilder.DropTable(
                name: "purchase_credit_notes");

            migrationBuilder.DropTable(
                name: "purchase_debit_notes");

            migrationBuilder.DropTable(
                name: "sales_credit_notes");

            migrationBuilder.DropTable(
                name: "sales_debit_notes");
        }
    }
}
