import { useMemo, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";

import { createBugReport } from "@/src/api/feedback";
import { alertAxiosError } from "@/src/utils/apiErrors";
import { mainStyles } from "@/src/styles/mainStyles";
import { AppButton } from "@/src/components/AppButton";
import { useCopy } from "@/src/i18n/useCopy";

type PickedImage = {
  uri: string;
  fileName?: string | null;
  mimeType?: string | null;
};

function guessMimeTypeFromUri(uri: string): string {
  const lower = uri.toLowerCase();
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".webp")) return "image/webp";
  if (lower.endsWith(".heic") || lower.endsWith(".heif")) return "image/heic";
  return "image/jpeg";
}

export default function BugReport() {
  const copy = useCopy();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [screenshot, setScreenshot] = useState<PickedImage | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = useMemo(() => {
    return title.trim().length > 0 && description.trim().length > 0 && !submitting;
  }, [title, description, submitting]);

  const onPickScreenshot = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert(copy("bug_report_permission_title"), copy("bug_report_permission_msg"));
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.85,
    });

    if (result.canceled) return;

    const asset = result.assets?.[0];
    if (!asset?.uri) return;

    setScreenshot({
      uri: asset.uri,
      fileName: (asset as { fileName?: string | null }).fileName ?? null,
      mimeType: (asset as { mimeType?: string | null }).mimeType ?? null,
    });
  };

  const onSubmit = async () => {
    if (!title.trim() || !description.trim()) {
      Alert.alert(copy("bug_report_missing_title"), copy("bug_report_missing_msg"));
      return;
    }

    setSubmitting(true);
    try {
      const form = new FormData();
      form.append("title", title.trim());
      form.append("description", description.trim());

      if (screenshot?.uri) {
        const type = screenshot.mimeType ?? guessMimeTypeFromUri(screenshot.uri);
        const name = screenshot.fileName ?? `screenshot.${type.split("/")[1] ?? "jpg"}`;
        form.append("screenshot", {
          uri: screenshot.uri,
          name,
          type,
        } as unknown as Blob);
      }

      await createBugReport(form);
      Alert.alert(copy("bug_report_thanks_title"), copy("bug_report_thanks_msg"), [
        {
          text: copy("common_ok"),
          onPress: () => router.back(),
        },
      ]);
    } catch (err) {
      alertAxiosError(copy("bug_report_submit_error_title"), err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={mainStyles.container}>
      <ScrollView keyboardShouldPersistTaps="handled">
        <Text style={[mainStyles.title, { marginBottom: 12 }]}>{copy("bug_report_title")}</Text>

        <View style={mainStyles.labelInputContainer}>
          <Text style={mainStyles.label}>{copy("bug_report_label_title")}</Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder={copy("bug_report_placeholder_title")}
            placeholderTextColor="#94A3B8"
            style={mainStyles.input}
            autoCapitalize="sentences"
          />
        </View>
        <View style={mainStyles.labelInputContainer}>
          <Text style={mainStyles.label}>{copy("bug_report_label_description")}</Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder={copy("bug_report_placeholder_description")}
            placeholderTextColor="#94A3B8"
            style={[mainStyles.input, mainStyles.textarea]}
            multiline
            textAlignVertical="top"
          />
        </View>
        <View style={styles.screenshotRow}>
          <AppButton
            title={
              screenshot ? copy("bug_report_change_screenshot") : copy("bug_report_add_screenshot")
            }
            variant="secondary"
            onPress={onPickScreenshot}
          />
          {screenshot ? (
            <AppButton
              title={copy("bug_report_remove")}
              variant="link"
              onPress={() => setScreenshot(null)}
              textStyle={{ color: "#DC2626" }}
            />
          ) : null}
        </View>

        {screenshot ? (
          <Text style={styles.screenshotHint}>{copy("bug_report_screenshot_attached")}</Text>
        ) : (
          <Text style={styles.screenshotHint}>{copy("bug_report_no_screenshot")}</Text>
        )}

        <AppButton
          title={submitting ? copy("bug_report_submitting") : copy("bug_report_submit")}
          onPress={onSubmit}
          disabled={!canSubmit}
          style={{ marginTop: 16 }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screenshotRow: {
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  screenshotHint: {
    marginTop: 8,
    fontSize: 13,
    color: "#64748B",
  },
});
