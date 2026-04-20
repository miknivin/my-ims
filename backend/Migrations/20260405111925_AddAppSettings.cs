using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddAppSettings : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "app_settings",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    business_name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    contact_person = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: true),
                    phone = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: true),
                    email = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    address_line_1 = table.Column<string>(type: "character varying(250)", maxLength: 250, nullable: true),
                    address_line_2 = table.Column<string>(type: "character varying(250)", maxLength: 250, nullable: true),
                    city = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: true),
                    state = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: true),
                    pincode = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    country = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: true),
                    gstin = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: true),
                    pan = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    allow_negative_stock = table.Column<bool>(type: "boolean", nullable: false),
                    track_inventory_by_warehouse = table.Column<bool>(type: "boolean", nullable: false),
                    default_warehouse_id = table.Column<Guid>(type: "uuid", nullable: true),
                    block_sale_when_stock_unavailable = table.Column<bool>(type: "boolean", nullable: false),
                    auto_update_stock_on_invoice_posting = table.Column<bool>(type: "boolean", nullable: false),
                    valuation_method = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    cost_precision = table.Column<int>(type: "integer", nullable: false),
                    rounding_precision = table.Column<int>(type: "integer", nullable: false),
                    include_landed_cost_in_inventory_cost = table.Column<bool>(type: "boolean", nullable: false),
                    enable_batch_tracking = table.Column<bool>(type: "boolean", nullable: false),
                    enable_serial_tracking = table.Column<bool>(type: "boolean", nullable: false),
                    require_expiry_for_batch_items = table.Column<bool>(type: "boolean", nullable: false),
                    created_at_utc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at_utc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_app_settings", x => x.Id);
                    table.ForeignKey(
                        name: "FK_app_settings_warehouses_default_warehouse_id",
                        column: x => x.default_warehouse_id,
                        principalTable: "warehouses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_app_settings_default_warehouse_id",
                table: "app_settings",
                column: "default_warehouse_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "app_settings");
        }
    }
}
