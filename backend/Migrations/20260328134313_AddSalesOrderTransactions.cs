using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddSalesOrderTransactions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_purchase_order_lines_products_ItemId",
                table: "purchase_order_lines");

            migrationBuilder.RenameColumn(
                name: "ItemNameSnapshot",
                table: "purchase_order_lines",
                newName: "item_name_snapshot");

            migrationBuilder.RenameColumn(
                name: "ItemId",
                table: "purchase_order_lines",
                newName: "ProductId");

            migrationBuilder.RenameIndex(
                name: "IX_purchase_order_lines_ItemId",
                table: "purchase_order_lines",
                newName: "IX_purchase_order_lines_ProductId");

            migrationBuilder.CreateTable(
                name: "sales_orders",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    voucher_type = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    no = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    date = table.Column<DateOnly>(type: "date", nullable: false),
                    delivery_date = table.Column<DateOnly>(type: "date", nullable: true),
                    customer_id = table.Column<Guid>(type: "uuid", nullable: false),
                    customer_name_snapshot = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    customer_code_snapshot = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    customer_address = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    customer_attention = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: true),
                    rate_level = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    currency_id = table.Column<Guid>(type: "uuid", nullable: true),
                    currency_code_snapshot = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    currency_symbol_snapshot = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    credit_limit = table.Column<decimal>(type: "numeric(18,2)", nullable: true),
                    is_inter_state = table.Column<bool>(type: "boolean", nullable: false),
                    tax_application = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    sales_man_id = table.Column<Guid>(type: "uuid", nullable: true),
                    sales_man_name_snapshot = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: true),
                    vehicle_no = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    total = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    discount = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    freight = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    so_advance = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    round_off = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    net_total = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    balance = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    remarks = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    Status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    CreatedById = table.Column<Guid>(type: "uuid", nullable: false),
                    UpdatedById = table.Column<Guid>(type: "uuid", nullable: true),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_sales_orders", x => x.Id);
                    table.ForeignKey(
                        name: "FK_sales_orders_currencies_currency_id",
                        column: x => x.currency_id,
                        principalTable: "currencies",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_sales_orders_customers_customer_id",
                        column: x => x.customer_id,
                        principalTable: "customers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_sales_orders_users_CreatedById",
                        column: x => x.CreatedById,
                        principalTable: "users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_sales_orders_users_UpdatedById",
                        column: x => x.UpdatedById,
                        principalTable: "users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_sales_orders_users_sales_man_id",
                        column: x => x.sales_man_id,
                        principalTable: "users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "sales_order_additions",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    type = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    ledger_id = table.Column<Guid>(type: "uuid", nullable: true),
                    ledger_name_snapshot = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    amount = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    sales_order_id = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_sales_order_additions", x => x.id);
                    table.ForeignKey(
                        name: "FK_sales_order_additions_ledgers_ledger_id",
                        column: x => x.ledger_id,
                        principalTable: "ledgers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_sales_order_additions_sales_orders_sales_order_id",
                        column: x => x.sales_order_id,
                        principalTable: "sales_orders",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "sales_order_lines",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    SalesOrderId = table.Column<Guid>(type: "uuid", nullable: false),
                    sno = table.Column<int>(type: "integer", nullable: false),
                    foc = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    mrp = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    discount_percent = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    tax_percent = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    tax_amount = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    net_amount = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    ProductId = table.Column<Guid>(type: "uuid", nullable: false),
                    product_name_snapshot = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    hsn_code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    quantity = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    UnitId = table.Column<Guid>(type: "uuid", nullable: false),
                    unit_rate = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    gross_amount = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    discount_amount = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    taxable_amount = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    warehouse_id = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_sales_order_lines", x => x.Id);
                    table.ForeignKey(
                        name: "FK_sales_order_lines_products_ProductId",
                        column: x => x.ProductId,
                        principalTable: "products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_sales_order_lines_sales_orders_SalesOrderId",
                        column: x => x.SalesOrderId,
                        principalTable: "sales_orders",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_sales_order_lines_uoms_UnitId",
                        column: x => x.UnitId,
                        principalTable: "uoms",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_sales_order_lines_warehouses_warehouse_id",
                        column: x => x.warehouse_id,
                        principalTable: "warehouses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_sales_order_additions_ledger_id",
                table: "sales_order_additions",
                column: "ledger_id");

            migrationBuilder.CreateIndex(
                name: "IX_sales_order_additions_sales_order_id",
                table: "sales_order_additions",
                column: "sales_order_id");

            migrationBuilder.CreateIndex(
                name: "IX_sales_order_lines_ProductId",
                table: "sales_order_lines",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_sales_order_lines_SalesOrderId",
                table: "sales_order_lines",
                column: "SalesOrderId");

            migrationBuilder.CreateIndex(
                name: "IX_sales_order_lines_UnitId",
                table: "sales_order_lines",
                column: "UnitId");

            migrationBuilder.CreateIndex(
                name: "IX_sales_order_lines_warehouse_id",
                table: "sales_order_lines",
                column: "warehouse_id");

            migrationBuilder.CreateIndex(
                name: "IX_sales_orders_CreatedById",
                table: "sales_orders",
                column: "CreatedById");

            migrationBuilder.CreateIndex(
                name: "IX_sales_orders_currency_id",
                table: "sales_orders",
                column: "currency_id");

            migrationBuilder.CreateIndex(
                name: "IX_sales_orders_customer_id",
                table: "sales_orders",
                column: "customer_id");

            migrationBuilder.CreateIndex(
                name: "IX_sales_orders_no",
                table: "sales_orders",
                column: "no",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_sales_orders_sales_man_id",
                table: "sales_orders",
                column: "sales_man_id");

            migrationBuilder.CreateIndex(
                name: "IX_sales_orders_UpdatedById",
                table: "sales_orders",
                column: "UpdatedById");

            migrationBuilder.AddForeignKey(
                name: "FK_purchase_order_lines_products_ProductId",
                table: "purchase_order_lines",
                column: "ProductId",
                principalTable: "products",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_purchase_order_lines_products_ProductId",
                table: "purchase_order_lines");

            migrationBuilder.DropTable(
                name: "sales_order_additions");

            migrationBuilder.DropTable(
                name: "sales_order_lines");

            migrationBuilder.DropTable(
                name: "sales_orders");

            migrationBuilder.RenameColumn(
                name: "item_name_snapshot",
                table: "purchase_order_lines",
                newName: "ItemNameSnapshot");

            migrationBuilder.RenameColumn(
                name: "ProductId",
                table: "purchase_order_lines",
                newName: "ItemId");

            migrationBuilder.RenameIndex(
                name: "IX_purchase_order_lines_ProductId",
                table: "purchase_order_lines",
                newName: "IX_purchase_order_lines_ItemId");

            migrationBuilder.AddForeignKey(
                name: "FK_purchase_order_lines_products_ItemId",
                table: "purchase_order_lines",
                column: "ItemId",
                principalTable: "products",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
