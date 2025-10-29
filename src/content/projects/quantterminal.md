---
title: QuantTerminal
slug: quantterminal
year: 2024
tech: ["Python","React","FastAPI","PostgreSQL","Docker","AWS Lambda","GitHub Actions"]
summary: Production trading platform with live market data, strategy backtesting, and order execution—evolved from QuantZoo research.
repoUrl: "https://github.com/ronnielgandhe/quantterminal"
highlights:
  - Real-time WebSocket data feeds
  - Sub-200ms API latency
  - Automated risk controls
  - Terminal-inspired UI
---

## Problem

After building **QuantZoo** (a backtesting library for systematic strategies), I faced a practical limitation: **backtest results don't guarantee live trading success**. Even a profitable strategy can fail in production due to:

- **Execution delays**: By the time a signal is generated and sent to a broker, prices have moved.
- **Data feed reliability**: Live market data has gaps, stale quotes, and network issues that backtests ignore.
- **Order rejection**: Limit orders don't always fill; market orders incur slippage beyond backtested assumptions.
- **Operational complexity**: Running strategies requires monitoring, alerting, and incident response. Not just code.

I needed a **production-grade trading system** that could:
1. Ingest live market data with minimal latency
2. Execute QuantZoo strategies in real-time
3. Handle order placement and fill tracking
4. Provide risk controls (position limits, loss thresholds)
5. Log everything for post-trade analysis

---

## Approach

QuantTerminal is structured as a **3-tier architecture** to separate data ingestion, strategy execution, and order management.

### System Design

```
┌─────────────────┐       ┌──────────────────┐       ┌─────────────────┐
│  Data Layer     │──────▶│  Strategy Engine │──────▶│  Execution Layer│
│  (WebSockets)   │       │  (Python)        │       │  (Broker API)   │
└─────────────────┘       └──────────────────┘       └─────────────────┘
        │                          │                          │
        ▼                          ▼                          ▼
   PostgreSQL              Redis (State)           Trade Log (S3)
```

**Components**:

1. **Data Layer**: Subscribes to real-time market data (Polygon.io WebSocket), normalizes quotes/trades, writes to PostgreSQL time-series tables.

2. **Strategy Engine**: Runs QuantZoo strategies on incoming data, generates buy/sell signals, applies risk filters (max position size, daily loss limits).

3. **Execution Layer**: Translates signals into orders (Alpaca API), tracks fills, updates positions in Redis cache.

4. **Monitoring Dashboard**: React frontend with terminal-style UI. Shows live P&L, open positions, strategy performance.

### Technology Choices

- **FastAPI (Python)**: Async framework for handling concurrent WebSocket connections + REST endpoints. Needed non-blocking I/O to process market data without queuing delays.

- **PostgreSQL with TimescaleDB**: Time-series extension optimizes queries like "get last 1000 ticks for AAPL". Retention policies auto-delete old data.

- **Redis**: In-memory cache for position state (current holdings, pending orders). Backtests read from DB; live engine reads from Redis.

- **React + Tailwind**: Frontend mimics terminal aesthetics (monospace fonts, dark theme). WebSocket connection pushes updates to browser.

- **AWS Lambda + API Gateway**: Serverless functions for non-latency-critical tasks (daily performance reports, backfill missing data).

- **Docker Compose**: Local dev environment mirrors production (same DB schema, same ports). CI/CD runs integration tests in containers.

### Development Challenges

1. **WebSocket Reconnection Logic**: Market data feeds drop connections unexpectedly. Implemented exponential backoff + heartbeat checks. If no data for 5 seconds → reconnect.

2. **Race Conditions**: Strategy engine and execution layer both update position state. Fixed with optimistic locking (version field in Redis).

3. **Backtesting Divergence**: Live strategies behaved differently than backtests due to timestamp precision (backtest used daily close; live used sub-second ticks). Standardized to minute bars for both.

4. **Order Fill Tracking**: Alpaca API has eventual consistency. Order status updates arrive out-of-order. Built state machine (pending → filled/rejected) with idempotent handlers.

---

## Implementation Details

### Real-Time Data Ingestion

**Polygon.io WebSocket Client**:
```python
import websocket
import json

class MarketDataFeed:
    def __init__(self, api_key):
        self.ws = websocket.WebSocketApp(
            f"wss://socket.polygon.io/stocks",
            on_message=self.on_message,
            on_error=self.on_error,
            on_close=self.on_close
        )
        self.api_key = api_key
    
    def on_message(self, ws, message):
        data = json.loads(message)
        if data['ev'] == 'T':  # Trade event
            self.process_trade(data)
    
    def process_trade(self, trade):
        # Write to TimescaleDB
        db.execute("""
            INSERT INTO trades (symbol, price, size, timestamp)
            VALUES (%s, %s, %s, %s)
        """, (trade['sym'], trade['p'], trade['s'], trade['t']))
```

- **Throughput**: Handles 500+ messages/second during market hours (peak: 1200 msg/s during volatility spikes)
- **Latency**: Median 45ms from exchange timestamp to database write

### Strategy Execution

