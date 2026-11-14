import { useRef, useState } from "react";
import { Alert, Linking, Modal, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CameraView, useCameraPermissions } from "expo-camera";
import { parseCourseQr, friendlyError } from "@studyprogress/client";
import { api } from "../services/api";
import { useNavigation } from "../contexts/NavigationContext";
import { useStudyWeather } from "../hooks/useStudyWeather";
import { Screen, Button, styles, Loading } from "../components/ui";
export default function ToolsScreen() {
  const [permission, requestPermission] = useCameraPermissions(),
    [scanning, setScanning] = useState(false),
    [raw, setRaw] = useState(""),
    [candidate, setCandidate] = useState<ReturnType<
      typeof parseCourseQr
    > | null>(null),
    [importing, setImporting] = useState(false),
    lock = useRef(false),
    [latitude, setLatitude] = useState(""),
    [longitude, setLongitude] = useState(""),
    w = useStudyWeather(),
    n = useNavigation();
  function scan(value: string) {
    if (lock.current) return;
    lock.current = true;
    setScanning(false);
    try {
      setCandidate(parseCourseQr(value));
    } catch {
      Alert.alert(
        "QR no válido",
        "Escanea un QR de curso generado por StudyProgress. También puedes pegar el contenido manualmente.",
      );
      lock.current = false;
    }
  }
  async function startCamera() {
    try {
      const p = permission?.granted ? permission : await requestPermission();
      if (p.granted) {
        lock.current = false;
        setScanning(true);
      } else
        Alert.alert(
          "Cámara no disponible",
          "Puedes habilitar el permiso en ajustes o pegar el contenido del QR manualmente.",
          [
            { text: "Entendido" },
            { text: "Abrir ajustes", onPress: () => Linking.openSettings() },
          ],
        );
    } catch {
      Alert.alert(
        "Cámara no disponible",
        "Usa la opción de pegar el contenido del QR.",
      );
    }
  }
  async function importCourse() {
    if (!candidate || importing) return;
    setImporting(true);
    try {
      const c = await api.importCourse({
        nombre: candidate.nombre,
        descripcion: candidate.descripcion,
        temas: candidate.temas,
      });
      setCandidate(null);
      lock.current = false;
      setRaw("");
      Alert.alert(
        "Curso importado",
        "El curso y sus temas se guardaron en tu cuenta.",
      );
      n.go({ name: "course", id: c.id });
    } catch (e) {
      Alert.alert("No se pudo importar", friendlyError(e));
    } finally {
      setImporting(false);
    }
  }
  return (
    <Screen
      title="Herramientas"
      text="Tu móvil también puede ayudarte a estudiar."
    >
      <View style={styles.card}>
        <Text style={styles.h2}>Importar curso con QR</Text>
        <Text style={[styles.muted, { marginBottom: 18 }]}>
          Abre un curso en la web y toca «Compartir QR». La cámara copia el
          curso y sus temas a tu cuenta, sin compartir notas personales.
        </Text>
        <Button onPress={startCamera}>Abrir cámara</Button>
        <Text style={[styles.label, { marginTop: 22 }]}>
          ¿Sin cámara? Pega el contenido del QR
        </Text>
        <TextInput
          accessibilityLabel="Contenido QR"
          multiline
          style={[styles.input, { minHeight: 80 }]}
          value={raw}
          onChangeText={setRaw}
          autoCapitalize="none"
        />
        <Button
          secondary
          disabled={!raw.trim()}
          onPress={() => {
            lock.current = false;
            scan(raw);
          }}
        >
          Revisar contenido
        </Button>
        {candidate && (
          <View style={{ marginTop: 20 }}>
            <Text style={styles.h2}>{candidate.nombre}</Text>
            <Text style={styles.muted}>
              {candidate.temas.length} temas se copiarán a tu cuenta.
            </Text>
            <View style={{ height: 12 }} />
            <Button disabled={importing} onPress={importCourse}>
              {importing ? "Importando…" : "Confirmar importación"}
            </Button>
            <View style={{ height: 10 }} />
            <Button
              secondary
              disabled={importing}
              onPress={() => {
                setCandidate(null);
                lock.current = false;
              }}
            >
              Cancelar
            </Button>
          </View>
        )}
      </View>
      <View style={styles.card}>
        <Text style={styles.h2}>¿Biblioteca o patio?</Text>
        <Text style={[styles.muted, { marginBottom: 18 }]}>
          Consulta el clima de tu ubicación para planear dónde estudiar. Tu
          ubicación se usa solo en esta consulta y no se guarda en tu cuenta.
        </Text>
        <Button disabled={w.loading} onPress={() => w.load()}>
          Usar mi ubicación
        </Button>
        {w.loading && <Loading />}
        {w.error && (
          <Text style={[styles.error, { marginTop: 15 }]}>{w.error}</Text>
        )}
        {w.denied && (
          <Button secondary onPress={() => Linking.openSettings()}>
            Abrir ajustes de ubicación
          </Button>
        )}
        {w.weather && (
          <View style={{ marginTop: 20 }}>
            <Text style={[styles.h2, { fontSize: 30 }]}>
              {w.weather.temperature} °C
            </Text>
            <Text style={styles.muted}>
              Lluvia: {w.weather.precipitation} mm · Viento: {w.weather.wind}{" "}
              km/h
            </Text>
            <Text style={[styles.text, { marginTop: 12 }]}>
              {w.weather.outside
                ? "El clima permite considerar una sesión al aire libre. Busca un lugar seguro y con sombra."
                : "Una biblioteca o sala de estudio puede ser más cómoda ahora."}
            </Text>
          </View>
        )}
        <Text style={[styles.label, { marginTop: 23 }]}>
          Consulta manual sin GPS
        </Text>
        <TextInput
          accessibilityLabel="Latitud"
          style={styles.input}
          placeholder="Latitud, ej. -12.0464"
          value={latitude}
          onChangeText={setLatitude}
          keyboardType="numbers-and-punctuation"
        />
        <TextInput
          accessibilityLabel="Longitud"
          style={styles.input}
          placeholder="Longitud, ej. -77.0428"
          value={longitude}
          onChangeText={setLongitude}
          keyboardType="numbers-and-punctuation"
        />
        <Button
          secondary
          disabled={w.loading || !latitude.trim() || !longitude.trim()}
          onPress={() =>
            w.load({ latitude: Number(latitude), longitude: Number(longitude) })
          }
        >
          Consultar coordenadas
        </Button>
        <Text
          style={[styles.muted, { marginTop: 20 }]}
          onPress={() => Linking.openURL("https://open-meteo.com/")}
          accessibilityRole="link"
        >
          Clima por Open-Meteo (CC BY 4.0). La sugerencia es orientativa.
        </Text>
      </View>
      <Modal
        visible={scanning}
        animationType="slide"
        onRequestClose={() => setScanning(false)}
      >
        <SafeAreaView
          style={{ flex: 1, backgroundColor: "#142b21", padding: 20 }}
        >
          <Text style={[styles.h2, { color: "white" }]}>
            Enfoca el QR del curso
          </Text>
          <CameraView
            style={{ flex: 1, marginVertical: 20 }}
            facing="back"
            barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
            onBarcodeScanned={(event) => scan(event.data)}
            onMountError={() => {
              setScanning(false);
              Alert.alert(
                "No se pudo abrir la cámara",
                "Puedes pegar el contenido del QR manualmente.",
              );
            }}
          />
          <Button secondary onPress={() => setScanning(false)}>
            Cancelar
          </Button>
        </SafeAreaView>
      </Modal>
    </Screen>
  );
}
