using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using fomogeddon.Service;
using fomogeddon.DTOS.RequestDTO;

namespace fomogeddon.Controller
{
    [ApiController]
    [Route("[controller]")]
    public class ChartController : ControllerBase
    {
        private readonly IChartService _chartDataService;

    // 생성자 주입을 통해 IChartDataService를 받음
    public ChartController(IChartService chartDataService)
    {
        _chartDataService = chartDataService;
    }

    [HttpGet("getChartData")]
    public async Task<IActionResult> GetChartData([FromQuery] String origin_scenario_id)
    {
        // 서비스에서 비동기로 차트 데이터를 가져옴
        double initialPrice = 10000.0;
        var jsonData = await _chartDataService.GetChartDataAsync(origin_scenario_id);
        return Ok(jsonData); // JSON 문자열이 응답 본문에 포함됨
    }

    [HttpPost("save-playData")]
    public async Task<IActionResult> SavePlayData([FromBody] SavePlayDataDTO request){

        var createdEntity = await _chartDataService.SavePlayData(request);

        return Ok();
    }

    [HttpPost("save-user")]
    public async Task<IActionResult> SaveUser([FromBody] UserRequestDTO request){

        var createdEntity = await _chartDataService.SaveUser(request);

        return Ok();
    }

    [HttpGet("getLeaderBoard")]
    public async Task<IActionResult> GetLeaderBoard([FromQuery] string? scenarioId = null)
    {
        // 서비스에서 비동기로 차트 데이터를 가져옴
        var list = await _chartDataService.getLeaderBoardList(scenarioId);
        return Ok(list); // JSON 문자열이 응답 본문에 포함됨
    }
    }
}