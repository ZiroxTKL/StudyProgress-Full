import { Pressable, Text, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { AuthProvider, useAuth } from "./src/contexts/AuthContext";
import {
  NavigationProvider,
  useNavigation,
} from "./src/contexts/NavigationContext";
import { ErrorBoundary, Loading, styles, colors } from "./src/components/ui";
import AuthScreen from "./src/screens/AuthScreen";
import DashboardScreen from "./src/screens/DashboardScreen";
import CoursesScreen from "./src/screens/CoursesScreen";
import CourseScreen from "./src/screens/CourseScreen";
import TasksScreen from "./src/screens/TasksScreen";
import PersonalScreen from "./src/screens/PersonalScreen";
import ToolsScreen from "./src/screens/ToolsScreen";
import ProfileScreen from "./src/screens/ProfileScreen";
function Shell() {
  const n = useNavigation(),
    route = n.route;
  const screens = {
    dashboard: <DashboardScreen />,
    courses: <CoursesScreen />,
    course: <CourseScreen id={route.id || 0} />,
    tasks: <TasksScreen />,
    goals: <PersonalScreen key="goals" goals />,
    reminders: <PersonalScreen key="reminders" goals={false} />,
    tools: <ToolsScreen />,
    profile: <ProfileScreen />,
  };
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <View
        style={{
          paddingHorizontal: 22,
          paddingVertical: 14,
          borderBottomWidth: 1,
          borderColor: colors.line,
          flexDirection: "row",
          alignItems: "center",
          gap: 20,
        }}
      >
        {n.canBack && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Volver"
            onPress={n.back}
          >
            <Text style={styles.link}>← Volver</Text>
          </Pressable>
        )}
        <Text style={[styles.h2, { marginBottom: 0, fontSize: 18 }]}>
          studyprogress.
        </Text>
      </View>
      <View style={{ flex: 1 }} key={`${route.name}-${route.id || ""}`}>
        {screens[route.name]}
      </View>
      <View
        style={{
          flexDirection: "row",
          borderTopWidth: 1,
          borderColor: colors.line,
          backgroundColor: "white",
          paddingTop: 10,
          paddingBottom: 8,
        }}
      >
        {[
          ["dashboard", "⌂", "Inicio"],
          ["courses", "▤", "Cursos"],
          ["tasks", "✓", "Tareas"],
          ["tools", "✦", "Herramientas"],
          ["profile", "○", "Perfil"],
        ].map(([name, icon, label]) => (
          <Pressable
            key={name}
            accessibilityRole="tab"
            accessibilityState={{ selected: route.name === name }}
            onPress={() => n.tab({ name: name as typeof route.name })}
            style={{
              flex: 1,
              alignItems: "center",
              gap: 4,
              paddingVertical: 5,
            }}
          >
            <Text
              style={{
                fontSize: 20,
                color: route.name === name ? colors.green : "#9aa68e",
              }}
            >
              {icon}
            </Text>
            <Text
              style={{
                fontSize: 9,
                color: route.name === name ? colors.green : "#84927a",
                fontWeight: route.name === name ? "700" : "400",
              }}
            >
              {label}
            </Text>
          </Pressable>
        ))}
      </View>
    </SafeAreaView>
  );
}
function Session() {
  const a = useAuth();
  return a.loading ? (
    <SafeAreaView style={{ flex: 1, justifyContent: "center" }}>
      <Loading />
    </SafeAreaView>
  ) : a.user ? (
    <NavigationProvider>
      <Shell />
    </NavigationProvider>
  ) : (
    <AuthScreen />
  );
}
export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <ErrorBoundary>
        <AuthProvider>
          <Session />
        </AuthProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
