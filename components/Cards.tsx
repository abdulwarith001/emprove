import { FontAwesome5 } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  PanResponder,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import Card from "./Card";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const CARD_TOP = SCREEN_HEIGHT / 2 - 340;
const CARD_WIDTH = SCREEN_WIDTH - 40;
const DICE_SPIN_DURATION = 600;
const SWIPE_THRESHOLD = 100;

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

const getRandomColor = () => COLORS[Math.floor(Math.random() * COLORS.length)];

const Cards = ({ cards }: { cards: any[] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const position = useRef(new Animated.ValueXY()).current;
  const nextCardScale = useRef(new Animated.Value(0.92)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  // Memoize colored cards
  const coloredCards = useMemo(
    () =>
      cards.map((card) => ({
        ...card,
        backgroundColor: getRandomColor(),
      })),
    [cards]
  );

  // Fast swipe animation
  const swipeCard = useCallback(
    (direction: "left" | "right") => {
      const canGoBack = direction === "right" && currentIndex > 0;
      const canGoForward =
        direction === "left" && currentIndex < coloredCards.length - 1;

      if (!canGoBack && !canGoForward) {
        // Snap back fast
        Animated.spring(position, {
          toValue: { x: 0, y: 0 },
          tension: 100,
          friction: 12,
          useNativeDriver: true,
        }).start();
        return;
      }

      setIsAnimating(true);
      const exitX =
        direction === "left" ? -SCREEN_WIDTH * 1.2 : SCREEN_WIDTH * 1.2;

      // Fast exit animation
      Animated.parallel([
        Animated.timing(position, {
          toValue: { x: exitX, y: 0 },
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(nextCardScale, {
          toValue: 1,
          tension: 100,
          friction: 10,
          useNativeDriver: true,
        }),
      ]).start(() => {
        position.setValue({ x: 0, y: 0 });
        nextCardScale.setValue(0.92);
        setCurrentIndex(canGoForward ? currentIndex + 1 : currentIndex - 1);
        setIsAnimating(false);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      });
    },
    [currentIndex, coloredCards.length, position, nextCardScale]
  );

  // Pan responder
  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => !isAnimating,
        onMoveShouldSetPanResponder: (_, { dx, dy }) => {
          return (
            !isAnimating && Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 5
          );
        },
        onPanResponderMove: (_, { dx, dy }) => {
          position.setValue({ x: dx, y: dy * 0.1 });

          // Scale next card as user swipes
          const progress = Math.min(Math.abs(dx) / SCREEN_WIDTH, 1);
          const scale = 0.92 + 0.08 * progress;
          nextCardScale.setValue(scale);
        },
        onPanResponderRelease: (_, { dx, vx }) => {
          const velocitySwipe = Math.abs(vx) > 0.5;
          const distanceSwipe = Math.abs(dx) > SWIPE_THRESHOLD;

          if (velocitySwipe || distanceSwipe) {
            swipeCard(dx > 0 ? "right" : "left");
          } else {
            // Snap back
            Animated.parallel([
              Animated.spring(position, {
                toValue: { x: 0, y: 0 },
                tension: 100,
                friction: 12,
                useNativeDriver: true,
              }),
              Animated.spring(nextCardScale, {
                toValue: 0.92,
                tension: 100,
                friction: 12,
                useNativeDriver: true,
              }),
            ]).start();
          }
        },
      }),
    [isAnimating, position, nextCardScale, swipeCard]
  );

  // Dice press handler
  const handleDicePress = useCallback(() => {
    if (isAnimating) return;

    setIsAnimating(true);
    rotateAnim.setValue(0);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    Animated.timing(rotateAnim, {
      toValue: 1,
      duration: DICE_SPIN_DURATION,
      useNativeDriver: true,
    }).start(() => {
      const availableIndices = Array.from(
        { length: coloredCards.length },
        (_, i) => i
      ).filter((i) => i !== currentIndex);

      const randomIndex =
        availableIndices[Math.floor(Math.random() * availableIndices.length)];

      position.setValue({ x: 0, y: 0 });
      nextCardScale.setValue(0.92);
      setCurrentIndex(randomIndex);
      rotateAnim.setValue(0);
      setIsAnimating(false);
    });
  }, [
    isAnimating,
    currentIndex,
    coloredCards.length,
    rotateAnim,
    position,
    nextCardScale,
  ]);

  if (!coloredCards.length) return null;

  const currentCard = coloredCards[currentIndex];
  const nextCard = coloredCards[currentIndex + 1];

  const rotate = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
    outputRange: ["-12deg", "0deg", "12deg"],
    extrapolate: "clamp",
  });

  const diceRotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <>
      <View style={styles.container}>
        {/* Next card - always visible underneath */}
        {nextCard && (
          <Animated.View
            style={[
              styles.nextCard,
              {
                transform: [{ scale: nextCardScale }],
              },
            ]}
          >
            <Card card={nextCard} backgroundColor={nextCard.backgroundColor} />
          </Animated.View>
        )}

        {/* Current card - interactive */}
        <Animated.View
          {...panResponder.panHandlers}
          style={[
            styles.currentCard,
            {
              transform: [...position.getTranslateTransform(), { rotate }],
            },
          ]}
        >
          <Card
            card={currentCard}
            backgroundColor={currentCard.backgroundColor}
          />
        </Animated.View>
      </View>

      <View style={styles.diceContainer}>
        <TouchableOpacity
          onPress={handleDicePress}
          activeOpacity={0.7}
          disabled={isAnimating}
        >
          <Animated.View
            style={[styles.diceButton, { transform: [{ rotate: diceRotate }] }]}
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
  currentCard: {
    position: "absolute",
    width: CARD_WIDTH,
    top: CARD_TOP,
    left: 20,
    zIndex: 10,
  },
  nextCard: {
    position: "absolute",
    top: CARD_TOP - 30,
    width: CARD_WIDTH,
    zIndex: 1,
  },
  diceContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 20,
  },
  diceButton: {
    backgroundColor: "black",
    borderRadius: 50,
    padding: 16,
  },
});

export default Cards;
