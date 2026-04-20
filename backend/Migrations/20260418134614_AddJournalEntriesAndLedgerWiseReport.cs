using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddJournalEntriesAndLedgerWiseReport : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "journal_vouchers",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    voucher_type = table.Column<short>(type: "smallint", nullable: false),
                    voucher_no = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    posting_date = table.Column<DateOnly>(type: "date", nullable: false),
                    status = table.Column<short>(type: "smallint", nullable: false),
                    source_type = table.Column<short>(type: "smallint", nullable: true),
                    source_id = table.Column<Guid>(type: "uuid", nullable: true),
                    narration = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    reverses_journal_voucher_id = table.Column<Guid>(type: "uuid", nullable: true),
                    created_at_utc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at_utc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_journal_vouchers", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "journal_entries",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    journal_voucher_id = table.Column<Guid>(type: "uuid", nullable: false),
                    line_no = table.Column<int>(type: "integer", nullable: false),
                    posting_date = table.Column<DateOnly>(type: "date", nullable: false),
                    voucher_type = table.Column<short>(type: "smallint", nullable: false),
                    voucher_no = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    source_type = table.Column<short>(type: "smallint", nullable: true),
                    source_id = table.Column<Guid>(type: "uuid", nullable: true),
                    ledger_id = table.Column<Guid>(type: "uuid", nullable: false),
                    sub_ledger_type = table.Column<short>(type: "smallint", nullable: true),
                    sub_ledger_id = table.Column<Guid>(type: "uuid", nullable: true),
                    sub_ledger_code_snapshot = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    sub_ledger_name_snapshot = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: true),
                    narration = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    debit_amount = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    credit_amount = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    created_at_utc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_journal_entries", x => x.Id);
                    table.CheckConstraint("CK_journal_entries_amount_non_negative", "\"debit_amount\" >= 0 AND \"credit_amount\" >= 0");
                    table.CheckConstraint("CK_journal_entries_single_side", "((\"debit_amount\" > 0 AND \"credit_amount\" = 0) OR (\"debit_amount\" = 0 AND \"credit_amount\" > 0))");
                    table.ForeignKey(
                        name: "FK_journal_entries_journal_vouchers_journal_voucher_id",
                        column: x => x.journal_voucher_id,
                        principalTable: "journal_vouchers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_journal_entries_ledgers_ledger_id",
                        column: x => x.ledger_id,
                        principalTable: "ledgers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_journal_entries_journal_voucher_id_line_no",
                table: "journal_entries",
                columns: new[] { "journal_voucher_id", "line_no" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_journal_entries_ledger_id_posting_date_Id",
                table: "journal_entries",
                columns: new[] { "ledger_id", "posting_date", "Id" });

            migrationBuilder.CreateIndex(
                name: "IX_journal_entries_ledger_id_sub_ledger_type_sub_ledger_id_pos~",
                table: "journal_entries",
                columns: new[] { "ledger_id", "sub_ledger_type", "sub_ledger_id", "posting_date", "Id" });

            migrationBuilder.CreateIndex(
                name: "IX_journal_entries_source_type_source_id",
                table: "journal_entries",
                columns: new[] { "source_type", "source_id" });

            migrationBuilder.CreateIndex(
                name: "IX_journal_vouchers_posting_date_Id",
                table: "journal_vouchers",
                columns: new[] { "posting_date", "Id" });

            migrationBuilder.CreateIndex(
                name: "IX_journal_vouchers_source_type_source_id",
                table: "journal_vouchers",
                columns: new[] { "source_type", "source_id" });

            migrationBuilder.CreateIndex(
                name: "IX_journal_vouchers_voucher_type_voucher_no",
                table: "journal_vouchers",
                columns: new[] { "voucher_type", "voucher_no" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "journal_entries");

            migrationBuilder.DropTable(
                name: "journal_vouchers");
        }
    }
}
