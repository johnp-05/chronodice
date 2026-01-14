import { Stack } from "expo-router";

/**
 * Layout principal de la aplicación
 * 
 * Configura la navegación con Expo Router.
 * En este caso, solo tenemos una pantalla.
 */
export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false, // Ocultamos el header para usar nuestro diseño completo
      }}
    >
      <Stack.Screen name="index" />
    </Stack>
  );
}