import Cards from "@/components/FavCards";
import FavEvents from "@/utils/favEvents";
import AntDesign from "@expo/vector-icons/AntDesign";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import LottieView from "lottie-react-native";
import { useEffect, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Favorites() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const getFavs = async () => {
      try {
        const favs = await AsyncStorage.getItem("favorites");
        if (!favs) return;
        const parsed = JSON.parse(favs);
        setData(parsed.reverse());
      } catch (e) {
        console.error("Failed to load favorites:", e);
      }
    };
    getFavs();

    FavEvents.on("update", getFavs);
    return () => {
      FavEvents.removeListener("update", getFavs);
    };
  }, []);

  const removeFromFav = async (wordToRemove: string) => {
    try {
      const favs = await AsyncStorage.getItem("favorites");
      const parsed = favs ? JSON.parse(favs) : [];
      const updated = parsed.filter((item: any) => item.word !== wordToRemove);
      await AsyncStorage.setItem("favorites", JSON.stringify(updated));
      setData(updated.reverse());
      FavEvents.emit("update");
    } catch (e) {
      console.error("Failed to remove favorite:", e);
    }
  };

  const clearData = async () => {
    await AsyncStorage.removeItem("favorites");
    setData([]);
    FavEvents.emit("update");
  };

  return (
    <SafeAreaView className="px-4 flex-1">
      <TouchableOpacity
        onPress={() => router.back()}
        className="items-center flex-row gap-4"
      >
        <AntDesign name="arrowleft" size={24} color="black" />
        <Text className="text-black font-semibold text-2xl font-sorasemibold">
          Favorites
        </Text>
      </TouchableOpacity>

      {data.length === 0 ? (
        <View className="flex-1 h-full items-center justify-start gap-6">
          <View
            className="flex flex-col items-center mt-8"
            style={{ marginTop: 100 }}
          >
            <LottieView
              source={require("../assets/lotties/sad-face.json")}
              autoPlay
              loop
              style={{ width: 200, height: 200 }}
            />
          </View>
          <Text className="font-soramedium text-[#666666]">
            No words has been added to favorites yet...
          </Text>
          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.7}
            className="bg-black p-5 rounded-full w-full items-center justify-center"
          >
            <Text className="text-white font-soramedium">Go back</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <View className="flex-1">
            <Cards cards={data} onRemove={removeFromFav} />
          </View>
        </>
      )}
      {data.length !== 0 && (
        <TouchableOpacity onPress={clearData} activeOpacity={0.7}>
          <View
            style={{
              backgroundColor: "black",
              borderRadius: 50,
              padding: 18,
            }}
            className="items-center"
          >
            <Text className="text-white font-soramedium">Clear all</Text>
          </View>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}
