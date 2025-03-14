using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;
using fomogeddon.model;

namespace fomogeddon.model
{
    public class ScenarioPlayData
    {      
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)] // 자동 증가
        [Column("custom_scenario_id")]
        public int customScenarioId {get; set;}

        [Column("origin_scenario_id")]
        public string originScenarioId {get; set;}

        [Column("origin_scenario_title")]
        public string originScenarioTitle {get; set;}

        [Column("origin_chart_data", TypeName = "jsonb")]
        public string? originChartDataJson { get; set; }

        [NotMapped]
        public Dictionary<int, int> originChartData
        {
            get => JsonSerializer.Deserialize<Dictionary<int, int>>(originChartDataJson ?? "{}");
            set => originChartDataJson = JsonSerializer.Serialize(value);
        }

        [Column("custom_chart_data", TypeName = "jsonb")]
        public string? customChartDataJson { get; set; }

        [Column("play_game_data", TypeName = "jsonb")]
        public string? playGameDataJson { get; set; }

        [Column("balance")]
        public double balance {get; set;}

        [Column("player_wallet_address")]
        public string WalletAddress {get; set;}

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}