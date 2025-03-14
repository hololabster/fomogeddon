using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace fomogeddon.model
{
    public class EventInfo
    {
         public string Name { get; set; }
        public string Description { get; set; }
        public int Progress { get; set; }
        public int Total { get; set; }
        public bool IsActive { get; set; }
    }
}