Reuses QuantZoo's `Strategy` base class, but runs incrementally on live data:

```python
class LiveStrategyRunner:
    def __init__(self, strategy, risk_manager):
        self.strategy = strategy
        self.risk_manager = risk_manager
        self.positions = {}
    
    def on_new_bar(self, symbol, bar):
        # Run strategy signal generation
        signal = self.strategy.generate_signal(symbol, bar)
        
        # Apply risk checks
        if self.risk_manager.can_trade(symbol, signal):
            self.execute_signal(symbol, signal)
    
    def execute_signal(self, symbol, signal):
        if signal == 1:  # Buy
            order = self.broker.place_order(symbol, qty=100, side='buy')
        elif signal == -1:  # Sell
            order = self.broker.place_order(symbol, qty=100, side='sell')
```

**Risk Manager**:
- **Position Limits**: Max 10% of portfolio per symbol
- **Daily Loss Limit**: If account down 5% from day's open, halt new trades
- **Drawdown Circuit Breaker**: If cumulative loss > 15%, email alert + pause all strategies

### Order Execution & Fill Tracking

```python
class OrderManager:
    def place_order(self, symbol, qty, side):
        order = alpaca.submit_order(
            symbol=symbol,
            qty=qty,
            side=side,
            type='limit',
            limit_price=self.calculate_limit_price(symbol),
            time_in_force='gtc'
        )
        
        # Store in Redis for tracking
        redis.hset(f"order:{order.id}", {
            "status": "pending",
            "symbol": symbol,
            "qty": qty,
            "side": side
        })
        
        return order.id
    
    def on_order_update(self, order_id, new_status):
        # Idempotent handler
        order = redis.hgetall(f"order:{order_id}")
        if order['status'] == 'filled':
            return  # Already processed
        
        redis.hset(f"order:{order_id}", "status", new_status)
        
        if new_status == 'filled':
            self.update_position(order)
```

**Fill Rate**: 87% of limit orders fill within 30 seconds (tested on SPY, AAPL over 3 months)

### Monitoring Dashboard

React frontend with:
- **Live P&L Chart**: WebSocket updates every second, shows cumulative profit/loss
- **Position Table**: Open positions with entry price, current price, unrealized P&L
- **Strategy Metrics**: Sharpe ratio, win rate, max drawdown (updated daily)
- **Order Book**: Recent trades with fill prices and timestamps

Built with `react-chartjs-2` for visualizations, styled with Tailwind to match portfolio site's terminal aesthetic.

### Testing & Deployment

**Unit Tests**: Strategy logic isolated from I/O (mocked data feeds, mocked broker API)

**Integration Tests**: Docker Compose spins up PostgreSQL + Redis + FastAPI, runs end-to-end order flow with mock market data

**Paper Trading**: Ran for 6 weeks on Alpaca paper account (real market data, simulated fills) to validate risk controls and latency assumptions

**CI/CD**: GitHub Actions runs tests on every PR, deploys to AWS ECS on merge to `main`

---

## Results / Learnings

### Quantitative Results

**Production Run (3 months, paper trading)**:
- **Strategies deployed**: 3 (momentum, mean reversion, volatility breakout)
- **Total trades**: 847
- **Win rate**: 54%
- **Sharpe ratio**: 0.71 (vs. 0.88 in backtest: execution drag ~20%)
- **Max drawdown**: -9.2%
- **Average latency**: Signal generation to order placement = **180ms**

**Performance Gap Analysis**:
- **Slippage**: Live fills averaged 4 bps worse than limit prices (backtest assumed 5 bps)
- **Timing**: Strategies triggered on minute bar close; real-time execution happened mid-bar → price slippage
- **Rejected Orders**: 3% of orders rejected (insufficient buying power during concurrent signals)

### Technical Learnings

1. **State Management**: Redis as a shared cache eliminated race conditions, but required careful key expiration policies (positions expire after 7 days of inactivity).

2. **Error Handling**: Wrapped every external API call in retry logic (exponential backoff, 3 attempts). Reduced failure rate from 12% to 0.8%.

3. **Observability**: Added structured logging (JSON format) + centralized logs in CloudWatch. Debugged 90% of issues without SSH-ing into servers.

4. **Cost Optimization**: Initial AWS bill was $200/month (RDS + ECS). Switched to Aurora Serverless for DB ($80/month) and spot instances for compute ($40/month).

### Business Insight

Realized that **infrastructure is a competitive advantage** in systematic trading. The 200+ hours spent on QuantTerminal's monitoring, error handling, and testing paid off when strategies ran unattended for weeks without incidents.

---

## Future Improvements

- **Multi-Broker Support**: Currently Alpaca-only; add Interactive Brokers, TD Ameritrade APIs
- **Machine Learning Strategies**: Integrate scikit-learn models trained on historical data (QuantZoo already has feature pipeline)
- **Portfolio Optimization**: Use Markowitz mean-variance to allocate capital across strategies
- **Mobile Alerts**: Push notifications via Twilio when drawdown exceeds threshold

---

**Status**: Live in paper trading • Transitioning to real capital (small account) • Monitoring daily

