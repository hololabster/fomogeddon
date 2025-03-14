using fomogeddon;
using fomogeddon.model;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

var summaries = new[]
{
    "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
};

app.MapGet("/weatherforecast", () =>
{
    var forecast =  Enumerable.Range(1, 5).Select(index =>
        new WeatherForecast
        (
            DateOnly.FromDateTime(DateTime.Now.AddDays(index)),
            Random.Shared.Next(-20, 55),
            summaries[Random.Shared.Next(summaries.Length)]
        ))
        .ToArray();

       // 예제 시나리오 설정
            Scenario scenario = new Scenario
            {
                Name = "Market Shock",
                EventDescription = "A sudden market event causing volatility.",
                EventDuration = 10, // 기본 이벤트 지속 시간
                EventImpact = new ImpactRange { Min = -2.0, Max = 2.0 }
            };

            // 초기 가격 100, 시나리오 적용하여 엔진 생성
            SimulatorEngine engine = new SimulatorEngine(100.0, scenario);

            // 시뮬레이션 속도: 500ms 간격 (원하는 값으로 변경 가능)
            SimulatorRunner runner = new SimulatorRunner(engine, 500);

            // 시뮬레이션 시작
            runner.StartSimulation();

            Console.WriteLine("Simulation started. Press any key to exit.");
            Console.ReadKey();

            // 종료 시 시뮬레이션 중단
            runner.StopSimulation();

    return forecast;
})
.WithName("GetWeatherForecast")
.WithOpenApi();

app.Run();

record WeatherForecast(DateOnly Date, int TemperatureC, string? Summary)
{
    public int TemperatureF => 32 + (int)(TemperatureC / 0.5556);
}
