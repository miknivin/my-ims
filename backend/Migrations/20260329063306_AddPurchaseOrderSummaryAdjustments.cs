using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddPurchaseOrderSummaryAdjustments : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "remarks",
                table: "purchase_orders",
                type: "character varying(2000)",
                maxLength: 2000,
                nullable: true);

            migrationBuilder.CreateTable(
                name: "purchase_order_additions",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    type = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    ledger_id = table.Column<Guid>(type: "uuid", nullable: true),
                    ledger_name_snapshot = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    amount = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    purchase_order_id = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_purchase_order_additions", x => x.id);
                    table.ForeignKey(
                        name: "FK_purchase_order_additions_ledgers_ledger_id",
                        column: x => x.ledger_id,
                        principalTable: "ledgers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_purchase_order_additions_purchase_orders_purchase_order_id",
                        column: x => x.purchase_order_id,
                        principalTable: "purchase_orders",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_purchase_order_additions_ledger_id",
                table: "purchase_order_additions",
                column: "ledger_id");

            migrationBuilder.CreateIndex(
                name: "IX_purchase_order_additions_purchase_order_id",
                table: "purchase_order_additions",
                column: "purchase_order_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "purchase_order_additions");

            migrationBuilder.DropColumn(
                name: "remarks",
                table: "purchase_orders");
        }
    }
}
