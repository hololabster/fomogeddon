using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace fomogeddon.model
{
    public class Scenario
    {
        public string Name { get; set; }
        public string EventDescription { get; set; }
        public int EventDuration { get; set; } // 기본 이벤트 지속 시간 (나중에 3배)
        public ImpactRange EventImpact { get; set; }
    }
}