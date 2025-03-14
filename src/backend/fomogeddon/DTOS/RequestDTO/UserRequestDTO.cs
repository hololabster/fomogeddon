using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace fomogeddon.DTOS.RequestDTO
{
    public class UserRequestDTO
    {
        public string? wallet_address {get; set;}

        public DateTime? created_at {get; set;}
    }
}