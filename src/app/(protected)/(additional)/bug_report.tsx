import { useMemo, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import { router } from "expo-router";

import { mainStyles } from "@/src/styles/mainStyles";
import { api } from "@/src/config/api";
import { AppButton } from "@/src/components/AppButton";

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
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [screenshot, setScreenshot] = useState<PickedImage | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = useMemo(() => {
    return title.trim().length > 0 && description.trim().length > 0 && !submitting;
  }, [title, description, submitting]);

  const alertAxiosError = (dialogTitle: string, err: unknown) => {
    if (!axios.isAxiosError(err)) {
      Alert.alert(dialogTitle, err instanceof Error ? err.message : "Unknown error");
      return;
    }

    const status = err.response?.status;
    const data = err.response?.data;

    if (typeof data === "string") {
      const looksLikeHtml = /<html|<!doctype html/i.test(data);
      if (looksLikeHtml) {
        console.log(`[${dialogTitle}] status:`, status);
        console.log(`[${dialogTitle}] html (first 800 chars):`, data.slice(0, 800));
        Alert.alert(
          dialogTitle,
          `Backend zwrócił HTML (${status ?? "?"}). Sprawdź traceback w Django.`
        );
        return;
      }

      console.log(`[${dialogTitle}] status:`, status);
      console.log(`[${dialogTitle}] text (first 800 chars):`, data.slice(0, 800));
      Alert.alert(dialogTitle, `Błąd backendu (${status ?? "?"}).`);
      return;
    }

    const msg = (data as any)?.detail ?? err.message;
    console.log(`[${dialogTitle}] status:`, status);
    console.log(`[${dialogTitle}] data:`, data);
    Alert.alert(dialogTitle, String(msg));
  };

  const onPickScreenshot = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Permission required", "Allow photo library access to attach a screenshot.");
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
      fileName: (asset as any).fileName ?? null,
      mimeType: (asset as any).mimeType ?? null,
    });
  };

  const onSubmit = async () => {
    if (!title.trim() || !description.trim()) {
      Alert.alert("Missing info", "Please fill in title and description.");
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
        } as any);
      }

      const response = await api.post("/api/create_bug_report/", form, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      if (response.status !== 201) {
        Alert.alert("Error", `Unexpected response status: ${response.status}`);
        return;
      }
      Alert.alert("Thanks!", "Bug report submitted.", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } catch (err) {
      alertAxiosError("Bug report failed", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={mainStyles.container}>
      <ScrollView keyboardShouldPersistTaps="handled">
        <Text style={[mainStyles.title, { marginBottom: 12 }]}>Report a bug in this app</Text>

        <View style={mainStyles.labelInputContainer}>
          <Text style={mainStyles.label}>Title</Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Short summary"
            placeholderTextColor="#94A3B8"
            style={mainStyles.input}
            autoCapitalize="sentences"
          />
        </View>
        <View style={mainStyles.labelInputContainer}>
          <Text style={mainStyles.label}>Description</Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Steps to reproduce, what you expected, what happened…"
            placeholderTextColor="#94A3B8"
            style={[mainStyles.input, mainStyles.textarea]}
            multiline
            textAlignVertical="top"
          />
        </View>
        <View style={styles.screenshotRow}>
          <AppButton
            title={screenshot ? "Change screenshot" : "Add screenshot"}
            variant="secondary"
            onPress={onPickScreenshot}
          />
          {screenshot ? (
            <AppButton
              title="Remove"
              variant="link"
              onPress={() => setScreenshot(null)}
              textStyle={{ color: "#DC2626" }}
            />
          ) : null}
        </View>

        {screenshot ? (
          <Text style={styles.screenshotHint}>Screenshot attached</Text>
        ) : (
          <Text style={styles.screenshotHint}>No screenshot</Text>
        )}

        <AppButton
          title={submitting ? "Submitting…" : "Submit"}
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
