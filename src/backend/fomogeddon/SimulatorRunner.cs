using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace fomogeddon.model
{

    // SimulatorRunner 클래스: 시뮬레이션 실행 및 UI(콘솔) 업데이트 처리
    public class SimulatorRunner
    {
        private SimulatorEngine simulator;
        private Timer simulationTimer;
        private int simulationSpeed; // ms 단위
        private bool isSimulationRunning;
        private bool isGameComplete;
        private double currentPrice;
        private double previousPrice;
        private double percentChange;
        private double gameProgress;
        private List<HistoryPoint> chartData;
        private EventInfo eventInfo;
        private string notificationMessage;
        private string notificationType;
        private double pnl;
        private string position; // 예: "neutral", "long", "short"
        private double entryPrice;
        private user_wallet wallet;
        private List<HistoryPoint> btcOnChainData; // 온체인 데이터 (필요 시)

        public SimulatorRunner(SimulatorEngine engine, int simSpeed)
        {
            simulator = engine;
            simulationSpeed = simSpeed;
            isSimulationRunning = false;
            isGameComplete = false;
            chartData = new List<HistoryPoint>();
            position = "neutral"; // 초기 포지션
            wallet = new user_wallet { Bitcoin = 1.0 }; // 예시: 1 비트코인 보유
            // btcOnChainData는 외부 데이터로 채워질 수 있음
        }

        public void StartSimulation()
        {
            if (simulator == null) return;

            isSimulationRunning = true;

            // 디지털 사운드 효과 재생 ("start")
            PlayDigitalSound("start");

            // 디지털 노이즈 효과 추가
            AddDigitalNoiseEffect();

            // 게임 완료 상태 초기화
            isGameComplete = false;

            // 타이머를 사용하여 일정 간격마다 시뮬레이션 스텝 실행
            simulationTimer = new Timer(SimulationCallback, null, 0, simulationSpeed);
        }

        private void SimulationCallback(object state)
        {
            if (simulator != null)
            {
                // 이전 가격 저장
                previousPrice = currentPrice;

                // 게임 완료 여부 확인
                if (simulator.IsGameComplete())
                {
                    isGameComplete = true;
                    StopSimulation();
                    SetNotification($"Simulation complete! Final P&L: ${pnl:F2}", pnl >= 0 ? "success" : "warning");

                    // 5초 후 알림 지우기 (비동기로 처리)
                    Task.Delay(5000).ContinueWith(t => ClearNotification());
                    return;
                }

                // 시뮬레이터 스텝 실행 (온체인 데이터가 있다면 전달)
                StepResult result = simulator.Step(btcOnChainData);

                // 결과 업데이트
                currentPrice = result.Price;
                percentChange = result.PercentChange;
                gameProgress = simulator.GetGameProgress();

                // 차트 데이터를 최신 히스토리로 업데이트
                chartData = simulator.GetHistory();

                // 가격 변동에 따른 시각 효과 업데이트
                UpdatePriceDisplay(result.Price, previousPrice);

                // 이벤트 정보 업데이트
                eventInfo = simulator.GetEventInfo();

                // 큰 가격 변화에 대해 알림 (변동률 0.5 이상)
                if (Math.Abs(result.PercentChange) >= 0.5)
                {
                    string alertType = result.PercentChange > 0 ? "up" : "down";
                    TriggerPriceAlert(alertType, result.PercentChange);
                    AddMatrixCodeRainEffect(alertType == "up" ? "#00ff7f" : "#ff3e4d");
                }

                // 이벤트 시작 시 알림 및 효과
                if (eventInfo != null && eventInfo.IsActive && eventInfo.Progress == 1)
                {
                    PlayDigitalSound("alert");
                    SetGlitchEffect(true);
                    Task.Delay(1500).ContinueWith(t => SetGlitchEffect(false));
                    TriggerEventAlert();
                    AddEMPWaveEffect("#ffcc00");
                    SetNotification($"{eventInfo.Name} event triggered: {eventInfo.Description}", "warning");
                    Task.Delay(5000).ContinueWith(t => ClearNotification());
                }

                // 포지션이 있을 경우 PnL 계산
                if (position != "neutral")
                {
                    double positionPnl = CalculatePnL(position, entryPrice, result.Price, wallet.Bitcoin);
                    pnl = positionPnl;
                }
            }
        }

        public void StopSimulation()
        {
            isSimulationRunning = false;
            if (simulationTimer != null)
            {
                simulationTimer.Dispose();
                simulationTimer = null;
            }
        }

        // 아래는 효과 및 상태 업데이트를 위한 스텁 메서드들입니다.
        private void PlayDigitalSound(string soundType)
        {
            Console.WriteLine($"Playing digital sound: {soundType}");
        }

        private void AddDigitalNoiseEffect()
        {
            Console.WriteLine("Adding digital noise effect.");
        }

        private void UpdatePriceDisplay(double newPrice, double oldPrice)
        {
            Console.WriteLine($"Price updated from {oldPrice:F2} to {newPrice:F2}");
        }

        private void TriggerPriceAlert(string alertType, double percentChange)
        {
            Console.WriteLine($"Triggering price alert: {alertType}, Change: {percentChange:F2}%");
        }

        private void AddMatrixCodeRainEffect(string color)
        {
            Console.WriteLine($"Adding matrix code rain effect with color {color}");
        }

        private void SetGlitchEffect(bool isActive)
        {
            Console.WriteLine($"Glitch effect is now {(isActive ? "active" : "inactive")}");
        }

        private void TriggerEventAlert()
        {
            Console.WriteLine("Event alert triggered!");
        }

        private void AddEMPWaveEffect(string color)
        {
            Console.WriteLine($"Adding EMP wave effect with color {color}");
        }

        private void SetNotification(string message, string type)
        {
            notificationMessage = message;
            notificationType = type;
            Console.WriteLine($"Notification: {message} ({type})");
        }

        private void ClearNotification()
        {
            notificationMessage = null;
            notificationType = null;
            Console.WriteLine("Notification cleared.");
        }

        private double CalculatePnL(string position, double entryPrice, double currentPrice, double bitcoin)
        {
            // 단순 계산 예시: 포지션에 따라 가격 차이에 비트코인 수량 곱셈
            return (currentPrice - entryPrice) * bitcoin * (position == "long" ? 1 : -1);
        }
    }
}
