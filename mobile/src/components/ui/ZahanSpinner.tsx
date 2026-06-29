import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import Svg, { Path, Circle } from 'react-native-svg';

interface ZahanSpinnerProps {
  size?: number;
}

export function ZahanSpinner({ size = 48 }: ZahanSpinnerProps) {
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 1000, easing: Easing.linear }),
      -1,
      false
    );
  }, []);

  const spinnerStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotation.value}deg` }],
      position: 'absolute',
    };
  });

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Background Black Circle with Zahan white icon inside */}
      <View style={{ width: size, height: size, position: 'absolute' }}>
        <Svg viewBox="0 0 478.7 478.7" width={size} height={size}>
          <Circle cx="239.35" cy="239.35" r="239.35" fill="#000" />
          <Path fill="#fff" d="M287.7,121.67h1.1c13.66,0,27.32,.08,40.98-.05,4.51-.04,8.53,1.2,12.24,3.71,6.08,4.12,10.86,9.45,13.72,16.5,.92,2.26,1.33,4.63,1.33,7.1-.03,24.37-.03,48.75-.05,73.12-.03,36.68-.07,73.36-.13,110.04,0,2.47-.93,4.75-1.8,6.99-3.23,8.33-9.25,13.34-17.35,15.82-5.94,1.82-12.05,2.31-18.19,2.13-6.15-.18-12.29-.64-18.44-.96-3.92-.21-7.84-.39-11.75-.56-.54-.02-1.08,0-1.66,0V121.67h0Z"/>
          <Path fill="#fff" d="M274.68,178.24c-.34,59.56-.68,118.91-1.02,178.37h-1.1c-41.9,0-83.8,0-125.69,0-2.78,0-5.33-1.04-7.8-2.24-4.93-2.4-9.17-5.76-12.44-10.36-1.89-2.67-3.3-5.59-3.48-8.96-.08-1.56,.23-3.15,.41-4.71,.03-.28,.28-.59,.5-.8,14.49-13.69,28.16-28.29,42.28-42.39,13.58-13.56,27.4-26.85,41.07-40.32,11.91-11.74,23.86-23.44,35.58-35.4,6.31-6.44,12.08-13.48,18.26-20.07,4.01-4.28,8.32-8.24,12.5-12.34,.24-.24,.52-.43,.95-.79h0Z"/>
          <Path fill="#fff" d="M275.22,167.39c-2.36,.13-4.64,.31-6.92,.37-5.64,.15-11.28,.25-16.92,.38-6.91,.15-13.78,.64-20.51,2.42-9.07,2.4-16.92,7.17-23.97,13.5-9.04,8.11-17.61,16.73-25.94,25.62-18.16,19.36-37.29,37.63-56.81,55.46-.78,.71-1.55,1.42-2.5,2.3v-92.75c0-9.1,.05-18.19-.03-27.28-.03-3.18,.72-6.07,2.3-8.71,4.55-7.58,10.75-13.12,18.81-16.18,1.5-.57,3.19-.81,4.79-.81,41.81-.04,83.61-.03,125.42-.03h1.23c.35,15.24,.69,30.42,1.04,45.72h0Z"/>
        </Svg>
      </View>

      {/* Rotating White Dash border around the black circle */}
      <Animated.View style={spinnerStyle}>
        <Svg viewBox="0 0 478.7 478.7" width={size} height={size}>
          <Circle 
            cx="239.35" cy="239.35" r="215" 
            stroke="#fff" 
            strokeWidth="24" 
            fill="transparent" 
            strokeDasharray="200 1000" 
            strokeLinecap="round" 
          />
        </Svg>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
