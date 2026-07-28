using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddSalesInvoiceExtendedFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "customer_gstin_snapshot",
                table: "sales_invoices",
                type: "character varying(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "customer_shipping_address",
                table: "sales_invoices",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "salesperson_name",
                table: "sales_invoices",
                type: "character varying(150)",
                maxLength: 150,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "customer_gstin_snapshot",
                table: "sales_invoices");

            migrationBuilder.DropColumn(
                name: "customer_shipping_address",
                table: "sales_invoices");

            migrationBuilder.DropColumn(
                name: "salesperson_name",
                table: "sales_invoices");
        }
    }
}
