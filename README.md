# Tempy

## What is Tempy?
Tempy is an advanced geospatial, supply chain, and financial intelligence application. It bridges the gap between environmental physics (specifically microclimate temperatures and weather) and real-world commercial logistics. By utilizing interactive maps and algorithmic data feeds, Tempy visualizes how physical climate phenomena impact high-stakes industries like air freight, energy grids, retail location scouting, and quantitative stock trading.

## What are we doing?
We are providing a holistic suite of real-time situational awareness terminals:
- **Location Intelligence Scout**: An interactive mapping engine to calculate a "Suitability Score" for placing a business (e.g., retail or restaurants) based on foot traffic, competitor density, and extreme heat metrics.
- **Cargo & Aviation Tracking**: Live visualization of aircraft via OpenSky ADS-B, paired with automated Density Altitude calculations. We simulate aerodynamic payload constraints and business exposure at major USA cargo hubs due to high heat.
- **Whole-of-America Energy Grid Optimizer**: Maps 500kV nuclear grid interconnects and provides a circular-radius Solar Photovoltaic (PV) placement evaluator to find "Goldilocks Zones" for solar farms based on thermal panel degradation physics.
- **Stocks & Quantitative Analytics**: Fuses historical financial price action (via yfinance) with advanced technical indicators (SMA, RSI) to help quantitative analysts build models around supply chain disruptions.

## How to run it yourself

Tempy is designed with a seamless, unified architecture. The entire application (both the FastAPI backend and the Next.js React frontend) is served from a single command. 

### Prerequisites
1. Ensure you have **Python 3** installed.
2. Ensure you have **Node.js** (and npm) installed for building the frontend.
3. Your Python environment must have the required dependencies (FastAPI, Uvicorn, Pandas, etc.).

### Build & Run Instructions

1. **Install Python Dependencies**
   Navigate to the `backend` folder and install requirements (if you haven't already):
   ```bash
   cd backend
   pip install fastapi uvicorn pydantic requests pandas yfinance "numpy<2"
   ```

2. **Install Frontend Dependencies & Build**
   Navigate to the `frontend` folder to install dependencies and run the static build:
   ```bash
   cd ../frontend
   npm install
   npm run build
   ```
   *(Note: The Next.js frontend is configured to export a static `out/` directory).*

3. **Start the Unified Server**
   Navigate back to the `backend` folder and run the `main.py` entrypoint:
   ```bash
   cd ../backend
   python main.py
   ```
   
   This single script will automatically:
   - Start the FastAPI backend on port `8000`.
   - Serve the Next.js frontend. If running in a development environment (without a static `out/` folder), it will safely spin up the Next.js dev server on port `3000` automatically!

4. **Access the Application**
   - **Production Mode**: Open your browser and navigate to `http://127.0.0.1:8000`
   - **Development Mode**: Open your browser and navigate to `http://localhost:3000` (FastAPI handles API requests on 8000).

Enjoy exploring Tempy!
