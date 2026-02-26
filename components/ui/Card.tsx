import { View, type ViewProps } from "react-native";

type CardProps = ViewProps;

export function Card({ className = "", children, ...props }: CardProps) {
  return (
    <View
      className={`rounded-xl border border-border bg-bg-card p-4 ${className}`}
      {...props}
    >
      {children}
    </View>
  );
}
