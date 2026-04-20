using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddGoodsReceiptNotes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "goods_receipt_notes",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    receipt_mode = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false),
                    purchase_order_id = table.Column<Guid>(type: "uuid", nullable: true),
                    purchase_order_no = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    direct_lpo_no = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: true),
                    direct_vendor_invoice_no = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: true),
                    voucher_type = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    no = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    date = table.Column<DateOnly>(type: "date", nullable: false),
                    delivery_date = table.Column<DateOnly>(type: "date", nullable: true),
                    vendor_id = table.Column<Guid>(type: "uuid", nullable: false),
                    vendor_name_snapshot = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    vendor_address = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    vendor_attention = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: true),
                    vendor_phone = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    lr_service = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: true),
                    lr_no = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: true),
                    lr_date = table.Column<DateOnly>(type: "date", nullable: true),
                    own_products_only = table.Column<bool>(type: "boolean", nullable: false),
                    taxable_mode = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    notes = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    addition = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    discount_footer = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    round_off = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    net_total = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    total_qty = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    total_foc = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    total_amount = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_goods_receipt_notes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_goods_receipt_notes_vendors_vendor_id",
                        column: x => x.vendor_id,
                        principalTable: "vendors",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "goods_receipt_note_lines",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    GoodsReceiptNoteId = table.Column<Guid>(type: "uuid", nullable: false),
                    serial_no = table.Column<int>(type: "integer", nullable: false),
                    code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    ubc = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: true),
                    f_rate = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    foc_quantity = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    discount_percent = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    total = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    manufacturing_date_utc = table.Column<DateOnly>(type: "date", nullable: true),
                    expiry_date_utc = table.Column<DateOnly>(type: "date", nullable: true),
                    remark = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    selling_rate = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    purchase_order_line_id = table.Column<Guid>(type: "uuid", nullable: true),
                    ProductId = table.Column<Guid>(type: "uuid", nullable: false),
                    product_name_snapshot = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    hsn_code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    Quantity = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    UnitId = table.Column<Guid>(type: "uuid", nullable: false),
                    Rate = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    gross = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    discount_amount = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    taxable_amount = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    WarehouseId = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_goods_receipt_note_lines", x => x.Id);
                    table.ForeignKey(
                        name: "FK_goods_receipt_note_lines_goods_receipt_notes_GoodsReceiptNo~",
                        column: x => x.GoodsReceiptNoteId,
                        principalTable: "goods_receipt_notes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_goods_receipt_note_lines_products_ProductId",
                        column: x => x.ProductId,
                        principalTable: "products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_goods_receipt_note_lines_uoms_UnitId",
                        column: x => x.UnitId,
                        principalTable: "uoms",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_goods_receipt_note_lines_warehouses_WarehouseId",
                        column: x => x.WarehouseId,
                        principalTable: "warehouses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_goods_receipt_note_lines_GoodsReceiptNoteId",
                table: "goods_receipt_note_lines",
                column: "GoodsReceiptNoteId");

            migrationBuilder.CreateIndex(
                name: "IX_goods_receipt_note_lines_ProductId",
                table: "goods_receipt_note_lines",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_goods_receipt_note_lines_UnitId",
                table: "goods_receipt_note_lines",
                column: "UnitId");

            migrationBuilder.CreateIndex(
                name: "IX_goods_receipt_note_lines_WarehouseId",
                table: "goods_receipt_note_lines",
                column: "WarehouseId");

            migrationBuilder.CreateIndex(
                name: "IX_goods_receipt_notes_no",
                table: "goods_receipt_notes",
                column: "no",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_goods_receipt_notes_vendor_id",
                table: "goods_receipt_notes",
                column: "vendor_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "goods_receipt_note_lines");

            migrationBuilder.DropTable(
                name: "goods_receipt_notes");
        }
    }
}
