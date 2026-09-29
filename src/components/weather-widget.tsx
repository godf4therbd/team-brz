"use client";

import { useEffect, useRef, useState } from "react";

// Dhaka coordinates — Team Brz is a Dhaka-based club. Open-Meteo is free,
// open-source, and needs no API key/signup: https://open-meteo.com
const LAT = 23.8103;
const LON = 90.4125;
const CITY = "Dhaka";
const REFRESH_MS = 15 * 60 * 1000; // weather doesn't need to be fresher than this

// WMO weather codes (used by Open-Meteo) collapsed into a short label + emoji.
function describeWeatherCode(code: number): { label: string; icon: string } {
  if (code === 0) return { label: "Clear", icon: "☀️" };
  if (code === 1) return { label: "Mostly clear", icon: "🌤️" };
  if (code === 2) return { label: "Partly cloudy", icon: "⛅" };
  if (code === 3) return { label: "Overcast", icon: "☁️" };
  if (code === 45 || code === 48) return { label: "Fog", icon: "🌫️" };
  if ([51, 53, 55, 56, 57].includes(code))
    return { label: "Drizzle", icon: "🌦️" };
  if ([61, 63, 65, 66, 67].includes(code))
    return { label: "Rain", icon: "🌧️" };
  if ([71, 73, 75, 77].includes(code)) return { label: "Snow", icon: "❄️" };
  if ([80, 81, 82].includes(code)) return { label: "Showers", icon: "🌧️" };
  if ([95, 96, 99].includes(code))
    return { label: "Thunderstorm", icon: "⛈️" };
  return { label: "Weather", icon: "🌡️" };
}

type WeatherState =
  | { status: "loading" }
  | { status: "error" }
  | {
      status: "ok";
      tempC: number;
      minC: number | null;
      maxC: number | null;
      label: string;
      icon: string;
    };

export default function WeatherWidget() {
  const [state, setState] = useState<WeatherState>({ status: "loading" });
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&current=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min&timezone=auto`,
          { signal: AbortSignal.timeout(5000) }
        );
        if (!res.ok) throw new Error(`Open-Meteo returned ${res.status}`);
        const data = await res.json();
        const current = data?.current;
        if (!current || typeof current.temperature_2m !== "number") {
          throw new Error("Unexpected Open-Meteo response shape");
        }
        if (!cancelled) {
          const { label, icon } = describeWeatherCode(current.weather_code);
          const max = data?.daily?.temperature_2m_max?.[0];
          const min = data?.daily?.temperature_2m_min?.[0];
          setState({
            status: "ok",
            tempC: Math.round(current.temperature_2m),
            maxC: typeof max === "number" ? Math.round(max) : null,
            minC: typeof min === "number" ? Math.round(min) : null,
            label,
            icon,
          });
        }
      } catch {
        if (!cancelled) setState({ status: "error" });
      }
    }

    load();
    const interval = setInterval(load, REFRESH_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  // Close the popover on an outside click.
  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  // Fails quietly — a broken weather call should never be visible chrome
  // on every page of the site.
  if (state.status !== "ok") return null;

  return (
    <div className="relative hidden lg:block" ref={rootRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 text-sm text-brz-mute transition hover:text-brz-white"
        title={`${state.label}, ${CITY}`}
        aria-expanded={open}
      >
        <span aria-hidden>{state.icon}</span>
        {state.tempC}°C
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-3 weather-card-container">
          <div className="weather-card">
            <p className="weather-card-city">{CITY.toUpperCase()}</p>
            <p className="weather-card-condition">
              {state.label.toUpperCase()}
            </p>
            <div className="weather-card-icon" aria-hidden>
              {state.icon}
            </div>
            <p className="weather-card-temp">{state.tempC}°</p>
            <div className="weather-card-minmax">
              <div className="weather-card-min">
                <p className="weather-card-minmax-heading">Min</p>
                <p className="weather-card-minmax-temp">
                  {state.minC !== null ? `${state.minC}°` : "—"}
                </p>
              </div>
              <div className="weather-card-max">
                <p className="weather-card-minmax-heading">Max</p>
                <p className="weather-card-minmax-temp">
                  {state.maxC !== null ? `${state.maxC}°` : "—"}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
