import { View, Text, Alert, StyleSheet } from "react-native";
import { useStripe } from "@stripe/stripe-react-native";
import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "@/src/context/AuthContext";
import { AppButton } from "@/src/components/AppButton";
import {
  cancelSubscription,
  chooseFreeSubscriptionPlan,
  createSubscriptionSheet,
  fetchCurrentSubscription,
  fetchSubscriptionPlans,
  waitForSubscriptionPlan,
} from "@/src/api/subscriptions";
import { alertAxiosError } from "@/src/utils/apiErrors";
import type { Subscription, SubscriptionPlan } from "@/src/types/subscriptionPlan";
import { mainStyles } from "@/src/styles/mainStyles";

export default function ChooseSubscription() {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const { userData, refreshUserData } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCurrentSubscription().then(setSubscription);
  }, [userData]);

  useEffect(() => {
    fetchSubscriptionPlans()
      .then(setSubscriptionPlans)
      .catch((error) => console.warn("Failed to fetch subscription plans:", error));
  }, []);

  const openPaymentSheet = async (plan: SubscriptionPlan): Promise<boolean> => {
    if (!plan.stripe_price_id) {
      Alert.alert("Configuration error", "This plan is not configured for Stripe payments.");
      return false;
    }

    try {
      setLoading(true);
      const sheet = await createSubscriptionSheet(plan.id);

      if (!sheet.clientSecret) {
        Alert.alert("Payment error", "Backend did not return a payment client secret.");
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
        Alert.alert("Payment error", initError.message ?? "Could not initialize payment.");
        return false;
      }

      const { error: presentError } = await presentPaymentSheet();
      if (presentError) {
        Alert.alert("Payment error", presentError.message ?? "Payment was not completed.");
        return false;
      }

      return true;
    } catch (err) {
      alertAxiosError("Payment error", err);
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
        await refreshUserData();

        if (activated) {
          Alert.alert("Success", "Subscription activated successfully.");
          router.replace("/(protected)/(drawer)");
        } else {
          Alert.alert(
            "Payment received",
            "Your subscription is being activated. Check back shortly from Settings."
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
      Alert.alert("Success", "Subscription updated successfully.");
      await refreshUserData();
      router.replace("/(protected)/(drawer)");
    } catch (error) {
      alertAxiosError("Subscription error", error);
    } finally {
      setLoading(false);
    }
  };

  const cancelCurrentSubscription = async () => {
    try {
      setLoading(true);
      await cancelSubscription();
      Alert.alert("Success", "Subscription cancelled successfully.");
      await refreshUserData();
      router.replace("/(protected)/(onboarding)/choose_subscription");
    } catch (error) {
      alertAxiosError("Cancel subscription error", error);
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
      <View style={mainStyles.contentCenter}>
        {subscription?.current_period_start && subscription?.current_period_end ? (
          <View style={[mainStyles.header, { marginBottom: 20 }]}>
            <Text style={mainStyles.title}>You have premium plan</Text>
            <Text style={mainStyles.subtitle}>
              Valid until {formatDate(subscription.current_period_end)}
            </Text>
            <Text style={{ fontSize: 14, color: "#64748B", marginTop: 8 }}>
              After this period, the next payment will be charged.
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
                  title={plan.stripe_price_id ? "Choose and Pay" : "Choose Plan"}
                  style={{ flex: 1 }}
                />
              ) : null}
              {userData?.subscription_plan === plan.id ? (
                <AppButton
                  title="Cancel"
                  onPress={cancelCurrentSubscription}
                  style={styles.cancelButton}
                />
              ) : null}
            </View>
          </View>
        ))}
      </View>
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
