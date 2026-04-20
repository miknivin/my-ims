using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AdjustSalesInvoiceInventorySnapshots : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "valuation_method",
                table: "sales_invoices");

            migrationBuilder.RenameColumn(
                name: "profit_amount",
                table: "sales_invoice_lines",
                newName: "gross_profit_amount");

            migrationBuilder.RenameColumn(
                name: "cost",
                table: "sales_invoice_lines",
                newName: "cost_rate");

            migrationBuilder.AddColumn<decimal>(
                name: "cogs_amount",
                table: "sales_invoice_lines",
                type: "numeric(18,2)",
                nullable: false,
                defaultValue: 0m);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "cogs_amount",
                table: "sales_invoice_lines");

            migrationBuilder.RenameColumn(
                name: "gross_profit_amount",
                table: "sales_invoice_lines",
                newName: "profit_amount");

            migrationBuilder.RenameColumn(
                name: "cost_rate",
                table: "sales_invoice_lines",
                newName: "cost");

            migrationBuilder.AddColumn<string>(
                name: "valuation_method",
                table: "sales_invoices",
                type: "character varying(10)",
                maxLength: 10,
                nullable: false,
                defaultValue: "");
        }
    }
}
