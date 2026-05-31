import { View, Text, Alert, StyleSheet } from "react-native";
import { useStripe } from "@stripe/stripe-react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "@/src/context/AuthContext";
import { AppButton } from "@/src/components/AppButton";
import { QueryStateView } from "@/src/components/QueryStateView";
import {
  cancelSubscription,
  chooseFreeSubscriptionPlan,
  createSubscriptionSheet,
  waitForSubscriptionPlan,
} from "@/src/api/subscriptions";
import { alertAxiosError } from "@/src/utils/apiErrors";
import type { SubscriptionPlan } from "@/src/types/subscriptionPlan";
import { mainStyles } from "@/src/styles/mainStyles";
import { queryKeys, useCurrentSubscription, useSubscriptionPlans } from "@/src/hooks/useApiQueries";
import { useCopy } from "@/src/i18n/useCopy";

export default function ChooseSubscription() {
  const copy = useCopy();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const {
    data: subscriptionPlans = [],
    isLoading: plansLoading,
    isError: plansError,
    error: plansErrorSource,
    refetch: refetchPlans,
  } = useSubscriptionPlans();
  const { data: subscription = null } = useCurrentSubscription();
  const { userData, refreshUserData } = useAuth();
  const queryClient = useQueryClient();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const invalidateSubscriptionState = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.subscription }),
      refreshUserData(),
    ]);
  };

  const openPaymentSheet = async (plan: SubscriptionPlan): Promise<boolean> => {
    if (!plan.stripe_price_id) {
      Alert.alert(copy("subscription_config_error_title"), copy("subscription_config_error_msg"));
      return false;
    }

    try {
      setLoading(true);
      const sheet = await createSubscriptionSheet(plan.id);

      if (!sheet.clientSecret) {
        Alert.alert(
          copy("subscription_payment_error_title"),
          copy("subscription_payment_no_secret")
        );
        return false;
      }

      const { error: initError } = await initPaymentSheet({
        merchantDisplayName: "Nerd Gym Bros",
        paymentIntentClientSecret: sheet.clientSecret,
        ...(sheet.customerId && sheet.ephemeralKey
          ? {
              customerId: sheet.customerId,
              customerEphemeralKeySecret: sheet.ephemeralKey,
            }
          : null),
      });

      if (initError) {
        Alert.alert(
          copy("subscription_payment_error_title"),
          initError.message ?? copy("subscription_payment_init_failed")
        );
        return false;
      }

      const { error: presentError } = await presentPaymentSheet();
      if (presentError) {
        Alert.alert(
          copy("subscription_payment_error_title"),
          presentError.message ?? copy("subscription_payment_not_completed")
        );
        return false;
      }

      return true;
    } catch (err) {
      alertAxiosError(copy("subscription_payment_error_title"), err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const onChoosePlan = async (plan: SubscriptionPlan) => {
    if (plan.stripe_price_id) {
      const paidOk = await openPaymentSheet(plan);
      if (!paidOk) return;

      setLoading(true);
      try {
        const activated = await waitForSubscriptionPlan(plan.id);
        await invalidateSubscriptionState();

        if (activated) {
          Alert.alert(copy("common_success"), copy("subscription_activated"));
          router.replace("/(protected)/(drawer)");
        } else {
          Alert.alert(
            copy("subscription_payment_pending_title"),
            copy("subscription_payment_pending_msg")
          );
        }
      } finally {
        setLoading(false);
      }
      return;
    }

    try {
      setLoading(true);
      await chooseFreeSubscriptionPlan(plan.id);
      Alert.alert(copy("common_success"), copy("subscription_updated"));
      await invalidateSubscriptionState();
      router.replace("/(protected)/(drawer)");
    } catch (error) {
      alertAxiosError(copy("subscription_error_title"), error);
    } finally {
      setLoading(false);
    }
  };

  const cancelCurrentSubscription = async () => {
    try {
      setLoading(true);
      await cancelSubscription();
      Alert.alert(copy("common_success"), copy("subscription_cancelled"));
      await invalidateSubscriptionState();
      router.replace("/(protected)/(onboarding)/choose_subscription");
    } catch (error) {
      alertAxiosError(copy("subscription_cancel_error_title"), error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  };

  return (
    <SafeAreaView style={mainStyles.container}>
      <QueryStateView
        isLoading={plansLoading}
        isError={plansError}
        error={plansErrorSource}
        onRetry={() => refetchPlans()}
        loadingMessage={copy("subscription_loading")}
        errorTitle={copy("subscription_plans_error_title")}
      >
        <View style={mainStyles.contentCenter}>
          {subscription?.current_period_start && subscription?.current_period_end ? (
            <View style={[mainStyles.header, { marginBottom: 20 }]}>
              <Text style={mainStyles.title}>{copy("subscription_premium_title")}</Text>
              <Text style={mainStyles.subtitle}>
                {copy("subscription_premium_valid_until", {
                  date: formatDate(subscription.current_period_end),
                })}
              </Text>
              <Text style={{ fontSize: 14, color: "#64748B", marginTop: 8 }}>
                {copy("subscription_premium_renewal_hint")}
              </Text>
            </View>
          ) : null}

          {subscriptionPlans.map((plan) => (
            <View
              key={plan.id}
              style={[
                mainStyles.planOptionCard,
                userData?.subscription_plan === plan.id && mainStyles.planOptionCardSelected,
              ]}
            >
              <Text style={[mainStyles.title, { fontSize: 18 }]}>{plan.name}</Text>
              <Text style={{ fontSize: 16 }}>{plan.features}</Text>
              <Text style={{ fontSize: 16, marginTop: 8 }}>${plan.price} / month</Text>

              <View style={styles.actions}>
                {userData?.subscription_plan !== plan.id ? (
                  <AppButton
                    onPress={() => onChoosePlan(plan)}
                    disabled={loading || userData?.subscription_plan !== null}
                    title={
                      plan.stripe_price_id
                        ? copy("subscription_choose_pay")
                        : copy("subscription_choose_plan")
                    }
                    style={{ flex: 1 }}
                  />
                ) : null}
                {userData?.subscription_plan === plan.id ? (
                  <AppButton
                    title={copy("subscription_cancel")}
                    onPress={cancelCurrentSubscription}
                    style={styles.cancelButton}
                  />
                ) : null}
              </View>
            </View>
          ))}
        </View>
      </QueryStateView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 12,
  },
  cancelButton: {
    backgroundColor: "#DC2626",
    flex: 1,
  },
});
