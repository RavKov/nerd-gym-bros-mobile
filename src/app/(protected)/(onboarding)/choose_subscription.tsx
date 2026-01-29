import { View, Text, Alert } from "react-native";
import {useAuth} from "@/src/context/AuthContext";
import { useRouter } from "expo-router";
import { useStripe } from '@stripe/stripe-react-native';
import {useEffect, useState} from "react";
import {api} from "@/src/config/api";
import axios from "axios";
import { SubscriptionPlan } from "@/src/types/subscriptionPlan";
import { AppButton } from "@/src/components/AppButton";

export default function ChooseSubscription() {
    const { initPaymentSheet, presentPaymentSheet } = useStripe();
    const [subscriptionPlans, setSubscriptionPlans] = useState<Array<SubscriptionPlan>>([]);
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
        const fetchSubscriptionPlans = async () => {
            try {
                const response = await api.get<Array<SubscriptionPlan>>('/api/subscription_plans/');
                if (response.status === 200) {
                    setSubscriptionPlans(response.data);
                }
            } catch (error) {
                console.error("Failed to fetch subscription plans:", error);
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
            const response = await api.post(`/api/me/subscription/`, {subscription_plan_id: plan.id});
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
                router.replace("/(protected)/(drawer)");
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


    const isCurrentPlan = (plan: SubscriptionPlan): boolean => {
        return userData?.subscription_plan === plan.id;
    }

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
        {userData?.subscription_plan && (
            <>
                <Text style={{marginBottom: 10, fontWeight: "bold", fontSize: 18}}>Current subscription plan:</Text> 
                <Text style={{marginBottom: 10, fontWeight: "bold", fontSize: 22, color: "blue"}}>{subscriptionPlans.find(plan => plan.id === userData?.subscription_plan)?.name}</Text>

                <AppButton 
                  title="Cancel Subscription"
                  onPress={cancelCurrentSubscription}
                  style={{ marginBottom: 20, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 4, backgroundColor: "red" }}
                />
            </>
        )}

        {subscriptionPlans.map((plan) => (
            <View
                key={plan.id}
                style={{
                    padding: 16,
                    marginVertical: 8,
                    borderWidth: 1,
                    borderColor: "#ccc",
                    borderRadius: 8,
                    width: "80%",
                    alignItems: "center",
                }}
            >
                <Text style={{ fontSize: 18, fontWeight: "bold" }}>{plan.name}</Text>
                <Text style={{ fontSize: 16 }}>{plan.features}</Text>
                <Text style={{ fontSize: 16, marginTop: 8 }}>${plan.price} / month</Text>

                <AppButton
                  onPress={() => onChoosePlan(plan)}
                  disabled={loading || userData?.subscription_plan !== null}
                  title={plan.stripe_price_id ? "Choose and Pay" : "Choose Plan"}
                  style={{ marginTop: 12, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 4 }}
                />


            </View>
        ))} 


    </View>
  );
}