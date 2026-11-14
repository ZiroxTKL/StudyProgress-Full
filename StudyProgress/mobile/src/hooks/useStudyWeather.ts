import { useEffect, useRef, useState } from "react";
import * as Location from "expo-location";
import { friendlyError } from "@studyprogress/client";
import { getWeather, type Weather } from "../services/weather";
export function useStudyWeather() {
  const [weather, setWeather] = useState<Weather | null>(null),
    [loading, setLoading] = useState(false),
    [error, setError] = useState(""),
    [denied, setDenied] = useState(false),
    controller = useRef<AbortController | null>(null),
    active = useRef(true);
  useEffect(() => {
    active.current = true;
    return () => {
      active.current = false;
      controller.current?.abort();
    };
  }, []);
  async function load(coords?: { latitude: number; longitude: number }) {
    if (loading) return;
    setLoading(true);
    setError("");
    setDenied(false);
    controller.current?.abort();
    const c = new AbortController();
    controller.current = c;
    try {
      if (!coords) {
        const perm = await Location.requestForegroundPermissionsAsync();
        if (perm.status !== "granted") {
          setDenied(true);
          throw new Error(
            "Sin permiso de ubicación. Puedes ingresar coordenadas manualmente.",
          );
        }
        if (!(await Location.hasServicesEnabledAsync()))
          throw new Error(
            "Activa la ubicación del dispositivo o ingresa coordenadas manualmente.",
          );
        let timer: ReturnType<typeof setTimeout> | undefined;
        try {
          const location = await Promise.race([
            Location.getCurrentPositionAsync({
              accuracy: Location.Accuracy.Balanced,
            }),
            new Promise<never>((_, reject) => {
              timer = setTimeout(
                () =>
                  reject(
                    new Error(
                      "No encontramos tu ubicación a tiempo. Prueba cerca de una ventana o ingresa coordenadas.",
                    ),
                  ),
                12000,
              );
            }),
          ]);
          coords = location.coords;
        } finally {
          if (timer) clearTimeout(timer);
        }
      }
      const value = await getWeather(
        coords.latitude,
        coords.longitude,
        c.signal,
      );
      if (active.current) setWeather(value);
    } catch (e) {
      if (active.current && !c.signal.aborted) setError(friendlyError(e));
    } finally {
      if (active.current) setLoading(false);
    }
  }
  return { weather, loading, error, denied, load };
}
