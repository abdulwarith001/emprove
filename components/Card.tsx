import FavEvents from "@/utils/favEvents";
import { AntDesign, MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Speech from "expo-speech";
import React, { useEffect, useRef, useState } from "react";
import { Animated, Text, TouchableOpacity, View } from "react-native";
const Card = ({
  card,
  backgroundColor,
}: {
  card: any;
  backgroundColor: string;
}) => {
  if (!card) return null;
  const [isFav, setIsFav] = useState(false);

  useEffect(() => {
    const checkFav = async () => {
      const favs = await AsyncStorage.getItem("favorites");
      const parsed = favs ? JSON.parse(favs) : [];
      const exists = parsed.find((item: any) => item.word === card.word);
      setIsFav(!!exists);
    };
    checkFav();
  }, [card]);

  useEffect(() => {
    const checkFav = async () => {
      const favs = await AsyncStorage.getItem("favorites");
      const parsed = favs ? JSON.parse(favs) : [];
      const exists = parsed.find((item: any) => item.word === card.word);
      setIsFav(!!exists);
    };
    checkFav();

    const sub = () => checkFav();
    FavEvents.on("update", sub);
    return () => {
      FavEvents.removeListener("update", sub);
    };
  }, [card]);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.3,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [scaleAnim]);

  const handleSpeak = () => {
    Speech.stop();
    if (!card.word || !card.definition) return;

    // const examplesText =
    //   card.examples && card.examples.length
    //     ? "Examples: " +
    //       card.examples.map((ex: string) => ex + ".").join(" ... ") // three dots for longer pause
    //     : "";

    // const speech = `${card.word}. Definition: ${card.definition}. ${examplesText}`;
    const speech = card.word;

    Speech.speak(speech, {
      language: "en-US",
      pitch: 1,
      rate: 1,
    });
  };
  const addToFav = async () => {
    try {
      const favs = await AsyncStorage.getItem("favorites");
      const parsed = favs ? JSON.parse(favs) : [];

      const exists = parsed.find((item: any) => item.word === card.word);
      if (exists) {
        return;
      }

      const updated = [...parsed, card];
      await AsyncStorage.setItem("favorites", JSON.stringify(updated));
      //   await AsyncStorage.removeItem("favorites");
    } catch (e) {
      console.error("Failed to add to favorites:", e);
    } finally {
      FavEvents.emit("update");
    }
  };

  const removeFromFav = async () => {
    const favs = await AsyncStorage.getItem("favorites");
    const parsed = favs ? JSON.parse(favs) : [];
    const updated = parsed.filter((item: any) => item.word !== card.word);
    await AsyncStorage.setItem("favorites", JSON.stringify(updated));
    FavEvents.emit("update");
  };
  const toggleFav = async () => {
    if (isFav) {
      await removeFromFav();
    } else {
      await addToFav();
    }
    setIsFav(!isFav); // 🔄 Refresh icon
  };

  return (
    <View
      style={{
        backgroundColor,
        borderRadius: 20,
        padding: 24,
        borderWidth: 1,
        borderColor: "#ccc",
      }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Text
          style={{
            fontSize: 28,
            fontWeight: "600",
            textTransform: "capitalize",
            color: "#000",
          }}
        >
          {card.word}
        </Text>
        <TouchableOpacity onPress={handleSpeak}>
          <AntDesign name="sound" size={24} color="black" />
        </TouchableOpacity>
      </View>

      <View
        style={{
          flexDirection: "row",
          gap: 12,
          marginVertical: 10,
        }}
      >
        <Text style={{ fontStyle: "italic", color: "#666" }}>
          {card.pronunciation}
        </Text>
        <Text style={{ fontStyle: "italic", color: "#666" }}>
          {card.partOfSpeech}
        </Text>
      </View>

      <Text
        style={{
          backgroundColor: "#000",
          color: "#ccc",
          padding: 16,
          borderRadius: 10,
          fontSize: 18,
          marginVertical: 20,
          alignSelf: "flex-start",
        }}
      >
        {card.definition}
      </Text>

      <Text
        style={{
          fontWeight: "500",
          fontSize: 18,
          marginBottom: 8,
          color: "#000",
        }}
      >
        Usages:
      </Text>

      {card.examples &&
        card.examples.map((ex: string, i: number) => (
          <Text key={i} style={{ color: "#444", marginBottom: 6 }}>
            • {ex}
          </Text>
        ))}

      <Animated.View
        style={{
          alignSelf: "center",
          marginTop: 24,
          transform: [{ scale: scaleAnim }],
        }}
      >
        <TouchableOpacity
          onPress={toggleFav}
          style={{
            backgroundColor: "#d33",
            padding: 14,
            borderRadius: 50,
          }}
        >
          <MaterialIcons
            name={isFav ? "close" : "favorite"}
            size={30}
            color="white"
          />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

export default Card;
