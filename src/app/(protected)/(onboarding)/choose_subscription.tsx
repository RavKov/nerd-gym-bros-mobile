import { View, Text, Alert, StyleSheet } from "react-native";
import { useAuth } from "@/src/context/AuthContext";
import { useRouter } from "expo-router";
import { useStripe } from '@stripe/stripe-react-native';
import { use, useEffect, useState } from "react";
import { api } from "@/src/config/api";
import axios from "axios";
import { SubscriptionPlan, Subscription } from "@/src/types/subscriptionPlan";
import { AppButton } from "@/src/components/AppButton";
import { mainStyles } from "@/src/styles/mainStyles";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ChooseSubscription() {
    const { initPaymentSheet, presentPaymentSheet } = useStripe();
    const [subscriptionPlans, setSubscriptionPlans] = useState<Array<SubscriptionPlan>>([]);
    const [subscription, setSubscription] = useState<Subscription | null>(null);
    const { userData, refreshUserData } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const alertAxiosError = (title: string, err: unknown) => {
        if (!axios.isAxiosError(err)) {
            Alert.alert(title, err instanceof Error ? err.message : "Unknown error");
            return;
        }

        const status = err.response?.status;
        const data = err.response?.data;

        if (typeof data === "string") {
            const looksLikeHtml = /<html|<!doctype html/i.test(data);
            if (looksLikeHtml) {
                console.log(`[${title}] status:`, status);
                console.log(`[${title}] html (first 800 chars):`, data.slice(0, 800));
                Alert.alert(title, `Backend zwrócił HTML (${status ?? "?"}). Sprawdź traceback w Django.`);
                return;
            }

            console.log(`[${title}] status:`, status);
            console.log(`[${title}] text (first 800 chars):`, data.slice(0, 800));
            Alert.alert(title, `Błąd backendu (${status ?? "?"}).`);
            return;
        }

        const msg = (data as any)?.detail ?? err.message;
        console.log(`[${title}] status:`, status);
        console.log(`[${title}] data:`, data);
        Alert.alert(title, String(msg));
    };

    useEffect(() => {
        const fetchCurrentSubscription = async () => {
            try {
                const response = await api.get<Subscription>('/api/me/subscription/');
                if (response.status === 200) {
                    setSubscription(response.data);
                }
            } catch (error) {
                console.warn("Failed to fetch current subscription:", error);
            }
        };

        fetchCurrentSubscription();
    }, [userData]);

    useEffect(() => {
        console.log("Fetching subscription plans...");
        const fetchSubscriptionPlans = async () => {
            try {
                const response = await api.get<Array<SubscriptionPlan>>('/api/subscription_plans/');
                if (response.status === 200) {
                    setSubscriptionPlans(response.data);
                }
            } catch (error) {
                console.warn("Failed to fetch subscription plans:", error);
            }
        };

        fetchSubscriptionPlans();
    }, []);

    const openPaymentSheet = async (plan: SubscriptionPlan): Promise<boolean> => {
        const email = userData?.user?.email;
        if (!email) {
            Alert.alert("Brak danych", "Nie znaleziono emaila użytkownika.");
            return false;
        }

        const priceId = plan.stripe_price_id ?? null;
        if (!priceId) {
            Alert.alert("Brak konfiguracji", "Ten plan nie ma ustawionego stripe_price_id po stronie backendu.");
            return false;
        }

        try {
            setLoading(true);
            console.log("[paymentSheet] start", { planId: plan.id, priceId });

            // Backend powinien zwrócić dane do PaymentSheet.
            // Minimalnie: `clientSecret` (PaymentIntent client secret).
            // Opcjonalnie: `customerId` + `ephemeralKey` (dla zapisanych metod płatności).
            const res = await api.post("/api/create_subscription_sheet/", {
                email,
                price_id: priceId,
            });

            console.log("[create_subscription_sheet] response:", res.data);

            const clientSecret = (res.data as any)?.clientSecret;
            const customerId = (res.data as any)?.customerId;
            const ephemeralKey = (res.data as any)?.ephemeralKey;

            if (!clientSecret || typeof clientSecret !== "string") {
                console.log("[create_subscription_sheet] unexpected response:", res.data);
                Alert.alert("Payment Error", "Backend nie zwrócił `clientSecret`.");
                return false;
            }

            const { error: initError } = await initPaymentSheet({
                merchantDisplayName: "Nerd Gym Bros",
                paymentIntentClientSecret: clientSecret,
                ...(customerId && ephemeralKey
                    ? { customerId, customerEphemeralKeySecret: ephemeralKey }
                    : null),
            });

            if (initError) {
                Alert.alert("Init error", initError.message ?? "Nie udało się zainicjalizować płatności.");
                return false;
            }

            console.log("[paymentSheet] init OK");

            const { error: presentError } = await presentPaymentSheet();
            if (presentError) {
                Alert.alert("Payment error", presentError.message ?? "Płatność nie powiodła się.");
                return false;
            }

            console.log("[paymentSheet] present OK");

            Alert.alert("Success", "Payment completed.");
            return true;
        } catch (err) {
            alertAxiosError("Payment Error", err);
            return false;
        } finally {
            setLoading(false);
        }
    };
    const onChoosePlan = async (plan: SubscriptionPlan) => {
        if (plan.stripe_price_id) {
            const paidOk = await openPaymentSheet(plan);
            if (!paidOk) return;
        }
        try {
            const response = await api.post(`/api/me/subscription_plan/choose/`, { subscription_plan_id: plan.id });
            if (response.status === 200) {
                Alert.alert("Success", "Subscription updated successfully.");
                await refreshUserData();
                router.replace("/(protected)/(drawer)");
            }
        }
        catch (error) {
            if (axios.isAxiosError(error)) {
                console.log("[subscribe] status:", error.response?.status);
                console.log("[subscribe] data:", error.response?.data);
                alertAxiosError("Subscription Error", error);
                return;
            }
            console.error("Failed to subscribe to plan:", error);
        }
    };

    const cancelCurrentSubscription = async () => {
        try {
            const response = await api.post(`/api/cancel_subscription/`);
            if (response.status === 200) {
                Alert.alert("Success", "Subscription cancelled successfully.");
                await refreshUserData();

                router.replace("/(protected)/(onboarding)/choose_subscription");
            }
        }
        catch (error) {
            if (axios.isAxiosError(error)) {
                console.log("[cancel subscription] status:", error.response?.status);
                console.log("[cancel subscription] data:", error.response?.data);
                alertAxiosError("Cancel Subscription Error", error);
                return;
            }
            console.error("Failed to cancel subscription:", error);
        }
    };


    const formatDate = (dateString: string | null) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    return (
        <SafeAreaView
            style={mainStyles.container}
        >

            <View style={mainStyles.contentCenter}>
            {subscription && subscription.current_period_start && subscription.current_period_end ? (
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
                        style={[mainStyles.planOptionCard, userData?.subscription_plan === plan.id && mainStyles.planOptionCardSelected]}
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