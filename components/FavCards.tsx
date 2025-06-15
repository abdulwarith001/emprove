import FavEvents from "@/utils/favEvents";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
    Animated,
    Dimensions,
    PanResponder,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import Card from "./FavCard";

const SCREEN_WIDTH = Dimensions.get("window").width;
const SCREEN_HEIGHT = Dimensions.get("window").height;

const COLORS = [
  "#FFE0E9",
  "#E0F7FA",
  "#FFF9C4",
  "#E0F2F1",
  "#F1F8E9",
  "#F3E5F5",
  "#FFF3E0",
  "#E8F5E9",
  "#FCE4EC",
];

const Cards = ({
  cards,
  onRemove,
}: {
  cards: any[];
  onRemove: (text: string) => void;
}) => {
  // Recalculate coloredCards whenever cards change
  const coloredCards = useMemo(() => {
    return cards.map((card) => ({
      ...card,
      backgroundColor: COLORS[Math.floor(Math.random() * COLORS.length)],
    }));
  }, [cards]);

  const currentIndexRef = useRef(0);
  const [currentIndex, _setCurrentIndex] = useState(0);

  // Clamp currentIndex if cards length changes
  useEffect(() => {
    if (currentIndexRef.current >= coloredCards.length) {
      currentIndexRef.current = coloredCards.length - 1;
      _setCurrentIndex(currentIndexRef.current);
    }
    if (coloredCards.length === 0) {
      currentIndexRef.current = 0;
      _setCurrentIndex(0);
    }
  }, [coloredCards]);

  const position = useRef(new Animated.ValueXY()).current;

  const setCurrentIndex = (valFn: number | ((prev: number) => number)) => {
    const newIndex =
      typeof valFn === "function" ? valFn(currentIndexRef.current) : valFn;
    currentIndexRef.current = newIndex;
    _setCurrentIndex(newIndex);
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) => {
        return Math.abs(gesture.dx) > 10;
      },
      onPanResponderMove: (_, gesture) => {
        position.setValue({ x: gesture.dx, y: 0 });
      },
      onPanResponderRelease: (_, gesture) => {
        const index = currentIndexRef.current;
        const SWIPE_THRESHOLD = 0.25 * SCREEN_WIDTH;

        if (gesture.dx > SWIPE_THRESHOLD) {
          if (index > 0) {
            Animated.timing(position, {
              toValue: { x: SCREEN_WIDTH, y: 0 },
              duration: 200,
              useNativeDriver: true,
            }).start(() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              setCurrentIndex(index - 1);
              position.setValue({ x: 0, y: 0 });
            });
          } else {
            Animated.spring(position, {
              toValue: { x: 0, y: 0 },
              useNativeDriver: true,
            }).start();
          }
        } else if (gesture.dx < -SWIPE_THRESHOLD) {
          if (index < coloredCards.length - 1) {
            Animated.timing(position, {
              toValue: { x: -SCREEN_WIDTH, y: 0 },
              duration: 200,
              useNativeDriver: true,
            }).start(() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              setCurrentIndex(index + 1);
              position.setValue({ x: 0, y: 0 });
            });
          } else {
            Animated.spring(position, {
              toValue: { x: 0, y: 0 },
              useNativeDriver: true,
            }).start();
          }
        } else {
          Animated.spring(position, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const currentCard = coloredCards[currentIndex];
  const nextCard = coloredCards[currentIndex + 1];

  const nextCardStyle = {
    position: "absolute" as const,
    top: SCREEN_HEIGHT / 2 - 380,
    left: 30,
    width: SCREEN_WIDTH - 40,
    opacity: 0.5,
    transform: [{ scale: 0.95 }],
    zIndex: 1,
  };

  const clearData = async () => {
    await AsyncStorage.clear();
    FavEvents.emit("update");
  };

  return (
    <>
      <View style={styles.container}>
        {nextCard && (
          <View style={nextCardStyle}>
            <Card
              card={nextCard}
              backgroundColor={nextCard.backgroundColor}
              onRemove={onRemove}
            />
          </View>
        )}

        <Animated.View
          {...panResponder.panHandlers}
          style={[
            styles.card,
            {
              transform: position.getTranslateTransform(),
              zIndex: 10,
            },
          ]}
        >
          {currentCard && (
            <Card
              card={currentCard}
              backgroundColor={currentCard.backgroundColor}
              onRemove={onRemove}
            />
          )}
        </Animated.View>
      </View>
      {/* <TouchableOpacity onPress={clearData} activeOpacity={0.7}>
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
      </TouchableOpacity> */}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    position: "absolute",
    width: SCREEN_WIDTH - 40,
    top: SCREEN_HEIGHT / 2 - 300,
    zIndex: 2,
  },
});

export default Cards;
