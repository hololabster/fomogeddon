
using Microsoft.EntityFrameworkCore;
using fomogeddon.model;
using fomogeddon.DTOS.ResponseDTO;
using fomogeddon.DTOS;
using System.Text.Json;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
namespace fomogeddon.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }
        public DbSet<ScenarioPlayData> ScenarioPlayData { get; set; }
        public DbSet<Play_User> play_user { get; set; }
        public DbSet<Scenario> origin_scenario {get; set;}

        //public DbSet<PlayLeaderBoardResponseDTO> PlayLeaderBoardResponseDTO {get; set;}
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<PlayLeaderBoardResponseDTO>().HasNoKey();

            base.OnModelCreating(modelBuilder);
        }
    }


}