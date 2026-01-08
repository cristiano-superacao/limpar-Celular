import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuth } from "../auth/AuthContext";
import { LoginScreen } from "../screens/LoginScreen";
import { RegisterScreen } from "../screens/RegisterScreen";
import { DashboardScreen } from "../screens/DashboardScreen";
import { RequestDetailScreen } from "../screens/RequestDetailScreen";
import { AdminCloudScreen } from "../screens/AdminCloudScreen";
import { colors } from "../ui/theme";

const Stack = createNativeStackNavigator();

export function AppNavigator() {
  const auth = useAuth();

  return (
    <NavigationContainer>
      {auth.token ? (
        <Stack.Navigator
          screenOptions={{
            headerStyle: { backgroundColor: colors.card },
            headerTintColor: colors.text,
            contentStyle: { backgroundColor: colors.bg },
          }}
        >
          <Stack.Screen name="Dashboard" component={DashboardScreen} options={{ title: "Limpa Celular" }} />
          <Stack.Screen name="RequestDetail" component={RequestDetailScreen} options={{ title: "Solicitação" }} />
          <Stack.Screen name="AdminCloud" component={AdminCloudScreen} options={{ title: "Nuvem (Admin)" }} />
        </Stack.Navigator>
      ) : (
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.bg },
          }}
        >
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}
