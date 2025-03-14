using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using fomogeddon.DTOS.RequestDTO;
using fomogeddon.DTOS.ResponseDTO;
using fomogeddon.model;

namespace fomogeddon.Service
{
    public interface IChartService
    {
        Task<string> GetChartDataAsync(String origin_scenario_id);

        Task<SavePlayDataDTO> SavePlayData(SavePlayDataDTO request);
       
        Task<List<PlayLeaderBoardResponseDTO>> getLeaderBoardList(string scenarioId);

        Task<UserRequestDTO> SaveUser(UserRequestDTO request);
    }
}