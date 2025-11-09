import { View, Text, TouchableOpacity } from "react-native";
import React from "react";

export default function Button({
  className,
  title,
  onPress,
  variant,
}: {
  className?: string;
  title: string;
  onPress?: () => void;
  variant?: "primary" | "secondary";
}) {
  return (
    <TouchableOpacity className={className} onPress={onPress}>
      <Text>{title}</Text>
    </TouchableOpacity>
  );
}
