import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import { useAppActionSheet } from "@/hooks/useAppActionSheet";
import { toast } from "@/utils/toast";

export const useImagePicker = () => {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const { showActionSheet } = useAppActionSheet();

  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      toast.error("Permission Denied", "Sorry, we need camera permissions to make this work!");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setImageUri(uri);
      toast.success("Success", "Profile photo updated successfully!");
      return uri;
    }
  };

  const handleChooseFromLibrary = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      toast.error("Permission Denied", "Sorry, we need camera roll permissions to make this work!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setImageUri(uri);
      toast.success("Success", "Profile photo updated successfully!");
      return uri;
    }
  };

  const pickImage = () => {
    showActionSheet("Change Profile Photo", [
      {
        label: "Take Photo",
        icon: "camera",
        onPress: handleTakePhoto,
      },
      {
        label: "Choose from Library",
        icon: "image",
        onPress: handleChooseFromLibrary,
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
