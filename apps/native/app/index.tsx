import { View, Text, ScrollView } from "react-native";
import { Container } from "@/components/container";
import { Button, Card, H2, Paragraph, XStack } from "tamagui";
import React from "react";
import { Image } from "react-native";
import { useRouter } from "expo-router";

export default function Home() {
  const router = useRouter();

  return (
    <Container>
      <View className="flex-1 min-h-screen flex p-2 py-10">
        <Image
          source={require("../assets/images/icon.png")}
          className="w-72 h-32 mx-auto mb-6"
        />
        <Text className="text-xl font-bold text-foreground text-center mb-4">
          South Africa's trusted platform connecting skilled workers with
          customers
        </Text>

        <View className="flex flex-col gap-4 mb-24">
          <Card elevate bordered size="$4">
            <Card.Header padded>
              <Text className="text-2xl font-bold">Find Work</Text>
              <Text>Browse hundreds of job opportunities in your area</Text>
            </Card.Header>
          </Card>
          <Card elevate bordered background="$Background" size="$4">
            <Card.Header padded>
              <Text className="text-2xl font-bold">Hire Talent</Text>
              <Text>Connect with verified skilled professionals</Text>
            </Card.Header>
          </Card>
        </View>

        <View className="absolute bottom-0 flex flex-col gap-2 w-full px-[1%] pb-4">
          <Button
            onPress={() => router.push("/signup")}
            theme="accent"
            size="$5"
          >
            Create Account
          </Button>
          <Button
            variant="outlined"
            onPress={() => router.push("/login")}
            size="$5"
          >
            Login
          </Button>
        </View>
      </View>
    </Container>
  );
}
