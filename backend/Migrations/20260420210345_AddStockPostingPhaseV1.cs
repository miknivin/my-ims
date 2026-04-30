using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddStockPostingPhaseV1 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "source_line_id",
                table: "stock_ledger_entries",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "source_line_id",
                table: "fifo_layers",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "inventory_layer_consumptions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    IssueStockLedgerEntryId = table.Column<Guid>(type: "uuid", nullable: false),
                    FifoLayerId = table.Column<Guid>(type: "uuid", nullable: false),
                    Quantity = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    Rate = table.Column<decimal>(type: "numeric(18,4)", nullable: false),
                    Value = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    created_at_utc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_inventory_layer_consumptions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_inventory_layer_consumptions_fifo_layers_FifoLayerId",
                        column: x => x.FifoLayerId,
                        principalTable: "fifo_layers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_inventory_layer_consumptions_stock_ledger_entries_IssueStoc~",
                        column: x => x.IssueStockLedgerEntryId,
                        principalTable: "stock_ledger_entries",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "inventory_layer_revaluations",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    StockLedgerEntryId = table.Column<Guid>(type: "uuid", nullable: false),
                    FifoLayerId = table.Column<Guid>(type: "uuid", nullable: false),
                    QuantityAtRevaluation = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    PreviousRate = table.Column<decimal>(type: "numeric(18,4)", nullable: false),
                    NewRate = table.Column<decimal>(type: "numeric(18,4)", nullable: false),
                    ValueDelta = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    created_at_utc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_inventory_layer_revaluations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_inventory_layer_revaluations_fifo_layers_FifoLayerId",
                        column: x => x.FifoLayerId,
                        principalTable: "fifo_layers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_inventory_layer_revaluations_stock_ledger_entries_StockLedg~",
                        column: x => x.StockLedgerEntryId,
                        principalTable: "stock_ledger_entries",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_stock_ledger_entries_SourceType_SourceId_source_line_id",
                table: "stock_ledger_entries",
                columns: new[] { "SourceType", "SourceId", "source_line_id" });

            migrationBuilder.CreateIndex(
                name: "IX_fifo_layers_SourceType_SourceId_source_line_id",
                table: "fifo_layers",
                columns: new[] { "SourceType", "SourceId", "source_line_id" });

            migrationBuilder.CreateIndex(
                name: "IX_inventory_layer_consumptions_FifoLayerId",
                table: "inventory_layer_consumptions",
                column: "FifoLayerId");

            migrationBuilder.CreateIndex(
                name: "IX_inventory_layer_consumptions_IssueStockLedgerEntryId",
                table: "inventory_layer_consumptions",
                column: "IssueStockLedgerEntryId");

            migrationBuilder.CreateIndex(
                name: "IX_inventory_layer_revaluations_FifoLayerId",
                table: "inventory_layer_revaluations",
                column: "FifoLayerId");

            migrationBuilder.CreateIndex(
                name: "IX_inventory_layer_revaluations_StockLedgerEntryId",
                table: "inventory_layer_revaluations",
                column: "StockLedgerEntryId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "inventory_layer_consumptions");

            migrationBuilder.DropTable(
                name: "inventory_layer_revaluations");

            migrationBuilder.DropIndex(
                name: "IX_stock_ledger_entries_SourceType_SourceId_source_line_id",
                table: "stock_ledger_entries");

            migrationBuilder.DropIndex(
                name: "IX_fifo_layers_SourceType_SourceId_source_line_id",
                table: "fifo_layers");

            migrationBuilder.DropColumn(
                name: "source_line_id",
                table: "stock_ledger_entries");

            migrationBuilder.DropColumn(
                name: "source_line_id",
                table: "fifo_layers");
        }
    }
}
