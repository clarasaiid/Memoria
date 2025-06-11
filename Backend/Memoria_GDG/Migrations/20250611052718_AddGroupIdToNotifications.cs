using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Memoria_GDG.Migrations
{
    /// <inheritdoc />
    public partial class AddGroupIdToNotifications : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Approved",
                table: "Follows");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "Approved",
                table: "Follows",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: false);
        }
    }
}
