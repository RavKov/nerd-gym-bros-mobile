import { useMemo, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

import { createFeatureRequest } from "@/src/api/feedback";
import { alertAxiosError } from "@/src/utils/apiErrors";
import { AppButton } from "@/src/components/AppButton";

import { mainStyles } from "@/src/styles/mainStyles";

export default function NewFeatureRequest() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = useMemo(() => {
    return title.trim().length > 0 && description.trim().length > 0 && !submitting;
  }, [title, description, submitting]);

  const onSubmit = async () => {
    if (!title.trim() || !description.trim()) {
      Alert.alert("Missing info", "Please fill in title and description.");
      return;
    }

    setSubmitting(true);
    try {
      await createFeatureRequest(title.trim(), description.trim());
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
