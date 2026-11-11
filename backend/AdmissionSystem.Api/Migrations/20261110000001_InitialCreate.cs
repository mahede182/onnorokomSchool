using System;
using AdmissionSystem.Api.Common.Persistence;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AdmissionSystem.Api.Migrations;

[DbContext(typeof(AdmissionDbContext))]
[Migration("20261110000001_InitialCreate")]
public partial class InitialCreate : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.CreateTable(
            name: "classes",
            columns: table => new
            {
                id = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                total_seats = table.Column<int>(type: "integer", nullable: false),
                created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_classes", x => x.id);
            });

        migrationBuilder.CreateTable(
            name: "holds",
            columns: table => new
            {
                id = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                class_id = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                student_id = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                expires_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_holds", x => x.id);
                table.ForeignKey(
                    name: "FK_holds_classes_class_id",
                    column: x => x.class_id,
                    principalTable: "classes",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateIndex(
            name: "IX_holds_class_id",
            table: "holds",
            column: "class_id");

        migrationBuilder.CreateIndex(
            name: "IX_holds_class_id_status",
            table: "holds",
            columns: new[] { "class_id", "status" });

        migrationBuilder.CreateIndex(
            name: "IX_holds_class_id_student_id",
            table: "holds",
            columns: new[] { "class_id", "student_id" });

        migrationBuilder.CreateIndex(
            name: "IX_holds_student_id",
            table: "holds",
            column: "student_id");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable(name: "holds");
        migrationBuilder.DropTable(name: "classes");
    }
}
