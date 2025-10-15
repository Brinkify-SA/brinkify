import { View, Text } from "react-native";
import React from "react";
import { Button, Card, Input, Label, XStack, YStack } from "tamagui";

export default function SignupForm({ type }: { type: "customer" | "worker" }) {
  return (
    <Card backgroundColor="White" size="$4">
      <Card.Header padded>
        <Text className="text-2xl font-bold text-center">
          Signup as a {type}
        </Text>
        <View className="mt-8 flex flex-col gap-3">
          <View>
            <Text>Full Name</Text>
            <Input id="name" size="$5" placeholder="Full Name" />
          </View>
          <View>
            <Text>Email</Text>
            <Input id="email" size="$5" placeholder="username@domain.com" />
          </View>
          <View>
            <Text>Create Password</Text>
            <Input
              id="password"
              size="$5"
              placeholder="*******"
              secureTextEntry
            />
          </View>
          <View>
            <Text>Confirm Password</Text>
            <Input
              id="password"
              size="$5"
              placeholder="*******"
              secureTextEntry
            />
          </View>

          <Button size="$5" theme="accent">
            Create Account
          </Button>
        </View>
      </Card.Header>
    </Card>
  );
}
