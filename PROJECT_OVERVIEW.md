# Tempy: Enterprise Microclimate Intelligence Terminal
**A Comprehensive System Architecture & Deep Analytical Breakdown**

---

## 1. Executive Abstract
**Tempy** is an advanced geospatial, supply chain, and financial intelligence application. It bridges the gap between environmental physics (specifically microclimate temperatures and urban heat islands) and real-world commercial logistics. By fusing interactive Leaflet GIS mapping with live algorithmic data feeds, Tempy mathematically proves and visualizes how extreme weather events directly impact high-stakes industries like air freight, energy grids, retail location scouting, and quantitative stock trading.

---

## 2. Global Technical Architecture
Tempy is built as a highly optimized, single-command full-stack application designed for seamless deployment on platforms like Render.

- **Frontend**: Next.js 14 (App Router) utilizing React Server Components and heavily customized Tailwind CSS for a premium, dark-mode, glassmorphism aesthetic.
- **Map Rendering Engine**: Leaflet.js with custom mathematically-generated overlay nodes, HSL heat grids, and dynamic radius bounds.
- **Backend**: FastAPI (Python 3) handling intense data aggregation, `pandas` dataframe manipulation, and algorithmic backtesting.
- **Single-Command Monolith**: By executing `python main.py`, the backend initializes FastAPI, serves the pre-compiled Next.js static export via `StaticFiles`, and safely manages development port routing—allowing both frontend and backend to run concurrently from one command.

### External APIs Integrated
- **Open-Meteo**: Provides live and historical Global Horizontal Irradiance (GHI) and precise surface temperatures.
- **OpenSky Network (ADS-B)**: Provides live telemetry, altitude, and velocity data for commercial aircraft globally.
- **OpenStreetMap (OSM) Nominatim**: Powers the live geocoding, autocomplete search, and competitor density scanning.
- **Yahoo Finance (`yfinance`)**: Supplies historical equity price action for quantitative correlation.

---

## 3. The Core Financial Engine: The Microclimate Lag Gap
The entire premise of Tempy's financial modules relies on a quantitative theory called **The Microclimate Lag Gap**. 

**What is it?** Physical climate events (like a sudden 45°C heatwave at a major cargo hub) cause immediate, physical supply chain disruptions today. However, human traders and market algorithms are highly inefficient at pricing in these physical anomalies in real-time. The delay between a physical disruption and the subsequent drop in a company's stock price is the "Lag Gap".

- **Lag 0 (Immediate Reaction)**: Commodities (like `$UNG` natural gas or `$CORN`). If a heatwave hits the Texas Energy Grid, energy demand spikes immediately, and prices react on the exact same day.
- **Lag +3 to +5 Days (Delayed Reaction)**: Logistics, Aviation, and Supply Chains (`$FDX`, `$DAL`, `$JBHT`). A heatwave in Phoenix grounds flights or forces cargo offloading *today*, but Wall Street doesn't register the revenue loss until 3 to 5 days later. 

**The Alpha**: Tempy detects the physical event on Day 0. Quants can then execute short positions against logistics companies, capturing the profit when the broader market finally reacts on Day +4.

---

## 4. Deep Dive: Cargo & Aviation Terminal (`/cargo`)
### The Objective
To monitor live cargo aircraft and mathematically calculate if severe heat will force airlines to offload lucrative payload packages just to safely take off.

### The Physics: Density Altitude (DA)
When airplanes operate in extreme heat, the air physically expands and becomes less dense. Less dense air means less lift for the wings and less oxygen for the jet engines. 
- **The Metric**: `Density Altitude (DA)`
- **The Formula**: `DA = PA + 120 × (OAT - ISA)`
  - **PA (Pressure Altitude)**: The altitude corrected for non-standard atmospheric pressure.
  - **OAT (Outside Air Temperature)**: The live, real-time microclimate temperature fetched by Tempy.
  - **ISA (International Standard Atmosphere)**: The baseline temperature for that specific elevation.

**What this means**: If a plane is at an airport situated at 1,000 ft, but the OAT is 45°C, the Density Altitude might be 5,000 ft. The plane's engines will perform as if it is taking off from a 5,000 ft mountain. To avoid a fatal crash, FedEx/UPS must drastically reduce cargo weight, directly destroying profit margins for that flight.

