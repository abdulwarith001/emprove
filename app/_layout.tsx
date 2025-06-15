import { useFonts } from "expo-font";
import { SplashScreen, Stack } from "expo-router";
import { useEffect } from "react";
import { StatusBar } from "react-native";
import "../global.css";

SplashScreen.preventAutoHideAsync();
export default function RootLayout() {
  const [fontsLoaded, error] = useFonts({
    SoraSemiBold: require("../assets/fonts/Sora-SemiBold.ttf"),
    SoraBold: require("../assets/fonts/Sora-Bold.ttf"),
    SoraExtraLight: require("../assets/fonts/Sora-ExtraLight.ttf"),
    SoraLight: require("../assets/fonts/Sora-Light.ttf"),
    SoraMedium: require("../assets/fonts/Sora-Medium.ttf"),
    SoraRegular: require("../assets/fonts/Sora-Regular.ttf"),
  });

  useEffect(() => {
    if (error) throw error;

    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, error]);

  if (!fontsLoaded) {
    return null;
  }

  if (!fontsLoaded && !error) {
    return null;
  }

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
}
