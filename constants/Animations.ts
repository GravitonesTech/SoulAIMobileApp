import { FadeIn, SlideInDown } from "react-native-reanimated";

export const EntryAnimations = {
  // Common animation for form containers entering the screen
  formContainer: SlideInDown.duration(1200),

  // Common animation for headers entering the screen
  header: FadeIn.duration(1200),
};
