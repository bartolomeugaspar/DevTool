import React, { useEffect, useRef } from 'react';
import { Animated, Text, StyleSheet, View } from 'react-native';
import Svg, { Path, Polyline, Circle } from 'react-native-svg';

type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  visible: boolean;
  message: string;
  type?: ToastType;
  duration?: number;
  onHide: () => void;
}

const CONFIG: Record<ToastType, { accent: string; icon: React.ReactNode }> = {
  success: {
    accent: '#22c55e',
    icon: (
      <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
        <Polyline points="20 6 9 17 4 12" />
      </Svg>
    ),
  },
  error: {
    accent: '#ef4444',
    icon: (
      <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
        <Path d="M18 6 6 18M6 6l12 12" />
      </Svg>
    ),
  },
  info: {
    accent: '#60a5fa',
    icon: (
      <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
        <Circle cx="12" cy="12" r="10" />
        <Path d="M12 16v-4M12 8h.01" />
      </Svg>
    ),
  },
};

export default function Toast({ visible, message, type = 'success', duration = 2600, onHide }: ToastProps) {
  const opacity    = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-16)).current;

  useEffect(() => {
    if (!visible) return;

    Animated.parallel([
      Animated.timing(opacity,    { toValue: 1, duration: 220, useNativeDriver: true }),
      Animated.spring(translateY, { toValue: 0, speed: 20, bounciness: 4, useNativeDriver: true }),
    ]).start();

    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity,    { toValue: 0, duration: 260, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: -16, duration: 260, useNativeDriver: true }),
      ]).start(() => onHide());
    }, duration);

    return () => clearTimeout(timer);
  }, [visible]);

  if (!visible) return null;

  const { accent, icon } = CONFIG[type];

  return (
    <Animated.View style={[styles.wrapper, { opacity, transform: [{ translateY }] }]}>
      <View style={styles.card}>
        {/* left accent bar */}
        <View style={[styles.bar, { backgroundColor: accent }]} />

        {/* icon */}
        <View style={[styles.iconWrap, { backgroundColor: `${accent}18` }]}>
          {icon}
        </View>

        {/* message */}
        <Text style={styles.message} numberOfLines={2}>{message}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    top: 56,
    left: 16,
    right: 16,
    zIndex: 9999,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111c2a',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1e2d3f',
    overflow: 'hidden',
    gap: 12,
    paddingRight: 16,
    paddingVertical: 13,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 12,
  },
  bar: {
    width: 4,
    alignSelf: 'stretch',
    borderRadius: 2,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  message: {
    flex: 1,
    color: '#e2e8f0',
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 19,
    letterSpacing: 0.1,
  },
});
