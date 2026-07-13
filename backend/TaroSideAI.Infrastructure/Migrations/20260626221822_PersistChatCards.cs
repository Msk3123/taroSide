using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TaroSideAI.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class PersistChatCards : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "CardsJson",
                table: "Messages",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CardsJson",
                table: "Messages");
        }
    }
}
