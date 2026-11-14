import axios from "axios";
export interface Weather {
  temperature: number;
  precipitation: number;
  wind: number;
  outside: boolean;
}
export async function getWeather(
  latitude: number,
  longitude: number,
  signal: AbortSignal,
): Promise<Weather> {
  if (
    !Number.isFinite(latitude) ||
    Math.abs(latitude) > 90 ||
    !Number.isFinite(longitude) ||
    Math.abs(longitude) > 180
  )
    throw new Error("Ingresa coordenadas válidas");
  const { data } = await axios.get("https://api.open-meteo.com/v1/forecast", {
    params: {
      latitude,
      longitude,
      current: "temperature_2m,precipitation,wind_speed_10m",
    },
    timeout: 12000,
    signal,
  });
  const c = data.current;
  if (
    !c ||
    ![c.temperature_2m, c.precipitation, c.wind_speed_10m].every(
      Number.isFinite,
    )
  )
    throw new Error("El clima no está disponible ahora");
  return {
    temperature: c.temperature_2m,
    precipitation: c.precipitation,
    wind: c.wind_speed_10m,
    outside:
      c.precipitation === 0 &&
      c.wind_speed_10m < 25 &&
      c.temperature_2m >= 16 &&
      c.temperature_2m <= 28,
  };
}
