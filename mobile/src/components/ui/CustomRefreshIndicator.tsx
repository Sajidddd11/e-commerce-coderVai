import React, { useState, useEffect } from 'react';
import { View, StyleSheet, useWindowDimensions, Text, Platform } from 'react-native';
import Animated, {
  useAnimatedStyle,
  interpolate,
  Extrapolation,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
  useAnimatedReaction,
  SharedValue,
  runOnJS,
  useAnimatedProps,
  interpolateColor,
} from 'react-native-reanimated';
import Svg, { Path, G, Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { colors } from '@design/theme';
import { fontFamily, fontSize } from '@design/typography';

interface Props {
  scrollY: SharedValue<number>;
  isRefreshing: boolean;
  pullDistance?: number;
  initialOffset?: number;
  isDragging?: SharedValue<boolean>;
}

const AnimatedView = Animated.createAnimatedComponent(View);
const AnimatedPath = Animated.createAnimatedComponent(Path);

export function CustomRefreshIndicator({ 
  scrollY, 
  isRefreshing, 
  pullDistance = 100, 
  initialOffset = 0,
  isDragging
}: Props) {
  const { width } = useWindowDimensions();
  const spinnerRotation = useSharedValue(0);
  const refreshProgress = useSharedValue(0);
  const animationProgress = useSharedValue(0);
  const [label, setLabel] = useState('Pull down to refresh');

  // Default to a mock shared value of false if isDragging is not provided
  const defaultDragging = useSharedValue(false);
  const activeDragging = isDragging || defaultDragging;

  // Arrow color wave animation loop
  useEffect(() => {
    animationProgress.value = withRepeat(
      withTiming(1, { duration: 600, easing: Easing.linear }),
      -1, // infinite
      true // reverse
    );
  }, []);

  // React to refresh state and user dragging gestures
  useAnimatedReaction(
    () => {
      const pullOffset = Math.max(0, -scrollY.value);
      return {
        refreshing: isRefreshing,
        dragging: activeDragging.value,
        thresholdCrossed: pullOffset >= pullDistance,
      };
    },
    (next, prev) => {
      // Trigger label changes on the JS thread when threshold crosses
      if (prev && next.thresholdCrossed !== prev.thresholdCrossed) {
        runOnJS(setLabel)(next.thresholdCrossed ? 'Release to refresh' : 'Pull down to refresh');
      }

      // The spinner should start ONLY when refreshing is active AND the user has released their touch (not dragging)
      if (next.refreshing && !next.dragging) {
        refreshProgress.value = withTiming(1, { duration: 300 });
        spinnerRotation.value = withRepeat(
          withTiming(360, { duration: 500, easing: Easing.linear }),
          -1, // infinite
          false
        );
      } else {
        refreshProgress.value = withTiming(0, { duration: 300 });
        spinnerRotation.value = 0; // setting directly cancels any running animation
      }
    },
    [isRefreshing, pullDistance]
  );

  const containerStyle = useAnimatedStyle(() => {
    const pullOffset = Math.max(0, -scrollY.value);
    
    // On iOS, native pull-to-refresh holds the scroll offset around -60 to -80.
    // On Android, it stays at 0. So we use the actual pullOffset if it's active, 
    // but fallback to a minimum height of 60 during refresh so it is visible on Android
    // and doesn't get clipped by the header on iOS.
    const finalHeight = isRefreshing ? Math.max(pullOffset, 60) : pullOffset;
    
    const offsetValue = Math.abs(initialOffset);
    const topPosition = Platform.OS === 'android'
      ? offsetValue
      : offsetValue - finalHeight;

    return {
      height: finalHeight,
      top: topPosition,
      opacity: finalHeight > 0 || (Platform.OS === 'android' && isRefreshing) ? 1 : 0,
    };
  });

  const contentContainerStyle = useAnimatedStyle(() => {
    const pullOffset = Math.max(0, -scrollY.value);
    // Move down 1:1 with the pull up to 60px, then hold.
    const translateY = interpolate(pullOffset, [0, 60], [0, 60], Extrapolation.CLAMP);
    return {
      transform: [{ translateY }],
    };
  });

  const logoStyle = useAnimatedStyle(() => {
    const pullOffset = Math.max(0, -scrollY.value);
    // Scale up from 0.3 to 1 as we pull
    const scale = interpolate(pullOffset, [0, pullDistance], [0.3, 1], Extrapolation.CLAMP);
    // Fade in as we pull, and fade out when refreshing starts
    const pullOpacity = interpolate(pullOffset, [0, pullDistance / 2], [0, 1], Extrapolation.CLAMP);
    const opacity = pullOpacity * (1 - refreshProgress.value);
    
    return {
      transform: [{ scale }],
      opacity,
    };
  });

  const textStyle = useAnimatedStyle(() => {
    const pullOffset = Math.max(0, -scrollY.value);
    // Fade in text as we pull past 40px and fade out when refreshing begins
    const pullOpacity = interpolate(pullOffset, [40, 80], [0, 1], Extrapolation.CLAMP);
    const opacity = pullOpacity * (1 - refreshProgress.value);
    
    // Parallax slide down relative to the logo
    const translateY = interpolate(pullOffset, [40, 80], [-15, 0], Extrapolation.CLAMP);
    
    return {
      opacity,
      transform: [{ translateY }],
    };
  });

  const topChevronProps = useAnimatedProps(() => {
    const stroke = interpolateColor(
      animationProgress.value,
      [0, 1],
      ['#D1D5DB', '#1F2937'] // Gray (grey[30]) to Black (grey[80])
    );
    return { stroke };
  });

  const bottomChevronProps = useAnimatedProps(() => {
    const stroke = interpolateColor(
      animationProgress.value,
      [0, 1],
      ['#1F2937', '#D1D5DB'] // Black (grey[80]) to Gray (grey[30])
    );
    return { stroke };
  });

  const roundLogoStyle = useAnimatedStyle(() => {
    const scale = interpolate(refreshProgress.value, [0, 1], [0.5, 1]);
    const opacity = refreshProgress.value;
    return {
      opacity,
      transform: [{ scale }],
      position: 'absolute',
      top: 8,
      left: '50%',
      marginLeft: -20,
    };
  });

  const spinnerStyle = useAnimatedStyle(() => {
    return {
      opacity: refreshProgress.value,
      transform: [
        { rotate: `${spinnerRotation.value}deg` }
      ],
      position: 'absolute',
      top: 8,
      left: '50%',
      marginLeft: -20,
    };
  });

  return (
    <AnimatedView style={[styles.container, { width }, containerStyle]}>
      <AnimatedView style={[styles.iconContainer, contentContainerStyle]}>
        
        {/* Main Logo & Text Guidance Content (shows on pull) */}
        <AnimatedView style={[styles.pullContent, logoStyle]}>
          <Svg viewBox="0 0 512 488.51" width={40} height={40}>
            <G>
              <Path fill="#000000" d="M361.14,.1h2.39c29.71,0,59.41,.17,89.12-.1,9.8-.09,18.55,2.49,26.62,7.7,13.22,8.54,23.61,19.6,29.84,34.24,2,4.69,2.9,9.6,2.89,14.72-.07,50.57-.06,101.14-.11,151.71-.07,76.1-.16,152.21-.29,228.31,0,5.13-2.02,9.85-3.91,14.5-7.02,17.28-20.11,27.68-37.73,32.82-12.92,3.77-26.2,4.8-39.55,4.42-13.37-.38-26.73-1.33-40.1-2-8.52-.43-17.04-.8-25.56-1.17-1.17-.05-2.34,0-3.62,0V.1Z"/>
              <Path fill="#000000" d="M332.83,117.47c-.74,123.57-1.48,246.71-2.22,370.07h-2.39c-91.11,0-182.22,0-273.32-.01-6.05,0-11.59-2.15-16.96-4.65-10.73-4.98-19.95-11.94-27.06-21.49-4.12-5.53-7.17-11.6-7.56-18.58-.18-3.24,.5-6.53,.9-9.78,.07-.59,.6-1.23,1.08-1.66,31.51-28.41,61.23-58.69,91.93-87.94,29.53-28.13,59.59-55.71,89.3-83.65,25.9-24.36,51.89-48.63,77.36-73.44,13.73-13.37,26.26-27.96,39.7-41.64,8.72-8.87,18.1-17.09,27.19-25.6,.53-.49,1.13-.9,2.06-1.63Z"/>
              <Path fill="#000000" d="M334,94.94c-5.13,.27-10.08,.64-15.04,.77-12.26,.32-24.53,.51-36.79,.78-15.02,.33-29.96,1.33-44.6,5.03-19.72,4.97-36.79,14.87-52.12,28-19.65,16.82-38.29,34.72-56.41,53.15-39.5,40.16-81.08,78.08-123.54,115.06-1.69,1.47-3.37,2.95-5.44,4.77v-2.43c0-63.33,0-126.66,0-189.99C.06,91.21,.17,72.35,0,53.48c-.06-6.59,1.56-12.59,5-18.07C14.89,19.69,28.37,8.2,45.91,1.85c3.26-1.18,6.93-1.68,10.42-1.68,90.91-.09,181.82-.07,272.73-.07h2.67c.76,31.61,1.51,63.12,2.27,94.85Z"/>
            </G>
          </Svg>
          
          <AnimatedView style={[styles.textContainer, textStyle]}>
            <View style={styles.arrowWrapper}>
              <Svg viewBox="0 0 24 32" width={20} height={26}>
                <AnimatedPath 
                  d="M4 8 L12 16 L20 8" 
                  strokeWidth="3" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  fill="none" 
                  animatedProps={topChevronProps} 
                />
                <AnimatedPath 
                  d="M4 16 L12 24 L20 16" 
                  strokeWidth="3" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  fill="none" 
                  animatedProps={bottomChevronProps} 
                />
              </Svg>
            </View>
            <Text style={styles.labelText}>{label}</Text>
          </AnimatedView>
        </AnimatedView>

        {/* Round Logo (shows on refresh) */}
        <AnimatedView style={roundLogoStyle}>
          <Svg viewBox="0 0 478.7 478.7" width={40} height={40}>
            <Circle cx="239.35" cy="239.35" r="239.35" fill="#000" />
            <Path fill="#fff" d="M287.7,121.67h1.1c13.66,0,27.32,.08,40.98-.05,4.51-.04,8.53,1.2,12.24,3.71,6.08,4.12,10.86,9.45,13.72,16.5,.92,2.26,1.33,4.63,1.33,7.1-.03,24.37-.03,48.75-.05,73.12-.03,36.68-.07,73.36-.13,110.04,0,2.47-.93,4.75-1.8,6.99-3.23,8.33-9.25,13.34-17.35,15.82-5.94,1.82-12.05,2.31-18.19,2.13-6.15-.18-12.29-.64-18.44-.96-3.92-.21-7.84-.39-11.75-.56-.54-.02-1.08,0-1.66,0V121.67h0Z"/>
            <Path fill="#fff" d="M274.68,178.24c-.34,59.56-.68,118.91-1.02,178.37h-1.1c-41.9,0-83.8,0-125.69,0-2.78,0-5.33-1.04-7.8-2.24-4.93-2.4-9.17-5.76-12.44-10.36-1.89-2.67-3.3-5.59-3.48-8.96-.08-1.56,.23-3.15,.41-4.71,.03-.28,.28-.59,.5-.8,14.49-13.69,28.16-28.29,42.28-42.39,13.58-13.56,27.4-26.85,41.07-40.32,11.91-11.74,23.86-23.44,35.58-35.4,6.31-6.44,12.08-13.48,18.26-20.07,4.01-4.28,8.32-8.24,12.5-12.34,.24-.24,.52-.43,.95-.79h0Z"/>
            <Path fill="#fff" d="M275.22,167.39c-2.36,.13-4.64,.31-6.92,.37-5.64,.15-11.28,.25-16.92,.38-6.91,.15-13.78,.64-20.51,2.42-9.07,2.4-16.92,7.17-23.97,13.5-9.04,8.11-17.61,16.73-25.94,25.62-18.16,19.36-37.29,37.63-56.81,55.46-.78,.71-1.55,1.42-2.5,2.3v-92.75c0-9.1,.05-18.19-.03-27.28-.03-3.18,.72-6.07,2.3-8.71,4.55-7.58,10.75-13.12,18.81-16.18,1.5-.57,3.19-.81,4.79-.81,41.81-.04,83.61-.03,125.42-.03h1.23c.35,15.24,.69,30.42,1.04,45.72h0Z"/>
          </Svg>
        </AnimatedView>

        {/* The rotating spinner stroke inside the black area */}
        <AnimatedView style={spinnerStyle}>
          <Svg viewBox="0 0 478.7 478.7" width={40} height={40}>
            <Defs>
              <LinearGradient
                id="refreshSpinnerGrad"
                x1="239.35"
                y1="10"
                x2="25.35"
                y2="239.35"
                gradientUnits="userSpaceOnUse"
              >
                <Stop offset="0%" stopColor="#fff" stopOpacity={1} />
                <Stop offset="100%" stopColor="#fff" stopOpacity={0.1} />
              </LinearGradient>
            </Defs>
            <Path
              d="M 239.35,10.35 A 224.5,224.5 0 1,1 19.35,239.35 A 3,3 0 0,1 25.35,239.35 A 209.5,209.5 0 1,0 239.35,34.35 A 12,12 0 0,1 239.35,10.35 Z"
              fill="url(#refreshSpinnerGrad)"
            />
          </Svg>
        </AnimatedView>

      </AnimatedView>
    </AnimatedView>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    alignItems: 'center',
    justifyContent: 'flex-start', // Align to top to prevent clipping logo
    backgroundColor: 'transparent',
    overflow: 'visible',
    zIndex: 5,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: '100%',
    height: '100%',
  },
  pullContent: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: '100%',
    paddingTop: 8,
  },
  textContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  arrowWrapper: {
    marginRight: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  labelText: {
    fontSize: fontSize.xs,
    color: colors.grey[50],
    fontFamily: fontFamily.interRegular,
    textAlign: 'left',
  }
});
