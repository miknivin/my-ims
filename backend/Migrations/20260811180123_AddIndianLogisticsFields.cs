using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddIndianLogisticsFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "e_way_bill_no",
                table: "goods_receipt_notes",
                type: "character varying(20)",
                maxLength: 20,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "e_way_bill_no",
                table: "delivery_notes",
                type: "character varying(20)",
                maxLength: 20,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "transporter_name",
                table: "delivery_notes",
                type: "character varying(150)",
                maxLength: 150,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "e_way_bill_no",
                table: "goods_receipt_notes");

            migrationBuilder.DropColumn(
                name: "e_way_bill_no",
                table: "delivery_notes");

            migrationBuilder.DropColumn(
                name: "transporter_name",
                table: "delivery_notes");
        }
    }
}
