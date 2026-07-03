import { Redirect } from "expo-router";
import { useProtocolStore } from "@/stores/useProtocolStore";

export default function IndexRoute() {
  const onboardingComplete = useProtocolStore((s) => s.onboardingComplete);

  return (
    <Redirect href={onboardingComplete ? "/(tabs)/(hoje)" : "/onboarding"} />
  );
}
