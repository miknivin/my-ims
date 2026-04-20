using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddBillWisePaymentsAndReceipts : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "balance",
                table: "purchase_invoices",
                type: "numeric(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.CreateTable(
                name: "billwise_payments",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    vendor_id = table.Column<Guid>(type: "uuid", nullable: false),
                    vendor_name_snapshot = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    vendor_address = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    vendor_attention = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: true),
                    vendor_phone = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    ledger_id = table.Column<Guid>(type: "uuid", nullable: false),
                    ledger_name_snapshot = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    voucher_type = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    no = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    date = table.Column<DateOnly>(type: "date", nullable: false),
                    reference_no = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: true),
                    instrument_no = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: true),
                    instrument_date = table.Column<DateOnly>(type: "date", nullable: true),
                    notes = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    total_allocated = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    total_discount = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    advance = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    amount = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    created_at_utc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at_utc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_billwise_payments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_billwise_payments_ledgers_ledger_id",
                        column: x => x.ledger_id,
                        principalTable: "ledgers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_billwise_payments_vendors_vendor_id",
                        column: x => x.vendor_id,
                        principalTable: "vendors",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "billwise_receipts",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    customer_id = table.Column<Guid>(type: "uuid", nullable: false),
                    customer_name_snapshot = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    customer_address = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    ledger_id = table.Column<Guid>(type: "uuid", nullable: false),
                    ledger_name_snapshot = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    voucher_type = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    no = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    date = table.Column<DateOnly>(type: "date", nullable: false),
                    reference_no = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: true),
                    instrument_no = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: true),
                    instrument_date = table.Column<DateOnly>(type: "date", nullable: true),
                    notes = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    total_allocated = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    total_discount = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    advance = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    amount = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    created_at_utc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at_utc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_billwise_receipts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_billwise_receipts_customers_customer_id",
                        column: x => x.customer_id,
                        principalTable: "customers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_billwise_receipts_ledgers_ledger_id",
                        column: x => x.ledger_id,
                        principalTable: "ledgers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "billwise_payment_allocations",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    billwise_payment_id = table.Column<Guid>(type: "uuid", nullable: false),
                    purchase_invoice_id = table.Column<Guid>(type: "uuid", nullable: false),
                    sno = table.Column<int>(type: "integer", nullable: false),
                    source_voucher_type = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    source_no = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    source_date = table.Column<DateOnly>(type: "date", nullable: false),
                    source_due_date = table.Column<DateOnly>(type: "date", nullable: true),
                    source_reference_no = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: true),
                    description_snapshot = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    original_amount = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    outstanding_before = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    paid_amount = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    discount_amount = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    outstanding_after = table.Column<decimal>(type: "numeric(18,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_billwise_payment_allocations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_billwise_payment_allocations_billwise_payments_billwise_pay~",
                        column: x => x.billwise_payment_id,
                        principalTable: "billwise_payments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_billwise_payment_allocations_purchase_invoices_purchase_inv~",
                        column: x => x.purchase_invoice_id,
                        principalTable: "purchase_invoices",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "billwise_receipt_allocations",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    billwise_receipt_id = table.Column<Guid>(type: "uuid", nullable: false),
                    sales_invoice_id = table.Column<Guid>(type: "uuid", nullable: false),
                    sno = table.Column<int>(type: "integer", nullable: false),
                    source_voucher_type = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    source_no = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    source_date = table.Column<DateOnly>(type: "date", nullable: false),
                    source_due_date = table.Column<DateOnly>(type: "date", nullable: true),
                    source_reference_no = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: true),
                    description_snapshot = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    original_amount = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    outstanding_before = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    paid_amount = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    discount_amount = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    outstanding_after = table.Column<decimal>(type: "numeric(18,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_billwise_receipt_allocations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_billwise_receipt_allocations_billwise_receipts_billwise_rec~",
                        column: x => x.billwise_receipt_id,
                        principalTable: "billwise_receipts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_billwise_receipt_allocations_sales_invoices_sales_invoice_id",
                        column: x => x.sales_invoice_id,
                        principalTable: "sales_invoices",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_billwise_payment_allocations_billwise_payment_id",
                table: "billwise_payment_allocations",
                column: "billwise_payment_id");

            migrationBuilder.CreateIndex(
                name: "IX_billwise_payment_allocations_purchase_invoice_id",
                table: "billwise_payment_allocations",
                column: "purchase_invoice_id");

            migrationBuilder.CreateIndex(
                name: "IX_billwise_payments_ledger_id",
                table: "billwise_payments",
                column: "ledger_id");

            migrationBuilder.CreateIndex(
                name: "IX_billwise_payments_no",
                table: "billwise_payments",
                column: "no",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_billwise_payments_vendor_id",
                table: "billwise_payments",
                column: "vendor_id");

            migrationBuilder.CreateIndex(
                name: "IX_billwise_receipt_allocations_billwise_receipt_id",
                table: "billwise_receipt_allocations",
                column: "billwise_receipt_id");

            migrationBuilder.CreateIndex(
                name: "IX_billwise_receipt_allocations_sales_invoice_id",
                table: "billwise_receipt_allocations",
                column: "sales_invoice_id");

            migrationBuilder.CreateIndex(
                name: "IX_billwise_receipts_customer_id",
                table: "billwise_receipts",
                column: "customer_id");

            migrationBuilder.CreateIndex(
                name: "IX_billwise_receipts_ledger_id",
                table: "billwise_receipts",
                column: "ledger_id");

            migrationBuilder.CreateIndex(
                name: "IX_billwise_receipts_no",
                table: "billwise_receipts",
                column: "no",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "billwise_payment_allocations");

            migrationBuilder.DropTable(
                name: "billwise_receipt_allocations");

            migrationBuilder.DropTable(
                name: "billwise_payments");

            migrationBuilder.DropTable(
                name: "billwise_receipts");

            migrationBuilder.DropColumn(
                name: "balance",
                table: "purchase_invoices");
        }
    }
}
