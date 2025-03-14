using System;
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
        private List<HistoryPoint> history;
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

        public SimulatorEngine(double initialPrice, Scenario scenario)
        {
            this.price = initialPrice;
            this.scenario = scenario;
            this.history = new List<HistoryPoint>
            {
                new HistoryPoint { Time = GetCurrentTimeMillis(), Price = this.price }
            };
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

            // ARIMA 모델 (ARMA(1,1)) 파라미터: 예시로 AR 계수 0.5, MA 계수 0.4 사용
            this.arCoefficient = 0.5;
            this.maCoefficient = 0.4;
            this.previousARIMAChange = 0.0;
            this.previousNoise = 0.0;

            // 랜덤 스파이크 설정: 5% 확률, 스파이크 크기 5
            this.spikeProbability = 0.05;
            this.spikeMagnitude = 5.0;

            AddInitialDataPoints();
        }

        // 현재 시간을 Unix 밀리초 단위로 반환
        private long GetCurrentTimeMillis()
        {
            return DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
        }

        // 초기 히스토리 데이터 10개 추가 (1초 간격)
        private void AddInitialDataPoints()
        {
            long now = GetCurrentTimeMillis();
            for (int i = 9; i > 0; i--)
            {
                long historicalTime = now - (i * 1000);
                double variation = (random.NextDouble() * 0.5 - 0.25) / 100;
                double historicalPrice = this.price * (1 + variation);
                history.Insert(0, new HistoryPoint { Time = historicalTime, Price = historicalPrice });
            }
        }

        // Box-Muller 변환을 이용한 정규분포 난수 생성
        private double NextGaussian()
        {
            double u1 = 1.0 - random.NextDouble();
            double u2 = 1.0 - random.NextDouble();
            return Math.Sqrt(-2.0 * Math.Log(u1)) * Math.Cos(2.0 * Math.PI * u2);
        }

        // 시뮬레이션 스텝: ARIMA 변화, 랜덤 스파이크, 이벤트 효과를 적용하여 가격 업데이트
        public StepResult Step(List<HistoryPoint> onChainData = null)
        {
            currentStep++;
            long now = GetCurrentTimeMillis();
            double dynamicVolatility = volatility * (1 + (currentStep / 100.0));

            // ARIMA 모델: ARMA(1,1)
            double arimaNoise = NextGaussian() * dynamicVolatility;
            double arimaChange = (arCoefficient * previousARIMAChange) + arimaNoise + (maCoefficient * previousNoise);
            previousNoise = arimaNoise;
            previousARIMAChange = arimaChange;
            if (currentStep < warmupPeriod)
            {
                arimaChange *= (currentStep / (double)warmupPeriod);
            }

            // 랜덤 스파이크 효과
            double spikeEffect = 0;
            if (random.NextDouble() < spikeProbability)
            {
                spikeEffect = NextGaussian() * spikeMagnitude;
            }

            // 이벤트 효과 적용
            double eventEffect = 0;
            if (eventTriggered && eventProgress < eventTotalSteps)
            {
                eventEffect = eventImpactPerStep;
                eventProgress++;
                double eventRandomness = (random.NextDouble() * 0.5 - 0.25) * eventImpactPerStep;
                eventEffect += eventRandomness;
            }

            // 최종 변화율 (퍼센트)
            double percentChange = arimaChange + spikeEffect + eventEffect;

            // 가격 업데이트
            price = price * (1 + percentChange / 100.0);
            history.Add(new HistoryPoint { Time = now, Price = price });
            if (history.Count > 100)
            {
                history = history.Skip(history.Count - 100).ToList();
            }

            // 이벤트 트리거 조건 확인
            if (!eventTriggered && currentStep >= eventTriggerPoint)
            {
                TriggerEvent();
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

        // 이벤트 트리거: 시나리오의 이벤트를 시작
        private void TriggerEvent()
        {
            eventTriggered = true;
            eventTotalSteps = scenario.EventDuration * 3;
            double impactMagnitude = scenario.EventImpact.Min +
                                     random.NextDouble() * (scenario.EventImpact.Max - scenario.EventImpact.Min);
            eventImpactPerStep = impactMagnitude / eventTotalSteps;
        }

        public List<HistoryPoint> GetHistory()
        {
            return new List<HistoryPoint>(history);
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
                Name = scenario.Name,
                Description = scenario.EventDescription,
                Progress = eventProgress,
                Total = eventTotalSteps,
                IsActive = eventProgress < eventTotalSteps
            };
        }
    }

}