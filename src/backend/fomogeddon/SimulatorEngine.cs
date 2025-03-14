using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using fomogeddon;
using fomogeddon.model;

namespace fomogeddon
{
  public class SimulatorEngine
    {
        private double price;
        private ConcurrentQueue<HistoryPoint> history = new ConcurrentQueue<HistoryPoint>();
        private readonly object _stepLock = new object();
        private Scenario scenario;
        private bool eventTriggered;
        private int eventProgress;
        private int eventTotalSteps;
        private double eventImpactPerStep;
        private double randomSeed;
        private int eventTriggerPoint;
        private int totalGameSteps;
        private int currentStep;
        private double volatility;
        private int warmupPeriod;
        private Random random;

        // ARIMA 및 랜덤 스파이크 관련 변수
        private double previousARIMAChange;
        private double previousNoise;
        private double arCoefficient;
        private double maCoefficient;
        private double spikeProbability;
        private double spikeMagnitude;

        public SimulatorEngine(Scenario scenario, double initialPrice = 10000.0)
        {
            this.price = initialPrice;
            this.scenario = scenario;
            this.eventTriggered = false;
            this.eventProgress = 0;
            this.eventTotalSteps = 0;
            this.eventImpactPerStep = 0;
            this.random = new Random();
            this.randomSeed = random.NextDouble() * 100;

            // 이벤트 트리거 포인트: 50 ~ 99 스텝 사이
            this.eventTriggerPoint = 50 + random.Next(0, 50);

            // 게임 총 스텝 수
            this.totalGameSteps = 200;
            this.currentStep = 0;

            // 시장 변동성 및 웜업 기간
            this.volatility = 0.015;
            this.warmupPeriod = 15;

            // ARIMA 모델 (ARMA(1,1)) 파라미터
            this.arCoefficient = 0.5;
            this.maCoefficient = 0.4;
            this.previousARIMAChange = 0.0;
            this.previousNoise = 0.0;

            // 랜덤 스파이크 설정
            this.spikeProbability = 0.05;
            this.spikeMagnitude = 20.0;

            AddInitialDataPoints();
        }

        private long GetCurrentTimeMillis()
        {
            return DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
        }

        private void AddInitialDataPoints()
        {
            long now = GetCurrentTimeMillis();
            for (int i = 9; i > 0; i--)
            {
                long historicalTime = now - (i * 1000);
                double variation = (random.NextDouble() * 0.5 - 0.25) / 100;
                double historicalPrice = this.price * (1 + variation);
                history.Enqueue(new HistoryPoint { Time = historicalTime, Price = historicalPrice });
            }
        }

        private double NextGaussian()
        {
            double u1 = 1.0 - random.NextDouble();
            double u2 = 1.0 - random.NextDouble();
            return Math.Sqrt(-2.0 * Math.Log(u1)) * Math.Cos(2.0 * Math.PI * u2);
        }

        public StepResult Step(List<HistoryPoint> onChainData = null)
        {
            lock (_stepLock)
            {
                Console.WriteLine($"[SimulatorEngine] Running Step on Thread: {Thread.CurrentThread.ManagedThreadId}");

                currentStep++;
                long now = GetCurrentTimeMillis();
                double dynamicVolatility = volatility * (1 + (currentStep / 100.0));

                double arimaNoise = NextGaussian() * dynamicVolatility;
                double arimaChange = (arCoefficient * previousARIMAChange) + arimaNoise + (maCoefficient * previousNoise);
                previousNoise = arimaNoise;
                previousARIMAChange = arimaChange;
                if (currentStep < warmupPeriod)
                {
                    arimaChange *= (currentStep / (double)warmupPeriod);
                }

                double spikeEffect = 0;
                if (random.NextDouble() < spikeProbability)
                {
                    spikeEffect = NextGaussian() * spikeMagnitude;
                }

                double eventEffect = 0;
                if (eventTriggered && eventProgress < eventTotalSteps)
                {
                    eventEffect = eventImpactPerStep;
                    eventProgress++;
                    eventEffect += (random.NextDouble() * 0.5 - 0.25) * eventImpactPerStep;
                }

                double percentChange = arimaChange + spikeEffect + eventEffect;
                price = price * (1 + percentChange / 100.0);

                history.Enqueue(new HistoryPoint { Time = now+currentStep, Price = price });

                while (history.Count > 100)
                {
                    history.TryDequeue(out _);
                }

                return new StepResult
                {
                    Time = now,
                    Price = price,
                    PercentChange = percentChange,
                    IsEventActive = eventTriggered && eventProgress < eventTotalSteps,
                    CurrentStep = currentStep,
                    TotalSteps = totalGameSteps
                };
            }
        }

        private void TriggerEvent()
        {
            if (scenario == null) return;
            eventTriggered = true;
            eventTotalSteps = scenario.EventDuration * 3;
            double impactMagnitude = scenario.EventImpact.Min +
                                     random.NextDouble() * (scenario.EventImpact.Max - scenario.EventImpact.Min);
            eventImpactPerStep = impactMagnitude / eventTotalSteps;
        }

        public List<HistoryPoint> GetHistory()
        {
            return history.ToList();
        }

        public double GetCurrentPrice()
        {
            return price;
        }

        public bool IsGameComplete()
        {
            return currentStep >= totalGameSteps;
        }

        public double GetGameProgress()
        {
            return (currentStep / (double)totalGameSteps) * 100;
        }

        public EventInfo GetEventInfo()
        {
            if (!eventTriggered)
                return null;
            return new EventInfo
            {
                Name = scenario.originScenarioName,
                Description = scenario.EventDesc,
                Progress = eventProgress,
                Total = eventTotalSteps,
                IsActive = eventProgress < eventTotalSteps
            };
        }
    }
}
