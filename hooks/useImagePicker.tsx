import { useAppActionSheet } from "@/hooks/useAppActionSheet";
import { toast } from "@/utils/toast";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";

export const useImagePicker = () => {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const { showActionSheet } = useAppActionSheet();

  const handleTakePhoto = async (onSelected?: (data: { uri: string; base64?: string }) => void) => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      toast.error("Permission Denied", "Sorry, we need camera permissions to make this work!");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.4,
      base64: true,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      setImageUri(asset.uri);
      onSelected?.({ uri: asset.uri, base64: asset.base64 ?? undefined });
      return asset;
    }
  };

  const handleChooseFromLibrary = async (
    onSelected?: (data: { uri: string; base64?: string }) => void,
  ) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      toast.error("Permission Denied", "Sorry, we need camera roll permissions to make this work!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
      base64: true,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      setImageUri(asset.uri);
      onSelected?.({ uri: asset.uri, base64: asset.base64 ?? undefined });
      return asset;
    }
  };

  const pickImage = (onSelected?: (data: { uri: string; base64?: string }) => void) => {
    showActionSheet("Change Profile Photo", [
      {
        label: "Take Photo",
        icon: "camera",
        onPress: () => handleTakePhoto(onSelected),
      },
      {
        label: "Choose from Library",
        icon: "image",
        onPress: () => handleChooseFromLibrary(onSelected),
      },
    ]);
  };

  return {
    imageUri,
    setImageUri,
    handleTakePhoto,
    handleChooseFromLibrary,
    pickImage,
  };
};
