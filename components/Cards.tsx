import { FontAwesome5 } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  PanResponder,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import Card from "./Card";

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

const Cards = ({ cards }: { cards: any[] }) => {
  if (!cards.length) return null;
  const [isAnimating, setIsAnimating] = useState(false);
  // Assign random background color to each card once
  const coloredCards = useRef(
    cards.map((card) => ({
      ...card,
      backgroundColor: COLORS[Math.floor(Math.random() * COLORS.length)],
    }))
  ).current;

  const currentIndexRef = useRef(0);
  const [currentIndex, _setCurrentIndex] = useState(0);
  const position = useRef(new Animated.ValueXY()).current;

  // Animation for dice rotation
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const setCurrentIndex = (valFn: number | ((prev: number) => number)) => {
    const newIndex =
      typeof valFn === "function" ? valFn(currentIndexRef.current) : valFn;
    currentIndexRef.current = newIndex;
    _setCurrentIndex(newIndex);
  };

  // PanResponder for swipe left/right cards
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

  // Dice press handler
  const handleDicePress = () => {
    if (isAnimating) return; // block rapid clicks
    rotateAnim.setValue(0);

    // Haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Spin dice 360deg
    Animated.timing(rotateAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start(() => {
      // Pick new random index different from current
      let newIndex = currentIndexRef.current;
      while (newIndex === currentIndexRef.current) {
        newIndex = Math.floor(Math.random() * cards.length);
      }
      setCurrentIndex(newIndex);
      rotateAnim.setValue(0);
      setIsAnimating(false);
    });
  };

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

  // Interpolate rotation to degrees
  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <>
      <View style={styles.container}>
        {nextCard && (
          <View style={nextCardStyle}>
            <Card card={nextCard} backgroundColor={nextCard.backgroundColor} />
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
          <Card
            card={currentCard}
            backgroundColor={currentCard.backgroundColor}
          />
        </Animated.View>
      </View>

      <View
        style={{
          alignItems: "center",
          justifyContent: "center",
          marginVertical: 20,
        }}
      >
        <TouchableOpacity onPress={handleDicePress} activeOpacity={0.7}>
          <Animated.View
            style={{
              backgroundColor: "black",
              borderRadius: 50,
              padding: 16,
              transform: [{ rotate }],
            }}
          >
            <FontAwesome5 name="dice" size={34} color="white" />
          </Animated.View>
        </TouchableOpacity>
      </View>
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
