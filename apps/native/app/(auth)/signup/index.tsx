import { View, Text, Image } from "react-native";
import React, { useState } from "react";
import { Container } from "@/components/container";
import { Button, Card } from "tamagui";
import { useRouter } from "expo-router";
import SignupForm from "../components/SignupForm";

export default function Login() {
  const [userType, setUserType] = useState<"customer" | "worker" | "">("");
  const handleSelect = (type: "customer" | "worker") => {
    setUserType(type);
  };
  return (
    <Container>
      <View className="p-3">
        <Image
          source={require("../../../assets/images/icon.png")}
          className="w-72 h-32 mx-auto mb-4"
        />

        {!userType && (
          <>
            <Text className="text-3xl font-bold text-center my-4">
              Join Brinkify
            </Text>
            <Text className="text-xl font-bold text-foreground text-center mb-4">
              How do you want to use Brinkify?
            </Text>
            <View className="flex flex-col gap-4">
              <Card onPress={() => handleSelect("customer")} bordered size="$4">
                <Card.Header padded>
                  <Text className="text-2xl font-bold text-center">
                    I'm a Customer
                  </Text>
                  <Text className="text-center">
                    Post jobs and hire skilled professionals
                  </Text>
                </Card.Header>
              </Card>
              <Card onPress={() => handleSelect("worker")} bordered size="$4">
                <Card.Header padded>
                  <Text className="text-2xl font-bold text-center">
                    I'm a Worker
                  </Text>
                  <Text className="text-center">
                    Find job opportunities an offer your services
                  </Text>
                </Card.Header>
              </Card>
            </View>
          </>
        )}
        {userType ? (
          <>
            <Text className="text-center mt-4"></Text>
            <SignupForm type={userType} />
          </>
        ) : null}
      </View>
    </Container>
  );
}
