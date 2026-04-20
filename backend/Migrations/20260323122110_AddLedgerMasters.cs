using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddLedgerMasters : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ledger_groups",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Code = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Nature = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    ParentGroupId = table.Column<Guid>(type: "uuid", nullable: true),
                    Status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    IsSystem = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ledger_groups", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ledger_groups_ledger_groups_ParentGroupId",
                        column: x => x.ParentGroupId,
                        principalTable: "ledger_groups",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ledgers",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Code = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Name = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    Alias = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: true),
                    LedgerGroupId = table.Column<Guid>(type: "uuid", nullable: false),
                    DefaultCurrencyId = table.Column<Guid>(type: "uuid", nullable: true),
                    Status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    IsSystem = table.Column<bool>(type: "boolean", nullable: false),
                    AllowManualPosting = table.Column<bool>(type: "boolean", nullable: false),
                    IsBillWise = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ledgers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ledgers_currencies_DefaultCurrencyId",
                        column: x => x.DefaultCurrencyId,
                        principalTable: "currencies",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ledgers_ledger_groups_LedgerGroupId",
                        column: x => x.LedgerGroupId,
                        principalTable: "ledger_groups",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ledger_groups_Code",
                table: "ledger_groups",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ledger_groups_Name",
                table: "ledger_groups",
                column: "Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ledger_groups_ParentGroupId",
                table: "ledger_groups",
                column: "ParentGroupId");

            migrationBuilder.CreateIndex(
                name: "IX_ledgers_Code",
                table: "ledgers",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ledgers_DefaultCurrencyId",
                table: "ledgers",
                column: "DefaultCurrencyId");

            migrationBuilder.CreateIndex(
                name: "IX_ledgers_LedgerGroupId",
                table: "ledgers",
                column: "LedgerGroupId");

            migrationBuilder.CreateIndex(
                name: "IX_ledgers_Name",
                table: "ledgers",
                column: "Name",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ledgers");

            migrationBuilder.DropTable(
                name: "ledger_groups");
        }
    }
}
