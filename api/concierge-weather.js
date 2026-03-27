// NWS Weather API proxy for ElevenLabs voice concierge
// Returns concise weather data + voice-ready summary for Devils Lake / Manitou Beach MI

const LAT = '42.005';
const LNG = '-84.289';
const USER_AGENT = 'ManitoBeachConcierge/1.0 hello@yetigroove.com';

// Hardcoded grid endpoints from NWS points lookup (these don't change for a fixed lat/lng)
const FORECAST_URL = `https://api.weather.gov/gridpoints/DTX/25,15/forecast`;
const ALERTS_URL = `https://api.weather.gov/alerts/active?point=${LAT},${LNG}`;

const NWS_HEADERS = { 'User-Agent': USER_AGENT, 'Accept': 'application/geo+json' };

async function fetchJSON(url) {
  const resp = await fetch(url, { headers: NWS_HEADERS });
  if (!resp.ok) throw new Error(`NWS ${resp.status}: ${url}`);
  return resp.json();
}

function buildSummary(current, tonight, alerts) {
  const parts = [];

  // Current conditions
  const temp = current?.temperature ?? '';
  const unit = current?.temperatureUnit === 'F' ? 'degrees' : 'degrees Celsius';
  const wind = current?.windSpeed || '';
  const windDir = current?.windDirection || '';
  const shortFc = (current?.shortForecast || '').toLowerCase();
  parts.push(`Right now it's ${temp} ${unit} and ${shortFc} with winds from the ${windDir} at ${wind}.`);

  // Alerts
  if (alerts.length > 0) {
    const names = alerts.map(a => a.event).join(', ');
    parts.push(`Active weather alerts: ${names}. Please use caution on the lake.`);
  } else {
    parts.push('No active weather alerts.');
  }

  // Tonight
  if (tonight) {
    const tTemp = tonight.temperature ?? '';
    const tFc = (tonight.shortForecast || '').toLowerCase();
    parts.push(`Tonight expect ${tFc} with a low around ${tTemp}.`);
  }

  return parts.join(' ');
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const [forecastData, alertsData] = await Promise.all([
      fetchJSON(FORECAST_URL),
      fetchJSON(ALERTS_URL),
    ]);

    const periods = forecastData?.properties?.periods || [];
    const alerts = (alertsData?.features || []).map(f => ({
      event: f.properties?.event || 'Unknown',
      headline: f.properties?.headline || '',
      severity: f.properties?.severity || '',
      description: f.properties?.description || '',
      expires: f.properties?.expires || '',
    }));

    // Find today and tonight periods
    const current = periods[0] || null;
    const tonight = periods.find(p => p.isDaytime === false) || periods[1] || null;

    // Next 3-4 periods after today/tonight for the week outlook
    const week = periods.slice(2, 6).map(p => ({
      name: p.name,
      temperature: p.temperature,
      temperatureUnit: p.temperatureUnit,
      shortForecast: p.shortForecast,
      windSpeed: p.windSpeed,
    }));

    const summary = buildSummary(current, tonight, alerts);

    // Cache at CDN for 30 minutes, serve stale for 10 more while revalidating
    res.setHeader('Cache-Control', 's-maxage=1800, stale-while-revalidate=600');
    return res.status(200).json({
      current: current ? {
        name: current.name,
        temperature: current.temperature,
        temperatureUnit: current.temperatureUnit,
        windSpeed: current.windSpeed,
        windDirection: current.windDirection,
        shortForecast: current.shortForecast,
        detailedForecast: current.detailedForecast,
      } : null,
      tonight: tonight ? {
        name: tonight.name,
        temperature: tonight.temperature,
        temperatureUnit: tonight.temperatureUnit,
        shortForecast: tonight.shortForecast,
        detailedForecast: tonight.detailedForecast,
      } : null,
      week,
      alerts,
      summary,
      source: 'nws',
    });
  } catch (err) {
    console.error('Weather API error:', err.message);
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=60');
    return res.status(200).json({
      current: null,
      tonight: null,
      week: [],
      alerts: [],
      summary: "I wasn't able to grab the latest weather right now, but you can check weather.gov for current conditions at Devils Lake. Stay safe out there!",
      source: 'error',
    });
  }
}
