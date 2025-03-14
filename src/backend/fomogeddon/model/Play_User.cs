using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace fomogeddon.model
{
    public class Play_User
    {
        [Key]
        [Column("wallet_address")]
        public string wallet_address {get; set;}

         [Column("created_At")]
        public DateTime? created_at {get; set;}

    }
}