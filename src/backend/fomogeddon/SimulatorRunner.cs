using System;
using System.Collections.Generic;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;

namespace fomogeddon.model
{
    public class SimulatorRunner
    {
        private readonly SimulatorEngine _simulator;
        private readonly int _simulationSpeedMs;
        private bool _isGameComplete;
        private double _currentPrice;
        private double _previousPrice;
        private double _percentChange;
        private double _gameProgress;
        private List<HistoryPoint> _chartData;
        private EventInfo _eventInfo;
        private string _notificationMessage;
        private string _notificationType;
        private double _pnl;
        private string _position;
        private double _entryPrice;
        private user_wallet _wallet;
        private List<HistoryPoint> _btcOnChainData;

        private TaskCompletionSource<string> _simulationCompletionSource;
        private CancellationTokenSource _cancellationTokenSource;

        public SimulatorRunner(SimulatorEngine simulator, int simulationSpeedMs)
        {
            _simulator = simulator ?? throw new ArgumentNullException(nameof(simulator));
            _simulationSpeedMs = simulationSpeedMs;
            _isGameComplete = false;
            _chartData = new List<HistoryPoint>();
            _position = "neutral";
            _wallet = new user_wallet { Bitcoin = 1.0 };
            _cancellationTokenSource = new CancellationTokenSource();
        }

        public async Task<string> StartSimulationAsync()
        {
            if (_simulator == null)
                return string.Empty;

            _simulationCompletionSource = new TaskCompletionSource<string>();
            _isGameComplete = false;

            // 시뮬레이션 시작 (비동기 루프)
            await RunSimulationLoopAsync(_cancellationTokenSource.Token);

            return await _simulationCompletionSource.Task;
        }

        private async Task RunSimulationLoopAsync(CancellationToken cancellationToken)
        {
            int parallelTasks = Environment.ProcessorCount; // CPU 개수만큼 병렬 실행
            List<Task> simulationTasks = new List<Task>();

            for (int i = 0; i < parallelTasks; i++)
            {
                simulationTasks.Add(Task.Run(() =>
                {
                    while (!_simulator.IsGameComplete() && !cancellationToken.IsCancellationRequested)
                    {
                        _previousPrice = _currentPrice;

                        StepResult result = _simulator.Step(_btcOnChainData); // Step()이 내부적으로 lock을 사용

                        _currentPrice = result.Price;
                        _percentChange = result.PercentChange;
                        _gameProgress = _simulator.GetGameProgress();
                        _chartData = _simulator.GetHistory(); // GetHistory()가 내부적으로 lock을 사용
                        _eventInfo = _simulator.GetEventInfo();

                        UpdatePriceDisplay(result.Price, _previousPrice);
                        if (Math.Abs(result.PercentChange) >= 0.5)
                        {
                            TriggerPriceAlert(result.PercentChange > 0 ? "up" : "down", result.PercentChange);
                        }

                        if (_eventInfo != null && _eventInfo.IsActive && _eventInfo.Progress == 1)
                        {
                            TriggerEventAlert();
                        }

                        if (_position != "neutral")
                        {
                            _pnl = CalculatePnL(_position, _entryPrice, result.Price, _wallet.Bitcoin);
                        }
                    }
                }, cancellationToken));
            }
            // 모든 작업이 끝날 때까지 대기
            await Task.WhenAll(simulationTasks);

            CompleteSimulation();
        }

        private void CompleteSimulation()
        {
            _isGameComplete = true;
            SetNotification($"Simulation complete! Final P&L: ${_pnl:F2}", _pnl >= 0 ? "success" : "warning");

            // 5초 후 알림 삭제
            Task.Delay(5000).ContinueWith(_ => ClearNotification());

            //ㅍJSON 형식의 차트 데이터 반환
            string jsonData = JsonSerializer.Serialize(_chartData);
            _simulationCompletionSource?.SetResult(jsonData);
        }

        public void StopSimulation()
        {
            _cancellationTokenSource.Cancel();
        }

        private void UpdatePriceDisplay(double newPrice, double oldPrice)
        {
            Console.WriteLine($"Price updated from {oldPrice:F2} to {newPrice:F2}");
        }

        private void TriggerPriceAlert(string alertType, double percentChange)
        {
            Console.WriteLine($"Triggering price alert: {alertType}, Change: {percentChange:F2}%");
        }

        private void TriggerEventAlert()
        {
            Console.WriteLine("Event alert triggered!");
        }

        private void SetNotification(string message, string type)
        {
            _notificationMessage = message;
            _notificationType = type;
            Console.WriteLine($"Notification: {message} ({type})");
        }

        private void ClearNotification()
        {
            _notificationMessage = null;
            _notificationType = null;
            Console.WriteLine("Notification cleared.");
        }

        private double CalculatePnL(string position, double entryPrice, double currentPrice, double bitcoin)
        {
            return (currentPrice - entryPrice) * bitcoin * (position == "long" ? 1 : -1);
        }
    }
}
