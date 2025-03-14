using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;

namespace fomogeddon.DTOS
{
    public class SavePlayDataDTO
    {
        public string wallet_address { get; set; }

        public long origin_scenario_id { get; set; }

        public double balance { get; set; }

        public string? customChartDataJson { get; set; }

        public Dictionary<int, int> customChartData
        {
            get => JsonSerializer.Deserialize<Dictionary<int, int>>(customChartDataJson ?? "{}");
            set => customChartDataJson = JsonSerializer.Serialize(value);
        }

        public bool success {get; set;}

    }
}