using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

namespace fomogeddon.DTOS.ResponseDTO
{
    [Keyless] 
    public class PlayLeaderBoardResponseDTO
    {
        public int? rank {get; set;}

        public string? walletAddress{get; set;}

        public double? totalBalance{get; set;}

        
    }
}