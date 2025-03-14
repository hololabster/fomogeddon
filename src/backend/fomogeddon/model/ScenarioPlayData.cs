using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using fomogeddon.model;

namespace fomogeddon.model
{
    public class ScenarioPlayData
    {   
        [Column("custom_scenario_id", TypeName = "int")]
        public int customScenarioId {get; set;}

        [Column("origin_scenario_id", TypeName = "int")]
        public int originScenarioId {get; set;}

        [Column("origin_scenario_title", TypeName = "int")]
        public int originScenarioTitle {get; set;}

        [Column("origin_chart_data", TypeName = "jsonb")]
        public string? originChartDataJson { get; set; }

        [NotMapped]
        public Dictionary<int, int> originChartData
        {
            get => JsonSerializer.Deserialize<Dictionary<int, int>>(PreferencesJson ?? "{}");
            set => PreferencesJson = JsonSerializer.Serialize(value);
        }

        [Column("custom_chart_data", TypeName = "jsonb")]
        public string? customChartDataJson { get; set; }

        [NotMapped]
        public Dictionary<int, int> customChartData
        {
            get => JsonSerializer.Deserialize<Dictionary<int, int>>(PreferencesJson ?? "{}");
            set => PreferencesJson = JsonSerializer.Serialize(value);
        }

        [Column("balance", TypeName = "int")]
        public int balance {get; set;}

        [Column("player_wallet_address")]
        public string WalletAddress {get; set;}

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
        public string? PreferencesJson { get; private set; }
    }
}