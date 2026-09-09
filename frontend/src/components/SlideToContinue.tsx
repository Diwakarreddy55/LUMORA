import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  PanResponder,
  LayoutChangeEvent,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type SlideToContinueProps = {
  onComplete: () => void;
  text?: string;
};

export default function SlideToContinue({
  onComplete,
  text = 'Slide to continue',
}: SlideToContinueProps) {
  const translateX = useRef(new Animated.Value(0)).current;

  const [trackWidth, setTrackWidth] = useState(0);

  const KNOB_SIZE = 52;
  const TRACK_PADDING = 5;

  const maxTranslate = Math.max(
    trackWidth - KNOB_SIZE - TRACK_PADDING * 2,
    0
  );

  // Get slider width
  const handleLayout = (event: LayoutChangeEvent) => {
    setTrackWidth(event.nativeEvent.layout.width);
  };

  // Move slider back to beginning
  const resetSlider = () => {
    Animated.spring(translateX, {
      toValue: 0,
      useNativeDriver: true,
      friction: 7,
      tension: 80,
    }).start();
  };

  // Successfully completed
  const completeSlider = () => {
    Animated.spring(translateX, {
      toValue: maxTranslate,
      useNativeDriver: true,
      friction: 7,
      tension: 80,
    }).start(() => {
      onComplete();

      // Reset slider after navigation starts
      setTimeout(() => {
        translateX.setValue(0);
      }, 300);
    });
  };

  const panResponder = useRef(
    PanResponder.create({
      // Start dragging
      onStartShouldSetPanResponder: () => true,

      // Allow movement
      onMoveShouldSetPanResponder: () => true,

      // While dragging
      onPanResponderMove: (_, gestureState) => {
        const position = Math.max(
          0,
          Math.min(gestureState.dx, maxTranslate)
        );

        translateX.setValue(position);
      },

      // Finger released
      onPanResponderRelease: (_, gestureState) => {
        const threshold = maxTranslate * 0.75;

        if (gestureState.dx >= threshold) {
          completeSlider();
        } else {
          resetSlider();
        }
      },

      // Gesture interrupted
      onPanResponderTerminate: () => {
        resetSlider();
      },
    })
  ).current;

  return (
    <View
      style={styles.track}
      onLayout={handleLayout}
    >
      {/* Center text */}
      <View
        style={styles.textContainer}
        pointerEvents="none"
      >
        <Text style={styles.text}>
          {text}
        </Text>

        <View style={styles.arrows}>
          <Ionicons
            name="chevron-forward"
            size={16}
            color="#A1A1AA"
          />

          <Ionicons
            name="chevron-forward"
            size={16}
            color="#D4D4D8"
            style={styles.arrowSecond}
          />

          <Ionicons
            name="chevron-forward"
            size={16}
            color="#E4E4E7"
            style={styles.arrowThird}
          />
        </View>
      </View>

      {/* Draggable pink circle */}
      <Animated.View
        {...panResponder.panHandlers}
        style={[
          styles.knob,
          {
            transform: [
              {
                translateX,
              },
            ],
          },
        ]}
      >
        <Ionicons
          name="arrow-forward"
          size={21}
          color="#FFFFFF"
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: '100%',
    height: 62,
    borderRadius: 31,
    backgroundColor: '#FFE6ED',
    borderWidth: 1,
    borderColor: '#FFD4E0',
    padding: 5,
    justifyContent: 'center',
    overflow: 'hidden',
  },

  textContainer: {
    position: 'absolute',
    left: 0,
    right: 0,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    gap: 5,
  },

  text: {
    color: '#71717A',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.2,
  },

  arrows: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  arrowSecond: {
    marginLeft: -8,
  },

  arrowThird: {
    marginLeft: -8,
  },

  knob: {
    width: 52,
    height: 52,
    borderRadius: 26,

    backgroundColor: '#FF3D71',

    alignItems: 'center',
    justifyContent: 'center',

    elevation: 5,

    shadowColor: '#FF3D71',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 4,
    },
  },
});
