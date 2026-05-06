import React, { useCallback, useState } from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Pressable,
  Animated,
  Dimensions,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { Typography } from "@/constants/Typography";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  clearActionSheet,
  setActionSheet,
  ActionSheetOption,
} from "@/store/slices/actionSheetSlice";

let actionSheetCallbacks: (() => void)[] = [];

export const AppActionSheet = () => {
  const dispatch = useAppDispatch();
  const { visible, title, options } = useAppSelector((state) => state.actionSheet);
  const [animation] = useState(new Animated.Value(0));
  const [shouldRender, setShouldRender] = useState(visible);

  React.useEffect(() => {
    if (visible) {
      setShouldRender(true);
      Animated.timing(animation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(animation, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start(() => {
        setShouldRender(false);
      });
    }
  }, [visible, animation]);

  const hideActionSheet = useCallback(() => {
    dispatch(clearActionSheet());
  }, [dispatch]);

  const translateY = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [300, 0],
  });

  const opacity = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  if (!shouldRender) return null;

  return (
    <Modal transparent visible={visible} animationType="none">
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={hideActionSheet}>
          <Animated.View style={[styles.backdropBackground, { opacity }]} />
        </Pressable>
        <Animated.View style={[styles.sheet, { transform: [{ translateY }] }]}>
          <View style={styles.indicator} />
          {title ? <Text style={styles.title}>{title}</Text> : null}
          <View style={styles.optionsContainer}>
            {options.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={styles.option}
                onPress={() => {
                  hideActionSheet();
                  // Small delay to ensure modal is closing or closed before trigger
                  setTimeout(() => {
                    actionSheetCallbacks[index]?.();
                  }, 300);
                }}
              >
                <View style={styles.optionContent}>
                  <Feather
                    name={option.icon as any}
                    size={20}
                    color={option.variant === "danger" ? "#FF3B30" : "#111111"}
                  />
                  <Text
                    style={[styles.optionText, option.variant === "danger" && { color: "#FF3B30" }]}
                  >
                    {option.label}
                  </Text>
                </View>
                <Feather name="chevron-right" size={18} color="#C7C7CC" />
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity style={styles.cancelButton} onPress={hideActionSheet}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

interface ActionSheetOptionWithCallback extends Omit<ActionSheetOption, "onPress"> {
  onPress: () => void;
}

export const useAppActionSheet = () => {
  const dispatch = useAppDispatch();

  const showActionSheet = useCallback(
    (title: string, options: ActionSheetOptionWithCallback[]) => {
      const serializableOptions = options.map(({ onPress, ...rest }) => rest);
      actionSheetCallbacks = options.map((o) => o.onPress);
      dispatch(setActionSheet({ title, options: serializableOptions }));
    },
    [dispatch],
  );

  const hideActionSheet = useCallback(() => {
    dispatch(clearActionSheet());
  }, [dispatch]);

  return { showActionSheet, hideActionSheet };
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  backdropBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  sheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingBottom: 40,
    paddingTop: 12,
    paddingHorizontal: 20,
    maxHeight: Dimensions.get("window").height * 0.7,
  },
  indicator: {
    width: 40,
    height: 5,
    backgroundColor: "#E5E5EA",
    borderRadius: 3,
    alignSelf: "center",
    marginBottom: 20,
  },
  title: {
    fontFamily: Typography.fonts.medium,
    fontSize: 18,
    color: "#111111",
    textAlign: "center",
    marginBottom: 20,
  },
  optionsContainer: {
    backgroundColor: "#F9F9F9",
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 16,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F2F2F2",
  },
  optionContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  optionText: {
    fontFamily: Typography.fonts.medium,
    fontSize: 16,
    color: "#111111",
  },
  cancelButton: {
    height: 56,
    borderRadius: 20,
    backgroundColor: "#F9F9F9",
    justifyContent: "center",
    alignItems: "center",
  },
  cancelText: {
    fontFamily: Typography.fonts.medium,
    fontSize: 16,
    color: "#3C61DD",
  },
});
