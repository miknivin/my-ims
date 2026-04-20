using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddProductAndWarehouseMasters : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "products",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    code = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    name = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    other_language = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: true),
                    tax_id = table.Column<Guid>(type: "uuid", nullable: true),
                    profit_percentage = table.Column<decimal>(type: "numeric(18,2)", nullable: true),
                    purchase_rate = table.Column<decimal>(type: "numeric(18,2)", nullable: true),
                    cost = table.Column<decimal>(type: "numeric(18,2)", nullable: true),
                    sales_rate = table.Column<decimal>(type: "numeric(18,2)", nullable: true),
                    normal_rate = table.Column<decimal>(type: "numeric(18,2)", nullable: true),
                    mrp = table.Column<decimal>(type: "numeric(18,2)", nullable: true),
                    wholesale_rate = table.Column<decimal>(type: "numeric(18,2)", nullable: true),
                    hsn = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    base_uom_id = table.Column<Guid>(type: "uuid", nullable: false),
                    purchase_uom_id = table.Column<Guid>(type: "uuid", nullable: false),
                    sales_uom_id = table.Column<Guid>(type: "uuid", nullable: false),
                    stock_uom_id = table.Column<Guid>(type: "uuid", nullable: false),
                    minimum_stock = table.Column<decimal>(type: "numeric(18,2)", nullable: true),
                    maximum_stock = table.Column<decimal>(type: "numeric(18,2)", nullable: true),
                    reorder_level = table.Column<decimal>(type: "numeric(18,2)", nullable: true),
                    reorder_quantity = table.Column<decimal>(type: "numeric(18,2)", nullable: true),
                    inactive = table.Column<bool>(type: "boolean", nullable: false),
                    less_profit = table.Column<bool>(type: "boolean", nullable: false),
                    counter_item = table.Column<bool>(type: "boolean", nullable: false),
                    auto_entry = table.Column<bool>(type: "boolean", nullable: false),
                    hide_from_device = table.Column<bool>(type: "boolean", nullable: false),
                    expiry_days = table.Column<int>(type: "integer", nullable: false),
                    tax_inclusive = table.Column<bool>(type: "boolean", nullable: false),
                    serial_no = table.Column<bool>(type: "boolean", nullable: false),
                    group_category_id = table.Column<Guid>(type: "uuid", nullable: true),
                    sub_group_category_id = table.Column<Guid>(type: "uuid", nullable: true),
                    vendor_id = table.Column<Guid>(type: "uuid", nullable: true),
                    brand = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: true),
                    pack_unit = table.Column<decimal>(type: "numeric(18,2)", nullable: true),
                    addition_percentage = table.Column<decimal>(type: "numeric(18,2)", nullable: true),
                    addition = table.Column<decimal>(type: "numeric(18,2)", nullable: true),
                    company = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: true),
                    warehouse_stock = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: true),
                    document = table.Column<string>(type: "character varying(250)", maxLength: 250, nullable: true),
                    barcode = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: true),
                    purchase_history = table.Column<string>(type: "character varying(250)", maxLength: 250, nullable: true),
                    sales_history = table.Column<string>(type: "character varying(250)", maxLength: 250, nullable: true),
                    company_stock = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: true),
                    Status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_products", x => x.Id);
                    table.ForeignKey(
                        name: "FK_products_categories_group_category_id",
                        column: x => x.group_category_id,
                        principalTable: "categories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_products_categories_sub_group_category_id",
                        column: x => x.sub_group_category_id,
                        principalTable: "categories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_products_taxes_tax_id",
                        column: x => x.tax_id,
                        principalTable: "taxes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_products_uoms_base_uom_id",
                        column: x => x.base_uom_id,
                        principalTable: "uoms",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_products_uoms_purchase_uom_id",
                        column: x => x.purchase_uom_id,
                        principalTable: "uoms",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_products_uoms_sales_uom_id",
                        column: x => x.sales_uom_id,
                        principalTable: "uoms",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_products_uoms_stock_uom_id",
                        column: x => x.stock_uom_id,
                        principalTable: "uoms",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_products_vendors_vendor_id",
                        column: x => x.vendor_id,
                        principalTable: "vendors",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "warehouses",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Code = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Name = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    ContactPerson = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: true),
                    Phone = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: true),
                    Email = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: true),
                    Address = table.Column<string>(type: "character varying(250)", maxLength: 250, nullable: true),
                    Status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_warehouses", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "product_opening_stocks",
                columns: table => new
                {
                    ProductId = table.Column<Guid>(type: "uuid", nullable: false),
                    Quantity = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    AsOfDate = table.Column<DateOnly>(type: "date", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_product_opening_stocks", x => x.ProductId);
                    table.ForeignKey(
                        name: "FK_product_opening_stocks_products_ProductId",
                        column: x => x.ProductId,
                        principalTable: "products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_products_base_uom_id",
                table: "products",
                column: "base_uom_id");

            migrationBuilder.CreateIndex(
                name: "IX_products_code",
                table: "products",
                column: "code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_products_group_category_id",
                table: "products",
                column: "group_category_id");

            migrationBuilder.CreateIndex(
                name: "IX_products_name",
                table: "products",
                column: "name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_products_purchase_uom_id",
                table: "products",
                column: "purchase_uom_id");

            migrationBuilder.CreateIndex(
                name: "IX_products_sales_uom_id",
                table: "products",
                column: "sales_uom_id");

            migrationBuilder.CreateIndex(
                name: "IX_products_stock_uom_id",
                table: "products",
                column: "stock_uom_id");

            migrationBuilder.CreateIndex(
                name: "IX_products_sub_group_category_id",
                table: "products",
                column: "sub_group_category_id");

            migrationBuilder.CreateIndex(
                name: "IX_products_tax_id",
                table: "products",
                column: "tax_id");

            migrationBuilder.CreateIndex(
                name: "IX_products_vendor_id",
                table: "products",
                column: "vendor_id");

            migrationBuilder.CreateIndex(
                name: "IX_warehouses_Code",
                table: "warehouses",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_warehouses_Name",
                table: "warehouses",
                column: "Name",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "product_opening_stocks");

            migrationBuilder.DropTable(
                name: "warehouses");

            migrationBuilder.DropTable(
                name: "products");
        }
    }
}
