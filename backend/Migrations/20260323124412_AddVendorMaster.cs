using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddVendorMaster : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "vendors",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    code = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    name = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    under = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: true),
                    contact_name = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: true),
                    name_in_ol = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: true),
                    address = table.Column<string>(type: "character varying(250)", maxLength: 250, nullable: false),
                    phone = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    mobile = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: true),
                    email = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    web = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: true),
                    fax = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    credit_limit = table.Column<decimal>(type: "numeric(18,2)", nullable: true),
                    due_days = table.Column<int>(type: "integer", nullable: true),
                    currency_id = table.Column<Guid>(type: "uuid", nullable: true),
                    payment_terms = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: true),
                    remark = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    gstin = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: true),
                    tin = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: true),
                    LedgerId = table.Column<Guid>(type: "uuid", nullable: true),
                    bank_details = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: true),
                    account_no = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    bank_address = table.Column<string>(type: "character varying(250)", maxLength: 250, nullable: true),
                    company = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: true),
                    Status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_vendors", x => x.Id);
                    table.ForeignKey(
                        name: "FK_vendors_currencies_currency_id",
                        column: x => x.currency_id,
                        principalTable: "currencies",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_vendors_ledgers_LedgerId",
                        column: x => x.LedgerId,
                        principalTable: "ledgers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "vendor_opening_balances",
                columns: table => new
                {
                    VendorId = table.Column<Guid>(type: "uuid", nullable: false),
                    Amount = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    BalanceType = table.Column<string>(type: "character varying(2)", maxLength: 2, nullable: false),
                    AsOfDate = table.Column<DateOnly>(type: "date", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_vendor_opening_balances", x => x.VendorId);
                    table.ForeignKey(
                        name: "FK_vendor_opening_balances_vendors_VendorId",
                        column: x => x.VendorId,
                        principalTable: "vendors",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_vendors_code",
                table: "vendors",
                column: "code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_vendors_currency_id",
                table: "vendors",
                column: "currency_id");

            migrationBuilder.CreateIndex(
                name: "IX_vendors_LedgerId",
                table: "vendors",
                column: "LedgerId");

            migrationBuilder.CreateIndex(
                name: "IX_vendors_name",
                table: "vendors",
                column: "name",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "vendor_opening_balances");

            migrationBuilder.DropTable(
                name: "vendors");
        }
    }
}
