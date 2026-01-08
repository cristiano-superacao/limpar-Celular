import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, View } from "react-native";
import { AuthProvider, useAuth } from "./src/auth/AuthContext";
import { AppNavigator } from "./src/navigation/AppNavigator";
import { colors } from "./src/ui/theme";

function Root() {
  const auth = useAuth();
  if (auth.loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.bg }}>
        <ActivityIndicator />
      </View>
    );
  }

  return <AppNavigator />;
}

export default function App() {
  return (
    <AuthProvider>
      <Root />
      <StatusBar style="dark" />
    </AuthProvider>
  );
}
