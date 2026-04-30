using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddBillWiseJournalPostingPhase1 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "discount_allowed_ledger_id",
                table: "app_settings",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "discount_received_ledger_id",
                table: "app_settings",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_app_settings_discount_allowed_ledger_id",
                table: "app_settings",
                column: "discount_allowed_ledger_id");

            migrationBuilder.CreateIndex(
                name: "IX_app_settings_discount_received_ledger_id",
                table: "app_settings",
                column: "discount_received_ledger_id");

            migrationBuilder.AddForeignKey(
                name: "FK_app_settings_ledgers_discount_allowed_ledger_id",
                table: "app_settings",
                column: "discount_allowed_ledger_id",
                principalTable: "ledgers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_app_settings_ledgers_discount_received_ledger_id",
                table: "app_settings",
                column: "discount_received_ledger_id",
                principalTable: "ledgers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_app_settings_ledgers_discount_allowed_ledger_id",
                table: "app_settings");

            migrationBuilder.DropForeignKey(
                name: "FK_app_settings_ledgers_discount_received_ledger_id",
                table: "app_settings");

            migrationBuilder.DropIndex(
                name: "IX_app_settings_discount_allowed_ledger_id",
                table: "app_settings");

            migrationBuilder.DropIndex(
                name: "IX_app_settings_discount_received_ledger_id",
                table: "app_settings");

            migrationBuilder.DropColumn(
                name: "discount_allowed_ledger_id",
                table: "app_settings");

            migrationBuilder.DropColumn(
                name: "discount_received_ledger_id",
                table: "app_settings");
        }
    }
}
