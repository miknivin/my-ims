using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddInvoiceAndGrnJournalPosting : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "cost_of_goods_sold_ledger_id",
                table: "app_settings",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "default_cash_ledger_id",
                table: "app_settings",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "grn_addition_ledger_id",
                table: "app_settings",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "grn_clearing_ledger_id",
                table: "app_settings",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "grn_discount_ledger_id",
                table: "app_settings",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "inventory_ledger_id",
                table: "app_settings",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "purchase_tax_ledger_id",
                table: "app_settings",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "round_off_ledger_id",
                table: "app_settings",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "sales_ledger_id",
                table: "app_settings",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "sales_tax_ledger_id",
                table: "app_settings",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_app_settings_cost_of_goods_sold_ledger_id",
                table: "app_settings",
                column: "cost_of_goods_sold_ledger_id");

            migrationBuilder.CreateIndex(
                name: "IX_app_settings_default_cash_ledger_id",
                table: "app_settings",
                column: "default_cash_ledger_id");

            migrationBuilder.CreateIndex(
                name: "IX_app_settings_grn_addition_ledger_id",
                table: "app_settings",
                column: "grn_addition_ledger_id");

            migrationBuilder.CreateIndex(
                name: "IX_app_settings_grn_clearing_ledger_id",
                table: "app_settings",
                column: "grn_clearing_ledger_id");

            migrationBuilder.CreateIndex(
                name: "IX_app_settings_grn_discount_ledger_id",
                table: "app_settings",
                column: "grn_discount_ledger_id");

            migrationBuilder.CreateIndex(
                name: "IX_app_settings_inventory_ledger_id",
                table: "app_settings",
                column: "inventory_ledger_id");

            migrationBuilder.CreateIndex(
                name: "IX_app_settings_purchase_tax_ledger_id",
                table: "app_settings",
                column: "purchase_tax_ledger_id");

            migrationBuilder.CreateIndex(
                name: "IX_app_settings_round_off_ledger_id",
                table: "app_settings",
                column: "round_off_ledger_id");

            migrationBuilder.CreateIndex(
                name: "IX_app_settings_sales_ledger_id",
                table: "app_settings",
                column: "sales_ledger_id");

            migrationBuilder.CreateIndex(
                name: "IX_app_settings_sales_tax_ledger_id",
                table: "app_settings",
                column: "sales_tax_ledger_id");

            migrationBuilder.AddForeignKey(
                name: "FK_app_settings_ledgers_cost_of_goods_sold_ledger_id",
                table: "app_settings",
                column: "cost_of_goods_sold_ledger_id",
                principalTable: "ledgers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_app_settings_ledgers_default_cash_ledger_id",
                table: "app_settings",
                column: "default_cash_ledger_id",
                principalTable: "ledgers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_app_settings_ledgers_grn_addition_ledger_id",
                table: "app_settings",
                column: "grn_addition_ledger_id",
                principalTable: "ledgers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_app_settings_ledgers_grn_clearing_ledger_id",
                table: "app_settings",
                column: "grn_clearing_ledger_id",
                principalTable: "ledgers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_app_settings_ledgers_grn_discount_ledger_id",
                table: "app_settings",
                column: "grn_discount_ledger_id",
                principalTable: "ledgers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_app_settings_ledgers_inventory_ledger_id",
                table: "app_settings",
                column: "inventory_ledger_id",
                principalTable: "ledgers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_app_settings_ledgers_purchase_tax_ledger_id",
                table: "app_settings",
                column: "purchase_tax_ledger_id",
                principalTable: "ledgers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_app_settings_ledgers_round_off_ledger_id",
                table: "app_settings",
                column: "round_off_ledger_id",
                principalTable: "ledgers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_app_settings_ledgers_sales_ledger_id",
                table: "app_settings",
                column: "sales_ledger_id",
                principalTable: "ledgers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_app_settings_ledgers_sales_tax_ledger_id",
                table: "app_settings",
                column: "sales_tax_ledger_id",
                principalTable: "ledgers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_app_settings_ledgers_cost_of_goods_sold_ledger_id",
                table: "app_settings");

            migrationBuilder.DropForeignKey(
                name: "FK_app_settings_ledgers_default_cash_ledger_id",
                table: "app_settings");

            migrationBuilder.DropForeignKey(
                name: "FK_app_settings_ledgers_grn_addition_ledger_id",
                table: "app_settings");

            migrationBuilder.DropForeignKey(
                name: "FK_app_settings_ledgers_grn_clearing_ledger_id",
                table: "app_settings");

            migrationBuilder.DropForeignKey(
                name: "FK_app_settings_ledgers_grn_discount_ledger_id",
                table: "app_settings");

            migrationBuilder.DropForeignKey(
                name: "FK_app_settings_ledgers_inventory_ledger_id",
                table: "app_settings");

            migrationBuilder.DropForeignKey(
                name: "FK_app_settings_ledgers_purchase_tax_ledger_id",
                table: "app_settings");

            migrationBuilder.DropForeignKey(
                name: "FK_app_settings_ledgers_round_off_ledger_id",
                table: "app_settings");

            migrationBuilder.DropForeignKey(
                name: "FK_app_settings_ledgers_sales_ledger_id",
                table: "app_settings");

            migrationBuilder.DropForeignKey(
                name: "FK_app_settings_ledgers_sales_tax_ledger_id",
                table: "app_settings");

            migrationBuilder.DropIndex(
                name: "IX_app_settings_cost_of_goods_sold_ledger_id",
                table: "app_settings");

            migrationBuilder.DropIndex(
                name: "IX_app_settings_default_cash_ledger_id",
                table: "app_settings");

            migrationBuilder.DropIndex(
                name: "IX_app_settings_grn_addition_ledger_id",
                table: "app_settings");

            migrationBuilder.DropIndex(
                name: "IX_app_settings_grn_clearing_ledger_id",
                table: "app_settings");

            migrationBuilder.DropIndex(
                name: "IX_app_settings_grn_discount_ledger_id",
                table: "app_settings");

            migrationBuilder.DropIndex(
                name: "IX_app_settings_inventory_ledger_id",
                table: "app_settings");

            migrationBuilder.DropIndex(
                name: "IX_app_settings_purchase_tax_ledger_id",
                table: "app_settings");

            migrationBuilder.DropIndex(
                name: "IX_app_settings_round_off_ledger_id",
                table: "app_settings");

            migrationBuilder.DropIndex(
                name: "IX_app_settings_sales_ledger_id",
                table: "app_settings");

            migrationBuilder.DropIndex(
                name: "IX_app_settings_sales_tax_ledger_id",
                table: "app_settings");

            migrationBuilder.DropColumn(
                name: "cost_of_goods_sold_ledger_id",
                table: "app_settings");

            migrationBuilder.DropColumn(
                name: "default_cash_ledger_id",
                table: "app_settings");

            migrationBuilder.DropColumn(
                name: "grn_addition_ledger_id",
                table: "app_settings");

            migrationBuilder.DropColumn(
                name: "grn_clearing_ledger_id",
                table: "app_settings");

            migrationBuilder.DropColumn(
                name: "grn_discount_ledger_id",
                table: "app_settings");

            migrationBuilder.DropColumn(
                name: "inventory_ledger_id",
                table: "app_settings");

            migrationBuilder.DropColumn(
                name: "purchase_tax_ledger_id",
                table: "app_settings");

            migrationBuilder.DropColumn(
                name: "round_off_ledger_id",
                table: "app_settings");

            migrationBuilder.DropColumn(
                name: "sales_ledger_id",
                table: "app_settings");

            migrationBuilder.DropColumn(
                name: "sales_tax_ledger_id",
                table: "app_settings");
        }
    }
}
