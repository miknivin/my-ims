using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class UpdatePurchaseInvoiceContract : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_purchase_invoices_ledgers_ledger_id",
                table: "purchase_invoices");

            migrationBuilder.DropIndex(
                name: "IX_purchase_invoices_ledger_id",
                table: "purchase_invoices");

            migrationBuilder.DropColumn(
                name: "balance",
                table: "purchase_invoices");

            migrationBuilder.DropColumn(
                name: "ledger_id",
                table: "purchase_invoices");

            migrationBuilder.DropColumn(
                name: "ledger_name_snapshot",
                table: "purchase_invoices");

            migrationBuilder.DropColumn(
                name: "paid",
                table: "purchase_invoices");

            migrationBuilder.DropColumn(
                name: "voucher_type",
                table: "purchase_invoices");

            migrationBuilder.RenameColumn(
                name: "Status",
                table: "purchase_invoices",
                newName: "status");

            migrationBuilder.RenameColumn(
                name: "invoice_no",
                table: "purchase_invoices",
                newName: "supplier_invoice_no");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "status",
                table: "purchase_invoices",
                newName: "Status");

            migrationBuilder.RenameColumn(
                name: "supplier_invoice_no",
                table: "purchase_invoices",
                newName: "invoice_no");

            migrationBuilder.AddColumn<decimal>(
                name: "balance",
                table: "purchase_invoices",
                type: "numeric(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<Guid>(
                name: "ledger_id",
                table: "purchase_invoices",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ledger_name_snapshot",
                table: "purchase_invoices",
                type: "character varying(150)",
                maxLength: 150,
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "paid",
                table: "purchase_invoices",
                type: "numeric(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<string>(
                name: "voucher_type",
                table: "purchase_invoices",
                type: "character varying(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_purchase_invoices_ledger_id",
                table: "purchase_invoices",
                column: "ledger_id");

            migrationBuilder.AddForeignKey(
                name: "FK_purchase_invoices_ledgers_ledger_id",
                table: "purchase_invoices",
                column: "ledger_id",
                principalTable: "ledgers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
