import { useMemo, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import axios from "axios";
import { router } from "expo-router";

import { api } from "@/src/config/api";
import { AppButton } from "@/src/components/AppButton";

import { mainStyles } from "@/src/styles/mainStyles";

export default function NewFeatureRequest() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
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

      const response = await api.post("/api/create_feature_request/", form, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      if (response.status !== 201) {
        Alert.alert("Error", `Unexpected response status: ${response.status}`);
        return;
      }
      Alert.alert("Thanks!", "Feature request submitted.", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } catch (err) {
      alertAxiosError("Feature request failed", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={mainStyles.container}>
      <ScrollView keyboardShouldPersistTaps="handled">
        <Text style={[mainStyles.title, { marginBottom: 12 }]}>Request a new feature</Text>

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
            placeholder="Detailed description"
            placeholderTextColor="#94A3B8"
            style={[mainStyles.input, mainStyles.textarea]}
            multiline
            textAlignVertical="top"
          />
        </View>
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
