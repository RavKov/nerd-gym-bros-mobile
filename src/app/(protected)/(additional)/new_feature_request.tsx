import { useMemo, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

import { createFeatureRequest } from "@/src/api/feedback";
import { alertAxiosError } from "@/src/utils/apiErrors";
import { AppButton } from "@/src/components/AppButton";
import { mainStyles } from "@/src/styles/mainStyles";
import { useCopy } from "@/src/i18n/useCopy";

export default function NewFeatureRequest() {
  const copy = useCopy();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = useMemo(() => {
    return title.trim().length > 0 && description.trim().length > 0 && !submitting;
  }, [title, description, submitting]);

  const onSubmit = async () => {
    if (!title.trim() || !description.trim()) {
      Alert.alert(copy("feature_request_missing_title"), copy("feature_request_missing_msg"));
      return;
    }

    setSubmitting(true);
    try {
      await createFeatureRequest(title.trim(), description.trim());
      Alert.alert(copy("feature_request_thanks_title"), copy("feature_request_thanks_msg"), [
        {
          text: copy("common_ok"),
          onPress: () => router.back(),
        },
      ]);
    } catch (err) {
      alertAxiosError(copy("feature_request_submit_error_title"), err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={mainStyles.container}>
      <ScrollView keyboardShouldPersistTaps="handled">
        <Text style={[mainStyles.title, { marginBottom: 12 }]}>
          {copy("feature_request_title")}
        </Text>

        <View style={mainStyles.labelInputContainer}>
          <Text style={mainStyles.label}>{copy("feature_request_label_title")}</Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder={copy("feature_request_placeholder_title")}
            placeholderTextColor="#94A3B8"
            style={mainStyles.input}
            autoCapitalize="sentences"
          />
        </View>
        <View style={mainStyles.labelInputContainer}>
          <Text style={mainStyles.label}>{copy("feature_request_label_description")}</Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder={copy("feature_request_placeholder_description")}
            placeholderTextColor="#94A3B8"
            style={[mainStyles.input, mainStyles.textarea]}
            multiline
            textAlignVertical="top"
          />
        </View>
        <AppButton
          title={submitting ? copy("feature_request_submitting") : copy("feature_request_submit")}
          onPress={onSubmit}
          disabled={!canSubmit}
          style={{ marginTop: 16 }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
