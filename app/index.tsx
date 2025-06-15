import Cards from "@/components/Cards";
import FavEvents from "@/utils/favEvents";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import words from "../db/words.json";
export default function Index() {
  const [hasfavs, setHasFavs] = useState(false);

  useEffect(() => {
    const getFavs = async () => {
      const favs = await AsyncStorage.getItem("favorites");
      if (!favs || favs.length === 0) {
        setHasFavs(false);
        return;
      }
      const parsed = JSON.parse(favs);
      setHasFavs(parsed.length !== 0);
    };
    getFavs();

    FavEvents.on("update", getFavs);
    return () => {
      FavEvents.removeListener("update", getFavs);
    };
  }, []);
  return (
    <SafeAreaView className="px-4 flex-1">
      <View className="items-center flex-row justify-between">
        <Text className="text-black font-semibold text-4xl font-sorasemibold">
          Emprove
        </Text>
        <TouchableOpacity
          onPress={() => router.push("/favorites")}
          className="relative"
        >
          <MaterialIcons name="favorite-outline" size={30} color="black" />
          {hasfavs && (
            <View className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full" />
          )}
        </TouchableOpacity>
      </View>

      <View className="flex-1">
        <Cards cards={words} />
      </View>
    </SafeAreaView>
  );
}
