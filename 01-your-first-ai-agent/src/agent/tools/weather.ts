import { tool } from "langchain";
import { z } from "zod";

export const getWeatherTool = tool(
  async ({ location }: { location: string }) => {
    const geoRes = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
        location,
      )}&count=1`,
    );
    const geo = await geoRes.json();
    const place = geo?.results?.[0];

    if (!place) {
      return {
        error: `Could not find a location matching "${location}".`,
      };
    }

    const weatherRes = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code&timezone=auto`,
    );
    const weather = await weatherRes.json();
    const current = weather?.current;

    return {
      location: `${place.name}${place.admin1 ? ", " + place.admin1 : ""}, ${place.country}`,
      temperatureC: current?.temperature_2m,
      feelsLikeC: current?.apparent_temperature,
      humidityPercent: current?.relative_humidity_2m,
      windSpeedKmh: current?.wind_speed_10m,
      weatherCode: current?.weather_code,
      observedAt: current?.time,
    };
  },
  {
    name: "get_weather",
    description:
      "Get the current weather for a named location (city, region, or landmark). Use this whenever the user asks about weather, temperature, or whether to bring an umbrella/jacket somewhere.",
    schema: z.object({
      location: z
        .string()
        .describe(
          'The place to get weather for, e.g. "Visakhapatnam" or "Tokyo, Japan"',
        ),
    }),
  },
);
