import { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing, useWindowDimensions } from 'react-native';

interface ConfettiPieceProps {
  animatedValue: Animated.Value;
  color: string;
  size: number;
  index: number;
  screenWidth: number;
  screenHeight: number;
}

const ConfettiPiece = ({ 
  animatedValue, 
  color, 
  size, 
  index, 
  screenWidth, 
  screenHeight 
}: ConfettiPieceProps) => {
  const startPositionX = useRef(Math.random() * screenWidth).current;
  const rotationDirection = useRef(Math.random() > 0.5 ? 1 : -1).current;
  const rotationIntensity = useRef(Math.random() * 10 + 5).current;

  const translateY = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-50, screenHeight + 50],
  });

  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [startPositionX, startPositionX + (Math.random() * 200 - 100)],
  });

  const rotate = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', `${rotationDirection * rotationIntensity * 360}deg`],
  });

  const opacity = animatedValue.interpolate({
    inputRange: [0, 0.7, 1],
    outputRange: [1, 1, 0],
  });

  return (
    <Animated.View
      style={[
        styles.confettiPiece,
        {
          backgroundColor: color,
          width: size,
          height: size / 2,
          transform: [{ translateY }, { translateX }, { rotate }],
          opacity,
        },
      ]}
    />
  );
};

export default function Confetti() {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const { width, height } = useWindowDimensions();
  
  const colors = ['#A78BFA', '#93C5FD', '#FDBA74', '#F9A8D4', '#FCD34D', '#86EFAC'];
  const confettiCount = 100;
  
  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 5000,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start();
  }, []);

  const renderConfetti = () => {
    const pieces = [];
    for (let i = 0; i < confettiCount; i++) {
      const size = Math.random() * 15 + 5;
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      pieces.push(
        <ConfettiPiece
          key={i}
          index={i}
          animatedValue={animatedValue}
          color={color}
          size={size}
          screenWidth={width}
          screenHeight={height}
        />
      );
    }
    return pieces;
  };

  return <View style={styles.container} pointerEvents="none">{renderConfetti()}</View>;
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
  },
  confettiPiece: {
    position: 'absolute',
    top: -50,
  },
});