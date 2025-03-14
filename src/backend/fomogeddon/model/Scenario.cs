using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace fomogeddon.model
{
    public class Scenario
    {

        [Key]
        [Column("origin_scenario_id")]
        public string originScenarioId {get; set;}
        [Column("origin_scenario_name")]
        public string originScenarioName { get; set; }
        [Column("scenario_desc")]
        public string scenarioDesc { get; set; }
        [Column("event_desc")]
        public string EventDesc { get; set; }
        [Column("event_duration")]
        public int EventDuration { get; set; } // 기본 이벤트 지속 시간 (나중에 3배)
        [NotMapped]
        public ImpactRange EventImpact { get; set; }
        [Column("event_impact")]
        public List<long> EventImpacts { get; set; } 
    }
}