import { StyleSheet, Text, View } from "react-native";

import { AppButton } from "@/src/components/AppButton";
import { COPY } from "@/src/i18n/copy";
import { mainStyles } from "@/src/styles/mainStyles";

type ErrorStateViewProps = {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
};

export function ErrorStateView({
  title = COPY.common_something_wrong,
  message,
  onRetry,
  retryLabel = COPY.common_try_again,
}: ErrorStateViewProps) {
  return (
    <View style={styles.center}>
      <Text style={mainStyles.emptyTitle}>{title}</Text>
      <Text style={mainStyles.emptySubtitle}>{message}</Text>
      {onRetry ? (
        <AppButton title={retryLabel} onPress={onRetry} style={styles.retryButton} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  retryButton: {
    marginTop: 8,
    minWidth: 160,
  },
});
