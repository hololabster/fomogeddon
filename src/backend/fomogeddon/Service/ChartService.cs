using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using fomogeddon.Data;
using fomogeddon.DTOS.RequestDTO;
using fomogeddon.DTOS.ResponseDTO;
using fomogeddon.model;
using fomogeddon.Service;
using Microsoft.EntityFrameworkCore;


namespace fomogeddon.Service
{
    public class ChartService : IChartService
    {
        private readonly ILogger<ChartService> _logger;
        private SimulatorEngine _simulatorEngine;
        private Scenario _scenario;  

        private readonly ApplicationDbContext _context;

        public ChartService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<string> GetChartDataAsync(String origin_scenario_id)
        {
           
           Scenario research_scenario = await _context.origin_scenario
                .Where(s => s.originScenarioId == origin_scenario_id)
                .FirstOrDefaultAsync() ?? new Scenario();

            research_scenario.EventImpact =  research_scenario.EventImpact != null && research_scenario.EventImpacts.Count == 2
                ? new ImpactRange { Min = research_scenario.EventImpacts[0], Max = research_scenario.EventImpacts[1] }
                : new ImpactRange();

            // 필요한 매개변수를 직접 전달하여 SimulatorEngine 인스턴스를 생성합니다.
            var simulatorEngine = new SimulatorEngine(research_scenario, 10000.0);
            var simulatorRunner = new SimulatorRunner(simulatorEngine, 1000);

            // 시뮬레이션 완료 시 JSON 형식의 차트 데이터를 반환합니다.
             string chartDataJson = await Task.Run(() => simulatorRunner.StartSimulationAsync());
            return chartDataJson;
        }

        public async Task<SavePlayDataDTO> SavePlayData(SavePlayDataDTO request)
        {
            //using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var playData = new ScenarioPlayData
                {
                    WalletAddress = request.wallet_address,
                    originScenarioId = request.origin_scenario_id,
                    balance = request.balance,
                    customChartDataJson = request.customChartDataJson , // 기본 빈 리스트 할당
                    playGameDataJson = request.playGameDataJson
                };
                // 엔티티 추가
                _context.ScenarioPlayData.Add(playData);

                // 변경사항 저장 (삽입)
                await _context.SaveChangesAsync();

                // 저장 후 request DTO를 반환 (필요에 따라 새 DTO 생성 가능)
                return request;
            }
            catch (System.Exception)
            {
                //_logger.LogError($"Exception: " + ex.Message);
                throw;
            }
        }
     public async Task<List<PlayLeaderBoardResponseDTO>> getLeaderBoardList(string scenarioId)
        {
            var query = _context.ScenarioPlayData.AsQueryable(); // 초기 Query

            // 🔥 scenarioId가 `null` 또는 공백이 아닐 때만 Where 조건 추가
            if (!string.IsNullOrWhiteSpace(scenarioId))
            {
                query = query.Where(s => s.originScenarioId == scenarioId);
            }

            var result = await query.GroupBy(s => s.WalletAddress)
                            .Select(g => new PlayLeaderBoardResponseDTO
                            {
                                walletAddress = g.Key,
                                totalBalance = g.Sum(s => s.balance),
                                rank = 0
                            })
                            .ToListAsync();

            // LINQ에서 직접 순위 계산
            var rankedResult = result.OrderByDescending(r => r.totalBalance)
                             .Select((r, index) => new PlayLeaderBoardResponseDTO
                             {
                                 rank = index + 1,
                                 walletAddress = r.walletAddress,
                                 totalBalance = r.totalBalance
                             })
                             .ToList();

            return rankedResult;
    }

     public async Task<UserRequestDTO> SaveUser(UserRequestDTO request)
        {
            //using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var userData = new Play_User
                {
                    wallet_address = request.wallet_address,
                    created_at = DateTime.UtcNow
                };
                // 엔티티 추가
                _context.play_user.Add(userData);

                // 변경사항 저장 (삽입)
                await _context.SaveChangesAsync();

                // 저장 후 request DTO를 반환 (필요에 따라 새 DTO 생성 가능)
                return request;
            }
            catch (Exception ex)
            {
                _logger.LogError($"Exception: " + ex.Message);
                throw;
            }
        }
    }
}
