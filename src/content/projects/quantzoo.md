---
title: QuantZoo
slug: quantzoo
year: 2025
tech: ["Python","pandas","numpy","scikit-learn","FastAPI","Streamlit","DuckDB","Docker","PyTest","GitHub Actions"]
summary: Production-grade, open-source Python framework for systematic strategy research, backtesting, walk-forward validation, real-time streaming, portfolio management, and risk analytics.
repoUrl: "https://github.com/ronnielgandhe/quantzoo"
highlights:
    - Unified strategy API and modular backtesting engine
    - Event-driven backtester with realistic fees/slippage
    - Walk-forward & purged K-fold validation
    - Real-time FastAPI backend + Streamlit dashboard
    - Scalable persistence with DuckDB and Parquet
---

# QuantZoo — Technical Report (2025)

QuantZoo is a production-grade, open-source Python framework for systematic trading strategy research, backtesting, walk-forward validation, real-time streaming, portfolio management, and risk analytics. It is designed for reproducibility, extensibility, and professional quant development.

## Problem Statement

Quantitative trading research is often fragmented:

- Tutorials and blog posts use inconsistent data formats and ad-hoc backtesting logic.
- Results are not reproducible due to different assumptions, data sources, and lack of standardized infrastructure.
- Comparing strategies fairly is difficult without a common engine for execution, risk, and reporting.

QuantZoo solves these problems by providing a unified strategy API, a modular backtesting engine, standardized data ingestion and reporting, and comprehensive validation tools.

## Architecture Principles

- **Modular Design**: Each component (strategy, data, execution, metrics, reporting) is a separate module and can be replaced or extended independently.
- **Strategy as Pure Function**: Strategies are implemented as pure signal generators that produce signals from OHLCV data with no hidden state or side effects.
- **Separation of Concerns**: Strategy logic, execution simulation, analytics, and persistence are strictly decoupled.
- **No Look-Ahead Bias**: All indicators and metrics are computed using only historical information available at the time of the signal.
- **Reproducibility**: Deterministic results via seed control, pinned dependencies, and YAML experiment configurations.
- **Extensibility**: New strategies, indicators, and data sources can be added with minimal boilerplate.

## Technology Stack

- Python 3.11+
- pandas, numpy — fast vectorized time-series operations
- scikit-learn — ML strategies and validation pipelines
- FastAPI — real-time/replay streaming backend
- Streamlit — interactive strategy/portfolio dashboard
- DuckDB & Parquet — scalable analytics and audit trail storage
- PyTest — unit, integration, and regression tests
- Docker & GitHub Actions — reproducible CI/CD and deployments

## Core Components

- **Strategies**: Implementations live in `strategies/` and inherit from a small `Strategy` interface. Example strategies included: MNQ_808 (example), momentum, volatility breakout, pairs trading.
- **Backtesting Engine**: Event-driven, vectorized engine that supports position sizing, slippage, commissions, and realistic execution simulation.
- **Portfolio Engine**: Capital allocation across strategies with equal-weight, risk parity, volatility targeting, and scheduled rebalancing.
- **Metrics & Reporting**: Standardized metrics (Sharpe, max drawdown, win rate, profit factor, historical VaR, expected shortfall) and markdown/image reports generated per backtest.
- **Indicators**: Strictly historical technical indicators (ATR, RSI, MACD, Bollinger Bands) implemented with no look-ahead.
- **Data Layer**: Pluggable loaders for CSV/Parquet, Yahoo Finance, Polygon, Alpha Vantage, and custom feeds with quality-cleaning (splits/dividends/missing data handling).
- **Real-Time Infrastructure**: FastAPI service for live or replayed streams and a Streamlit dashboard for visualization and strategy selection.

## Validation & Testing

- **Walk-Forward Analysis**: Expanding and sliding window validation with support for purged K-fold splits to avoid leakage.
- **Unit Tests**: Indicators, signal generation, and smaller modules tested on synthetic and controlled data.
- **Integration Tests**: End-to-end backtests with expected outputs to detect regressions.
- **Regression Tests**: Freeze outputs for canonical inputs and fail CI when results drift.
- **CI/CD**: GitHub Actions runs tests, linting, and type checks on every commit and publishes artifacts for review.

## Example Results (2025)

MNQ_808 (15m, 2025 Backtest)

- Sharpe Ratio: 2.81
- Max Drawdown: 9.37%
- Win Rate: 51.6%
- Total Return: 29.1% (Jan–Oct 2025)
- Commission: $0.32/side, Slippage: 0.5 tick

!Dashboard Screenshot

These results illustrate the engine's ability to capture high-frequency intraday signals while modeling realistic fees and slippage.

## Key Features

- Event-driven, vectorized backtester with realistic fees and slippage models
- PineScript-compatible strategy API to reduce translation friction
- Walk-forward optimization and purged K-fold validation primitives
- Real-time FastAPI streaming backend and Streamlit dashboard for live and replay modes
- Comprehensive metric suite: Sharpe, drawdown, profit factor, win rate, VaR/ES
- Reproducible YAML experiment configs and deterministic seeds
- Portfolio allocation and risk management primitives
- Scalable storage and reporting via DuckDB and Parquet

## Development Highlights

- **Vectorized Execution**: Backtests leverage pandas/numpy to maximize speed and reliability.
- **Data Quality Pipeline**: Automated cleaning for missing bars, splits, and dividends.
- **Execution Realism**: Flexible slippage/commission models and basic market-impact hooks.
- **Extensible API**: Add strategies or indicators with minimal boilerplate — a single method to implement for signal generation.
- **Documentation & Examples**: API reference, YAML experiment examples, and reproducible notebooks for onboarding.

## Impact

QuantZoo is used for research, education, and live trading prototypes. Its architecture influenced subsequent projects (e.g., QuantTerminal), and the project is open for contributions.

## Roadmap

- Live broker integrations (Alpaca, IBKR)
- Advanced order types and market-impact-aware execution simulation
- Multi-asset portfolio optimization and allocation
- Machine learning strategy templates and automated feature pipelines
- Enhanced reporting, attribution, and automated notebooks for report generation

## License

MIT License — see LICENSE

## Contributing

- Fork and branch from main
- Add new strategies, indicators, or data sources
- Write tests and documentation
- Submit pull requests via GitHub

Built with Python 3.11+ • Powered by pandas, numpy, FastAPI, Streamlit, DuckDB, and scientific computing

