using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddPurchaseOrderTransactions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "discounts",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Code = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Name = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    Description = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: true),
                    Type = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Value = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    Status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_discounts", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "purchase_orders",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    voucher_type = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    no = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    date = table.Column<DateOnly>(type: "date", nullable: false),
                    due_date = table.Column<DateOnly>(type: "date", nullable: false),
                    delivery_date = table.Column<DateOnly>(type: "date", nullable: false),
                    vendor_id = table.Column<Guid>(type: "uuid", nullable: false),
                    vendor_name_snapshot = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    vendor_address = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    vendor_attention = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: true),
                    vendor_phone = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    payment_mode = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    credit_limit = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    currency_id = table.Column<Guid>(type: "uuid", nullable: true),
                    currency_label_snapshot = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: true),
                    balance = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    delivery_warehouse_id = table.Column<Guid>(type: "uuid", nullable: true),
                    delivery_warehouse_name_snapshot = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: true),
                    delivery_address = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    delivery_attention = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: true),
                    delivery_phone = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    vendor_products = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    own_products_only = table.Column<bool>(type: "boolean", nullable: false),
                    reference = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: true),
                    mr_no = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: true),
                    notes = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    taxable = table.Column<bool>(type: "boolean", nullable: false),
                    addition = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    advance = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    total = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    discount = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    tax = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    net_total = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    Status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_purchase_orders", x => x.Id);
                    table.ForeignKey(
                        name: "FK_purchase_orders_currencies_currency_id",
                        column: x => x.currency_id,
                        principalTable: "currencies",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_purchase_orders_vendors_vendor_id",
                        column: x => x.vendor_id,
                        principalTable: "vendors",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_purchase_orders_warehouses_delivery_warehouse_id",
                        column: x => x.delivery_warehouse_id,
                        principalTable: "warehouses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "purchase_order_lines",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    PurchaseOrderId = table.Column<Guid>(type: "uuid", nullable: false),
                    ItemId = table.Column<Guid>(type: "uuid", nullable: false),
                    ItemNameSnapshot = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    HsnCode = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    Quantity = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    UnitId = table.Column<Guid>(type: "uuid", nullable: false),
                    Rate = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    GrossAmount = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    DiscountType = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    DiscountValue = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    DiscountAmount = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    TaxableAmount = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    CgstRate = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    CgstAmount = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    SgstRate = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    SgstAmount = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    IgstRate = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    IgstAmount = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    LineTotal = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    WarehouseId = table.Column<Guid>(type: "uuid", nullable: true),
                    ReceivedQty = table.Column<decimal>(type: "numeric(18,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_purchase_order_lines", x => x.Id);
                    table.ForeignKey(
                        name: "FK_purchase_order_lines_products_ItemId",
                        column: x => x.ItemId,
                        principalTable: "products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_purchase_order_lines_purchase_orders_PurchaseOrderId",
                        column: x => x.PurchaseOrderId,
                        principalTable: "purchase_orders",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_purchase_order_lines_uoms_UnitId",
                        column: x => x.UnitId,
                        principalTable: "uoms",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_purchase_order_lines_warehouses_WarehouseId",
                        column: x => x.WarehouseId,
                        principalTable: "warehouses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_discounts_Code",
                table: "discounts",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_discounts_Name",
                table: "discounts",
                column: "Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_purchase_order_lines_ItemId",
                table: "purchase_order_lines",
                column: "ItemId");

            migrationBuilder.CreateIndex(
                name: "IX_purchase_order_lines_PurchaseOrderId",
                table: "purchase_order_lines",
                column: "PurchaseOrderId");

            migrationBuilder.CreateIndex(
                name: "IX_purchase_order_lines_UnitId",
                table: "purchase_order_lines",
                column: "UnitId");

            migrationBuilder.CreateIndex(
                name: "IX_purchase_order_lines_WarehouseId",
                table: "purchase_order_lines",
                column: "WarehouseId");

            migrationBuilder.CreateIndex(
                name: "IX_purchase_orders_currency_id",
                table: "purchase_orders",
                column: "currency_id");

            migrationBuilder.CreateIndex(
                name: "IX_purchase_orders_delivery_warehouse_id",
                table: "purchase_orders",
                column: "delivery_warehouse_id");

            migrationBuilder.CreateIndex(
                name: "IX_purchase_orders_no",
                table: "purchase_orders",
                column: "no",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_purchase_orders_vendor_id",
                table: "purchase_orders",
                column: "vendor_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "discounts");

            migrationBuilder.DropTable(
                name: "purchase_order_lines");

            migrationBuilder.DropTable(
                name: "purchase_orders");
        }
    }
}
