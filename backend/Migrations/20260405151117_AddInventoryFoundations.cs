using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddInventoryFoundations : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "fifo_layers",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ItemId = table.Column<Guid>(type: "uuid", nullable: false),
                    WarehouseId = table.Column<Guid>(type: "uuid", nullable: false),
                    SourceType = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    SourceId = table.Column<Guid>(type: "uuid", nullable: false),
                    OriginalQuantity = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    RemainingQuantity = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    Rate = table.Column<decimal>(type: "numeric(18,4)", nullable: false),
                    PostingDateUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_fifo_layers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_fifo_layers_products_ItemId",
                        column: x => x.ItemId,
                        principalTable: "products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_fifo_layers_warehouses_WarehouseId",
                        column: x => x.WarehouseId,
                        principalTable: "warehouses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "inventory_balances",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ItemId = table.Column<Guid>(type: "uuid", nullable: false),
                    WarehouseId = table.Column<Guid>(type: "uuid", nullable: false),
                    QuantityOnHand = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    TotalValue = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    ValuationRate = table.Column<decimal>(type: "numeric(18,4)", nullable: false),
                    LastUpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_inventory_balances", x => x.Id);
                    table.ForeignKey(
                        name: "FK_inventory_balances_products_ItemId",
                        column: x => x.ItemId,
                        principalTable: "products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_inventory_balances_warehouses_WarehouseId",
                        column: x => x.WarehouseId,
                        principalTable: "warehouses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "stock_ledger_entries",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ItemId = table.Column<Guid>(type: "uuid", nullable: false),
                    WarehouseId = table.Column<Guid>(type: "uuid", nullable: false),
                    QuantityChange = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    ValuationRate = table.Column<decimal>(type: "numeric(18,4)", nullable: false),
                    ValueChange = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    MovementType = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    SourceType = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    SourceId = table.Column<Guid>(type: "uuid", nullable: false),
                    PostingDateUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    BalanceQuantity = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    BalanceValue = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    Remarks = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_stock_ledger_entries", x => x.Id);
                    table.ForeignKey(
                        name: "FK_stock_ledger_entries_products_ItemId",
                        column: x => x.ItemId,
                        principalTable: "products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_stock_ledger_entries_warehouses_WarehouseId",
                        column: x => x.WarehouseId,
                        principalTable: "warehouses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_fifo_layers_ItemId_WarehouseId_PostingDateUtc",
                table: "fifo_layers",
                columns: new[] { "ItemId", "WarehouseId", "PostingDateUtc" });

            migrationBuilder.CreateIndex(
                name: "IX_fifo_layers_SourceType_SourceId",
                table: "fifo_layers",
                columns: new[] { "SourceType", "SourceId" });

            migrationBuilder.CreateIndex(
                name: "IX_fifo_layers_WarehouseId",
                table: "fifo_layers",
                column: "WarehouseId");

            migrationBuilder.CreateIndex(
                name: "IX_inventory_balances_ItemId_WarehouseId",
                table: "inventory_balances",
                columns: new[] { "ItemId", "WarehouseId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_inventory_balances_WarehouseId",
                table: "inventory_balances",
                column: "WarehouseId");

            migrationBuilder.CreateIndex(
                name: "IX_stock_ledger_entries_ItemId_WarehouseId_PostingDateUtc",
                table: "stock_ledger_entries",
                columns: new[] { "ItemId", "WarehouseId", "PostingDateUtc" });

            migrationBuilder.CreateIndex(
                name: "IX_stock_ledger_entries_SourceType_SourceId",
                table: "stock_ledger_entries",
                columns: new[] { "SourceType", "SourceId" });

            migrationBuilder.CreateIndex(
                name: "IX_stock_ledger_entries_WarehouseId",
                table: "stock_ledger_entries",
                column: "WarehouseId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "fifo_layers");

            migrationBuilder.DropTable(
                name: "inventory_balances");

            migrationBuilder.DropTable(
                name: "stock_ledger_entries");
        }
    }
}
