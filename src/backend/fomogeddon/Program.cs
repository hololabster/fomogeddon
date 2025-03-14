using fomogeddon.Service; // IChartService, ChartService가 포함된 네임스페이스
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using fomogeddon.Data;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// appsettings.json에 정의된 PostgreSQL 연결 문자열 사용
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(connectionString));

// CORS 정책 추가
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowSpecificOrigins",
        policy =>
        {
            policy.WithOrigins(
                    "https://fomogeddon.playarts.ai",
                    "http://localhost:9999"
                )
                .AllowAnyHeader()
                .AllowAnyMethod()
                .AllowCredentials();
        });
});

// 컨트롤러 등록
builder.Services.AddControllers();

// ChartService만 DI에 등록 (SimulatorEngine은 내부에서 직접 생성)
builder.Services.AddScoped<IChartService, ChartService>();

var app = builder.Build();

app.UseRouting();

// CORS 미들웨어 추가 (UseRouting 다음, UseAuthorization 전에 위치)
app.UseCors("AllowSpecificOrigins");

app.UseAuthorization();

app.MapControllers();

app.Run();