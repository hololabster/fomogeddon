using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;

namespace fomogeddon.DTOS.RequestDTO
{
    public class SavePlayDataDTO
    {
        public string wallet_address { get; set; }

        public string origin_scenario_id { get; set; }

        public double balance { get; set; }

        public string? customChartDataJson { get; set; }

        public string? playGameDataJson { get; set; }

        public bool success {get; set;}

    }
}