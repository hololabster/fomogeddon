using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace fomogeddon.model
{
    public class StepResult
    {
        public long Time { get; set; }
        public double Price { get; set; }
        public double PercentChange { get; set; }
        public bool IsEventActive { get; set; }
        public int CurrentStep { get; set; }
        public int TotalSteps { get; set; }
    }
}