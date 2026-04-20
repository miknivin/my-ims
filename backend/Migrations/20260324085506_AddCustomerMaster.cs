using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddCustomerMaster : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "customers",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    code = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    name = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    alias = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: true),
                    customer_type = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    category = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: true),
                    LedgerId = table.Column<Guid>(type: "uuid", nullable: true),
                    phone = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: true),
                    mobile = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: true),
                    email = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: true),
                    website = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    billing_street = table.Column<string>(type: "character varying(250)", maxLength: 250, nullable: true),
                    billing_city = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: true),
                    billing_state = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: true),
                    billing_pincode = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    billing_country = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: true),
                    credit_limit = table.Column<decimal>(type: "numeric(18,2)", nullable: true),
                    credit_days = table.Column<int>(type: "integer", nullable: true),
                    default_tax_id = table.Column<Guid>(type: "uuid", nullable: true),
                    price_level = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    remarks = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    Status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_customers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_customers_ledgers_LedgerId",
                        column: x => x.LedgerId,
                        principalTable: "ledgers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_customers_taxes_default_tax_id",
                        column: x => x.default_tax_id,
                        principalTable: "taxes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "customer_opening_balances",
                columns: table => new
                {
                    CustomerId = table.Column<Guid>(type: "uuid", nullable: false),
                    Amount = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    BalanceType = table.Column<string>(type: "character varying(2)", maxLength: 2, nullable: false),
                    AsOfDate = table.Column<DateOnly>(type: "date", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_customer_opening_balances", x => x.CustomerId);
                    table.ForeignKey(
                        name: "FK_customer_opening_balances_customers_CustomerId",
                        column: x => x.CustomerId,
                        principalTable: "customers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "customer_shipping_addresses",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    name = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: true),
                    street = table.Column<string>(type: "character varying(250)", maxLength: 250, nullable: true),
                    city = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: true),
                    state = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: true),
                    pincode = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    country = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: true),
                    is_default = table.Column<bool>(type: "boolean", nullable: false),
                    customer_id = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_customer_shipping_addresses", x => x.id);
                    table.ForeignKey(
                        name: "FK_customer_shipping_addresses_customers_customer_id",
                        column: x => x.customer_id,
                        principalTable: "customers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "customer_tax_documents",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tax_type = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    number = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    verified = table.Column<bool>(type: "boolean", nullable: false),
                    verified_at = table.Column<DateOnly>(type: "date", nullable: true),
                    state = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: true),
                    filing_frequency = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    effective_from = table.Column<DateOnly>(type: "date", nullable: false),
                    effective_to = table.Column<DateOnly>(type: "date", nullable: true),
                    customer_id = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_customer_tax_documents", x => x.id);
                    table.ForeignKey(
                        name: "FK_customer_tax_documents_customers_customer_id",
                        column: x => x.customer_id,
                        principalTable: "customers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_customer_shipping_addresses_customer_id",
                table: "customer_shipping_addresses",
                column: "customer_id");

            migrationBuilder.CreateIndex(
                name: "IX_customer_tax_documents_customer_id",
                table: "customer_tax_documents",
                column: "customer_id");

            migrationBuilder.CreateIndex(
                name: "IX_customers_code",
                table: "customers",
                column: "code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_customers_default_tax_id",
                table: "customers",
                column: "default_tax_id");

            migrationBuilder.CreateIndex(
                name: "IX_customers_LedgerId",
                table: "customers",
                column: "LedgerId");

            migrationBuilder.CreateIndex(
                name: "IX_customers_name",
                table: "customers",
                column: "name",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "customer_opening_balances");

            migrationBuilder.DropTable(
                name: "customer_shipping_addresses");

            migrationBuilder.DropTable(
                name: "customer_tax_documents");

            migrationBuilder.DropTable(
                name: "customers");
        }
    }
}
