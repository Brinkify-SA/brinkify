import { Suspense } from "react";
import OnboardingComponent from "./OnboardingComponent";

export default function OnboardingPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OnboardingComponent />
    </Suspense>
  );
}
