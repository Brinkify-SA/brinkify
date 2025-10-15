import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { Container } from "@/components/container";
import Button from "@/components/button";

export default function Home() {
  return (
    <Container>
      <ScrollView showsVerticalScrollIndicator={false} className="flex-1 p-3">
        <Text className="font-mono text-foreground text-3xl font-bold mb-4">
          Welcome to Brinkify
        </Text>
        <Text>
          South Africa's trusted platform for connecting skilled workers with
          customers
        </Text>
        <View className="bg-card border border-border rounded-xl p-6 mb-6 shadow-sm">
          <Text className="text-foreground text-base">
            This is a starter template for a React Native app using Expo and
            NativeWind. It includes a basic setup with a drawer navigation and a
            home screen.
          </Text>
        </View>

        <View>
          <Button title="Create Account" />
          <TouchableOpacity title="Login" onPress={() => {}} />
        </View>
      </ScrollView>
    </Container>
  );
}
