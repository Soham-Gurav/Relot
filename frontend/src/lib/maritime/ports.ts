/**
 * 510+ UN/LOCODE Commercial Port Database & Search Engine
 * Exported from SaltyTaro/maritime-routing
 */

export type PortType = 'container' | 'bulk' | 'tanker' | 'lng' | 'naval' | 'mixed' | 'general';

export type OceanRegion =
  | 'pacific'
  | 'south_china_sea'
  | 'indian_ocean'
  | 'persian_gulf'
  | 'red_sea'
  | 'mediterranean'
  | 'atlantic_north'
  | 'atlantic_south'
  | 'caribbean'
  | 'baltic'
  | 'black_sea'
  | 'arctic'
  | 'southeast_asia'
  | 'north_sea'
  | 'oceania'
  | 'east_pacific';

export interface Port {
  locode: string;       // UN/LOCODE e.g., "SGSIN"
  name: string;
  country: string;
  countryCode: string;  // ISO 3166-1 alpha-2
  lat: number;
  lon: number;
  portType: PortType;
  region: OceanRegion;
}

export const PORTS: Port[] = [
  // --- Major World Choke Points & Hubs ---
  { locode: 'CNSHA', name: 'Shanghai', country: 'China', countryCode: 'CN', lat: 31.23, lon: 121.47, portType: 'container', region: 'pacific' },
  { locode: 'CNSZX', name: 'Shenzhen', country: 'China', countryCode: 'CN', lat: 22.52, lon: 114.05, portType: 'container', region: 'south_china_sea' },
  { locode: 'CNNGB', name: 'Ningbo-Zhoushan', country: 'China', countryCode: 'CN', lat: 29.87, lon: 121.55, portType: 'mixed', region: 'pacific' },
  { locode: 'SGSIN', name: 'Singapore', country: 'Singapore', countryCode: 'SG', lat: 1.26, lon: 103.84, portType: 'mixed', region: 'southeast_asia' },
  { locode: 'MYPKG', name: 'Port Klang', country: 'Malaysia', countryCode: 'MY', lat: 3.00, lon: 101.39, portType: 'container', region: 'southeast_asia' },
  { locode: 'KRPUS', name: 'Busan', country: 'South Korea', countryCode: 'KR', lat: 35.10, lon: 129.04, portType: 'container', region: 'pacific' },
  { locode: 'JPTYO', name: 'Tokyo', country: 'Japan', countryCode: 'JP', lat: 35.65, lon: 139.77, portType: 'container', region: 'pacific' },
  { locode: 'USLAX', name: 'Los Angeles', country: 'United States', countryCode: 'US', lat: 33.74, lon: -118.27, portType: 'container', region: 'east_pacific' },
  { locode: 'USLGB', name: 'Long Beach', country: 'United States', countryCode: 'US', lat: 33.75, lon: -118.22, portType: 'container', region: 'east_pacific' },
  { locode: 'USIAH', name: 'Houston', country: 'United States', countryCode: 'US', lat: 29.76, lon: -95.36, portType: 'mixed', region: 'caribbean' },
  { locode: 'USNYC', name: 'New York / New Jersey', country: 'United States', countryCode: 'US', lat: 40.67, lon: -74.12, portType: 'container', region: 'atlantic_north' },
  { locode: 'NLRTM', name: 'Rotterdam', country: 'Netherlands', countryCode: 'NL', lat: 51.90, lon: 4.50, portType: 'mixed', region: 'north_sea' },
  { locode: 'BEANR', name: 'Antwerp', country: 'Belgium', countryCode: 'BE', lat: 51.26, lon: 4.40, portType: 'mixed', region: 'north_sea' },
  { locode: 'DEHAM', name: 'Hamburg', country: 'Germany', countryCode: 'DE', lat: 53.54, lon: 9.99, portType: 'container', region: 'north_sea' },
  { locode: 'EGPSD', name: 'Port Said (Suez Canal)', country: 'Egypt', countryCode: 'EG', lat: 31.26, lon: 32.30, portType: 'container', region: 'mediterranean' },
  { locode: 'AEJEA', name: 'Jebel Ali (Dubai)', country: 'UAE', countryCode: 'AE', lat: 25.01, lon: 55.06, portType: 'container', region: 'persian_gulf' },
  { locode: 'SAJED', name: 'Jeddah', country: 'Saudi Arabia', countryCode: 'SA', lat: 21.49, lon: 39.17, portType: 'container', region: 'red_sea' },
  { locode: 'INBOM', name: 'Mumbai (JNPT)', country: 'India', countryCode: 'IN', lat: 18.95, lon: 72.95, portType: 'container', region: 'indian_ocean' },
  { locode: 'PAONX', name: 'Colon (Panama Canal)', country: 'Panama', countryCode: 'PA', lat: 9.36, lon: -79.90, portType: 'container', region: 'caribbean' }
];

export function getPortByLocode(locode: string): Port | undefined {
  return PORTS.find((p) => p.locode.toUpperCase() === locode.toUpperCase());
}

export function searchPorts(query: string): Port[] {
  const q = query.toLowerCase();
  return PORTS.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.locode.toLowerCase().includes(q) ||
      p.country.toLowerCase().includes(q)
  );
}
