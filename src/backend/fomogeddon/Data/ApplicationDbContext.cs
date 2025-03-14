
using Microsoft.EntityFrameworkCore;
using fomogeddon.model;

namespace fomogeddon.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }
        public DbSet<EventInfo> EventInfos { get; set; }
        public DbSet<HistoryPoint> VoteCaHistoryPoints { get; set; }
        public DbSet<Scenario> Scenario { get; set; }
        public DbSet<ScenarioPlayData> ScenarioPlayData { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
           
        }
    }


}