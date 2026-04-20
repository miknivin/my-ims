using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddTaxMaster : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "taxes",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    Code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    Type = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Rate = table.Column<decimal>(type: "numeric(18,2)", nullable: true),
                    Status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_taxes", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "tax_slabs",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TaxId = table.Column<Guid>(type: "uuid", nullable: false),
                    FromAmount = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    ToAmount = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    Rate = table.Column<decimal>(type: "numeric(18,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tax_slabs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_tax_slabs_taxes_TaxId",
                        column: x => x.TaxId,
                        principalTable: "taxes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_tax_slabs_TaxId",
                table: "tax_slabs",
                column: "TaxId");

            migrationBuilder.CreateIndex(
                name: "IX_taxes_Code",
                table: "taxes",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_taxes_Name",
                table: "taxes",
                column: "Name",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "tax_slabs");

            migrationBuilder.DropTable(
                name: "taxes");
        }
    }
}