### Implementation
- Fetches live ADS-B flight vectors over the USA.
- Renders a 3D God's Eye Globe trajectory map.
- Renders a 2D FortyGuard Thermal Map utilizing an inverse-distance weighting algorithm to paint a Blue-to-Red thermal gradient across the tarmac.

---

## 5. Deep Dive: Energy Grid & Solar Optimizer (`/grid`)
### The Objective
To help energy analysts determine the "Goldilocks Zone" for building new solar farms, proving that excessive heat actually destroys solar panel efficiency.

### The Physics: Thermal Degradation & GHI
It is a common misconception that hotter temperatures equal more solar energy.
- **The Metric (GHI)**: Global Horizontal Irradiance (GHI) measures the total solar radiation hitting a horizontal surface. High GHI is required for solar energy.
- **The Metric (Thermal Degradation)**: For every degree above 25°C (77°F), a standard Solar Photovoltaic (PV) panel mathematically loses ~0.4% to 0.5% of its efficiency.

**What this means**: The optimal location for a solar farm is a place with immense sunlight (High GHI) but very cold ambient temperatures (e.g., high-altitude deserts). 

### Implementation
- Users input any global location via the OSM Autocomplete search.
- Tempy generates a live 10km-20km circular radius.
- It pulls live GHI and temperature metrics for that specific latitude/longitude.
- It calculates the Thermal Degradation and maps a massive color-coded grid (Emerald = Optimal, Rose = Severe Degradation) to highlight exactly where to place the panels.

---

## 6. Deep Dive: Location Intelligence Scout (`/scout`)
### The Objective
An interactive location scout that calculates a definitive Suitability Score (0-100) for placing a brick-and-mortar business (e.g., a restaurant).

### The Metrics & How We Do It
The Suitability Score is calculated using three primary vectors:
1. **Demographic Footfall Index**: Synthetic foot traffic modeling for the region.
2. **Competitor Density (Rivals)**: Tempy queries the OpenStreetMap (OSM) API for a specific business category (like "restaurant" or "ice cream") within a strict bounding box of the selected coordinates. If there are too many rivals, the score drops.
3. **FortyGuard Heat Penalty**: 
   - **The Implementation**: The map draws a circular heatmap using a mathematical HSL (Hue, Saturation, Lightness) sweep. `hsl(240, 100%, 50%)` is Blue (Cold). `hsl(0, 100%, 50%)` is Red (Hot). 
   - **What it means**: High ambient temperatures actively suppress pedestrian footfall. If a location is trapped in an Urban Heat Island (an asphalt parking lot radiating heat), the Heat Penalty increases. The Suitability Score drops to warn business owners that summer foot traffic will be dead.

---

## 7. Deep Dive: Stocks Analytics (`/stocks`)
### The Objective
To visually correlate real-world climate physics with historical price action and technical indicators.

### The Metrics
- **Forward Return**: How much the stock price increased or decreased *X days after* an event.
- **RSI (Relative Strength Index)**: A momentum oscillator measuring the speed and change of price movements (0 to 100). Above 70 is overbought, below 30 is oversold.
- **SMA (Simple Moving Average)**: Smoothes out price data to identify the trend direction.

### Implementation
- **Data Pipeline**: The FastAPI backend manages the `yfinance` C-bindings (via `numpy<2` to prevent memory crashes) and streams clean historical DataFrames to the client.
- **Dynamic Routing**: Uses Next.js dynamic routes (`/stocks/[symbol]`). 
- **SSG (Static Site Generation)**: Implements Next.js `generateStaticParams` inside a Server Component wrapper to pre-build the pages for top tickers, bypassing client-side rendering restrictions and ensuring instantaneous load times.

---

## 8. Deep Dive: Algorithmic Backtesting (`/backtest`)
### The Objective
To provide empirical, statistical proof that the Microclimate Lag Gap actually generates profitable trades.

### Implementation
The backend simulation engine iterates through thousands of rows of historical `pandas` DataFrames. It isolates historical "Heatwave Spikes" (e.g., Days where Phoenix was > 42°C), and tracks the exact return of `$FDX` on Lag 0, Lag 1, Lag 3, and Lag 5. It outputs this entire matrix to the frontend, proving that Shorting logistics stocks on `Lag +4` statistically outperforms the baseline market.
