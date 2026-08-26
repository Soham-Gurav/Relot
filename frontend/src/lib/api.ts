import axios from "axios";

const API_BASE = "http://127.0.0.1:8000/api";

export interface EconomicNode {
  id: string;
  name: string;
  category: string;
  lat: number;
  lng: number;
  primary_ticker: string;
  related_tickers: string[];
  lag_days: number;
  physics_metric: string;
  description: string;
  current_temp?: number;
  temp?: number;
  has_heat_spike?: boolean;
}

export interface MarketQuote {
  symbol: string;
  name: string;
  sector: string;
  price: number;
  change_pct: number;
  lag_days: number;
}

export interface LagDistributionItem {
  lag: number;
  r: number;
}

export interface EmpiricalStats {
  normal_days_avg_return: number;
  heatwave_days_avg_return: number;
  net_heat_alpha: number;
  p_value: number;
  sample_size: number;
  spike_days_count: number;
}

export interface StockProfile {
  symbol: string;
  name: string;
  sector: string;
  node_name: string;
  node_id: string;
  optimal_lag: string;
  optimal_lag_days: number;
  heat_sensitivity_score: number;
  mechanism: string;
  "52w_high": number;
  "52w_low": number;
  market_cap: string;
  avg_volume: string;
  corr_1m: number;
  corr_1y: number;
  corr_3y: number;
  historical_insights: string[];
  lag_distribution?: LagDistributionItem[];
  empirical_stats?: EmpiricalStats;
  live_price?: number;
  live_change_pct?: number;
}

export interface PredictiveSignal {
  id: string;
  node_name: string;
  ticker: string;
  ticker_name: string;
  ticker_price: number;
  ticker_change: number;
  heat_parameter: string;
  risk_score: number;
  risk_level: string;
  optimal_lag: string;
  prediction: string;
}

export interface BacktestMatrixItem {
  node_id: string;
  node_name: string;
  ticker: string;
  category: string;
  optimal_lag: string;
  optimal_lag_days: number;
  max_corr: number;
  lag_0: number;
  lag_1: number;
  lag_2: number;
  lag_3: number;
  lag_5: number;
  insight: string;
}

export const fetchEconomicNodes = async (): Promise<EconomicNode[]> => {
  try {
    const res = await axios.get(`${API_BASE}/nodes`);
    return res.data.nodes;
  } catch (e) {
    console.error("Error fetching nodes:", e);
    return [];
  }
};

export const fetchMarketQuotes = async (): Promise<MarketQuote[]> => {
  try {
    const res = await axios.get(`${API_BASE}/market/quotes`);
    return res.data.quotes;
  } catch (e) {
    console.error("Error fetching quotes:", e);
    return [];
  }
};

export const fetchStockProfile = async (symbol: string): Promise<StockProfile | null> => {
  try {
    const res = await axios.get(`${API_BASE}/market/stock/${symbol}`);
    return res.data.stock;
  } catch (e) {
    console.error(`Error fetching stock profile for ${symbol}:`, e);
    return null;
  }
};

export interface StockHistoryItem {
  date: string;
  close: number;
  denoised_close?: number;
  temperature: number;
  is_heat_spike?: boolean;
  spike_severity?: string;
  lagged_close?: number;
  raw_return_pct?: number;
  heat_impact_pct?: number;
  event_type?: string;
  is_negative_corr?: boolean;
  volume?: number;
}

export const fetchStockHistory = async (symbol: string, period: string = "1y"): Promise<StockHistoryItem[]> => {
  try {
    const res = await axios.get(`${API_BASE}/market/stock/${symbol}/history?period=${period}`);
    return res.data.history;
  } catch (e) {
    console.error(`Error fetching stock history for ${symbol} (${period}):`, e);
    return [];
  }
};

export const fetchTickerHistory = fetchStockHistory;

export const fetchPredictiveSignals = async (): Promise<PredictiveSignal[]> => {
  try {
    const res = await axios.get(`${API_BASE}/predictive/signals`);
    return res.data.signals;
  } catch (e) {
    console.error("Error fetching signals:", e);
    return [];
  }
};

export const fetchBacktestMatrix = async (): Promise<BacktestMatrixItem[]> => {
  try {
    const res = await axios.get(`${API_BASE}/backtest/matrix`);
    return res.data.matrix;
  } catch (e) {
    console.error("Error fetching backtest matrix:", e);
    return [];
  }
};

export interface LiveVehicle {
  callsign: string;
  carrier: string;
  lat: number;
  lng: number;
  altitude_m: number;
  speed_kts: number;
  type: string;
}

export const fetchLiveVehicles = async (): Promise<LiveVehicle[]> => {
  try {
    const res = await axios.get(`${API_BASE}/live-vehicles`);
    return res.data.vehicles || [];
  } catch (e) {
    console.error("Error fetching live vehicles:", e);
    return [];
  }
};

export const fetchFortyGuardTelemetry = async (lat: number, lng: number) => {
  try {
    const res = await axios.get(`${API_BASE}/telemetry?lat=${lat}&lng=${lng}`);
    return res.data;
  } catch (e) {
    console.error("Error fetching telemetry:", e);
    return null;
  }
};
