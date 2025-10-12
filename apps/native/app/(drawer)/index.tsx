import { View, Text, ScrollView } from "react-native";
import { Container } from "@/components/container";

export default function Home() {
  return (
    <Container>
      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        <Text className="font-mono text-foreground text-3xl font-bold mb-4">
          BRINKIFY
        </Text>
        <View className="bg-card border border-border rounded-xl p-6 mb-6 shadow-sm">
          <Text className="text-foreground text-base">
            This is a starter template for a React Native app using Expo and
            NativeWind. It includes a basic setup with a drawer navigation and a
            home screen.
          </Text>
        </View>
      </ScrollView>
    </Container>
  );
}
