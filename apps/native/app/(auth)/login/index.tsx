import { View, Text, ImageBackground } from "react-native";
import React from "react";
import { Container } from "@/components/container";
import { Button, Card, Input } from "tamagui";

export default function Login() {
  return (
    <Container>
      <View className="p-3">
        <ImageBackground
          source={require("../../../assets/images/icon.png")}
          className="w-72 h-32 mx-auto mb-4"
        />
        <Text className="text-3xl font-bold text-center my-4">
          Welcome Back
        </Text>
        <Text className="text-xl text-foreground text-center mb-4">
          Login to continue
        </Text>
        <Card backgroundColor="White" size="$4">
          <Card.Header padded>
            <View className="mt-8 flex flex-col gap-3">
              <View>
                <Text>Email</Text>
                <Input id="email" size="$5" placeholder="username@domain.com" />
              </View>

              <View>
                <Text>Password</Text>
                <Input
                  id="password"
                  size="$5"
                  placeholder="*******"
                  secureTextEntry
                />
              </View>

              <Button size="$5" theme="accent">
                Login
              </Button>
            </View>
          </Card.Header>
        </Card>
      </View>
    </Container>
  );
}
