import { Dimensions, PixelRatio, Platform } from "react-native";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// Base design size (iPhone 14 / 15 — 375 × 812 points)
const guidelineBaseWidth = 375;
const guidelineBaseHeight = 812;

const widthScale = SCREEN_WIDTH / guidelineBaseWidth;
const heightScale = SCREEN_HEIGHT / guidelineBaseHeight;

/**
 * Normalizes font and element sizes based on screen width.
 * Use for: font sizes, icon sizes, spacing, border radius, small UI elements.
 * @param size Standard size in points (designed at 375pt width)
 * @returns Scaled size
 */
export const normalize = (size: number): number => {
  const newSize = size * widthScale;
  if (Platform.OS === "ios") {
    return Math.round(PixelRatio.roundToNearestPixel(newSize));
  } else {
    return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 2;
  }
};

/**
 * Width percentage — converts a percentage of screen width to points.
 * Use for: responsive container widths, horizontal spacing.
 * Example: width: wp(90) → 90% of screen width
 */
export const wp = (percentage: number): number => {
  return PixelRatio.roundToNearestPixel((SCREEN_WIDTH * percentage) / 100);
};

/**
 * Height percentage — converts a percentage of screen height to points.
 * Use for: responsive vertical positioning, top/bottom padding.
 * Example: paddingTop: hp(10) → 10% of screen height
 */
export const hp = (percentage: number): number => {
  return PixelRatio.roundToNearestPixel((SCREEN_HEIGHT * percentage) / 100);
};

/**
 * Moderate scaling — less aggressive than normalize().
 * Useful for elements that should scale but not as dramatically on large screens.
 * @param size Base size
 * @param factor Interpolation factor (0 = no scaling, 1 = full scaling). Default 0.5
 */
export const moderateScale = (size: number, factor = 0.5): number => {
  return Math.round(size + (normalize(size) - size) * factor);
};

/** Device is narrower than the design baseline (e.g. iPhone SE) */
export const isSmallDevice = SCREEN_WIDTH < 375;

/** Device is a tablet (iPad, large Android) */
export const isTablet = SCREEN_WIDTH >= 768;

export { SCREEN_HEIGHT, SCREEN_WIDTH };
