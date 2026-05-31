import { type Gym } from "@/src/api/gyms";
import { useEquipments, useGyms } from "@/src/hooks/useApiQueries";
import { mainStyles } from "@/src/styles/mainStyles";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useLocalSearchParams } from "expo-router";
import { getDistance } from "geolib";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

type GymWithDistance = Gym & { distance?: number };

function getGoogleMapsUrl(address: Gym["address"]) {
  const lat = Number.parseFloat(address.latitude);
  const lng = Number.parseFloat(address.longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
}

function parseIdList(value?: string | string[]) {
  if (!value) return [] as number[];
  const values = Array.isArray(value) ? value : value.split(",");
  return values.map((item) => Number.parseInt(item, 10)).filter((item) => Number.isFinite(item));
}

function addDistanceToGyms(gyms: GymWithDistance[], location: Location.LocationObject | null) {
  if (!location) return gyms;

  const userCoords = {
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
  };

  return gyms
    .map((gym) => {
      const lat = Number.parseFloat(gym.address.latitude);
      const lng = Number.parseFloat(gym.address.longitude);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        return { ...gym, distance: Infinity };
      }
      const gymCoords = { latitude: lat, longitude: lng };
      const distance = getDistance(userCoords, gymCoords);
      return { ...gym, distance };
    })
    .sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));
}

export default function GymsScreen() {
  const params = useLocalSearchParams<{
    equipment_ids?: string | string[];
  }>();

  const initialSelected = useMemo(() => {
    return parseIdList(params.equipment_ids);
  }, [params.equipment_ids]);

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [distanceOpen, setDistanceOpen] = useState(false);
  const { data: equipments = [], isLoading: loadingEquipments } = useEquipments();
  const { data: gyms = [], isLoading: loading } = useGyms();
  const [maxDistance, setMaxDistance] = useState<number | null>(null);
  const [maxDistanceKm, setMaxDistanceKm] = useState("");
  const [selectedEquipmentIds, setSelectedEquipmentIds] = useState<number[]>(initialSelected);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);

  useEffect(() => {
    if (initialSelected.length === 0) return;
    setSelectedEquipmentIds(initialSelected);
  }, [initialSelected]);

  useEffect(() => {
    const getCurrentLocation = async () => {
      setLoadingLocation(true);
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") return;

        const currentLocation = await Location.getCurrentPositionAsync({});
        setLocation(currentLocation);
      } catch (error) {
        Alert.alert("Error", "Could not get current location.");
        if (__DEV__) {
          console.warn("Error getting location:", error);
        }
      } finally {
        setLoadingLocation(false);
      }
    };

    getCurrentLocation();
  }, []);

  const gymsWithDistance = useMemo(() => addDistanceToGyms(gyms, location), [gyms, location]);

  const filteredGyms = useMemo(() => {
    return gymsWithDistance.filter((gym) => {
      // Filter by equipment
      const hasAllSelectedEquipment = selectedEquipmentIds.every((selectedId) =>
        gym.equipments.some((eq) => eq.id === selectedId)
      );
      if (!hasAllSelectedEquipment) return false;

      // Filter by distance
      if (maxDistance !== null && location) {
        if (gym.distance === undefined) return false;
        if (gym.distance > maxDistance) return false;
      }

      return true;
    });
  }, [gymsWithDistance, selectedEquipmentIds, maxDistance, location]);

  const handleDistanceChange = (value: string) => {
    value = value.replace(/[^0-9]/g, "");
    if (value.length > 4) {
      value = value.slice(0, 6);
    }
    setMaxDistanceKm(value);
    const trimmed = value.trim();
    if (!trimmed) {
      setMaxDistance(null);
      return;
    }
    const numeric = Number.parseFloat(trimmed.replace(",", "."));
    if (!Number.isFinite(numeric)) {
      setMaxDistance(null);
      return;
    }
    setMaxDistance(Math.max(0, Math.round(numeric * 1000)));
  };
  const toggleEquipment = (id: number) => {
    setSelectedEquipmentIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <View style={mainStyles.container}>
      <View style={mainStyles.header}>
        <Text style={mainStyles.title}>Gyms</Text>
      </View>
      <View style={[styles.filterCard, !location && styles.filterCardDisabled]}>
        <Pressable
          onPress={() => setDistanceOpen((open) => !open)}
          style={({ pressed }) => [styles.filterHeader, pressed && styles.cardPressed]}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Ionicons name={distanceOpen ? "caret-up" : "caret-down"} size={16} color="#1D4ED8" />
            <Text style={styles.filterTitle}>Filter by max distance</Text>
            {loadingLocation ? <ActivityIndicator size="small" color="#1D4ED8" /> : null}
          </View>
          <Text style={styles.filterCount}>
            {maxDistanceKm ? `${maxDistanceKm} km` : "No limit"}
          </Text>
        </Pressable>

        {distanceOpen ? (
          <>
            <TextInput
              value={maxDistanceKm}
              onChangeText={handleDistanceChange}
              placeholder="e.g. 10"
              keyboardType="decimal-pad"
              editable={Boolean(location)}
              style={styles.distanceInput}
            />
            {!location ? (
              <Text style={styles.filterErrorText}>Couldn&apos;t get current location.</Text>
            ) : null}
          </>
        ) : null}
      </View>

      <View style={styles.filterCard}>
        <Pressable
          onPress={() => setFiltersOpen((open) => !open)}
          style={({ pressed }) => [styles.filterHeader, pressed && styles.cardPressed]}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Ionicons name={filtersOpen ? "caret-up" : "caret-down"} size={16} color="#1D4ED8" />
            <Text style={styles.filterTitle}>Filter by equipment</Text>
          </View>
          <Text style={styles.filterCount}>{selectedEquipmentIds.length} selected</Text>
        </Pressable>

        {filtersOpen ? (
          loadingEquipments ? (
            <ActivityIndicator size="small" color="#1D4ED8" style={styles.filterLoader} />
          ) : (
            <View style={styles.chipWrap}>
              {equipments.map((equipment) => {
                const isSelected = selectedEquipmentIds.includes(equipment.id);
                return (
                  <Pressable
                    key={equipment.id}
                    onPress={() => toggleEquipment(equipment.id)}
                    style={({ pressed }) => [
                      styles.chip,
                      isSelected && styles.chipSelected,
                      pressed && styles.cardPressed,
                    ]}
                  >
                    <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                      {equipment.name}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          )
        ) : null}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#1D4ED8" />
      ) : (
        <FlatList
          data={filteredGyms}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={[mainStyles.card, { padding: 12 }]}>
              <View style={styles.cardRow}>
                <View style={styles.infoColumn}>
                  <Text style={styles.gymName} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={styles.address} numberOfLines={2}>
                    {item.address.street}, {item.address.postal_code} {item.address.city}
                  </Text>
                  {item.distance ? (
                    <Text style={styles.contact}>{(item.distance / 1000).toFixed(2)} km away</Text>
                  ) : null}
                  {item.contact_phone ? (
                    <Text style={styles.contact}>{item.contact_phone}</Text>
                  ) : null}
                </View>
                {getGoogleMapsUrl(item.address) ? (
                  <Pressable
                    onPress={() => {
                      const url = getGoogleMapsUrl(item.address);
                      if (url) Linking.openURL(url);
                    }}
                    style={({ pressed }) => [styles.mapButton, pressed && styles.cardPressed]}
                  >
                    <Ionicons name="location-outline" size={24} color="#1D4ED8" />
                  </Pressable>
                ) : null}
              </View>
            </View>
          )}
          ListEmptyComponent={
            <Text style={mainStyles.emptySubtitle}>No gyms match the selected equipment.</Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 10,
    paddingBottom: 16,
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  infoColumn: {
    flex: 1,
    gap: 6,
  },
  cardPressed: {
    opacity: 0.9,
  },
  filterCard: {
    backgroundColor: "#f8fcff",
    borderWidth: 1,
    borderColor: "#71baff",
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  filterCardDisabled: {
    opacity: 0.5,
  },
  filterHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  filterTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111",
  },
  filterCount: {
    fontSize: 13,
    color: "#555",
  },
  filterLoader: {
    marginTop: 10,
  },
  distanceInput: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#cbd5f5",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#f8faff",
    color: "#111",
  },
  filterErrorText: {
    marginTop: 6,
    fontSize: 14,
    fontWeight: "bold",
    color: "#b91c1c",
  },
  chipWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 10,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#cbd5f5",
    backgroundColor: "#f8faff",
  },
  chipSelected: {
    backgroundColor: "#1D4ED8",
    borderColor: "#1D4ED8",
  },
  chipText: {
    fontSize: 12,
    color: "#1f2937",
    fontWeight: "600",
  },
  chipTextSelected: {
    color: "#fff",
  },
  gymName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111",
  },
  address: {
    fontSize: 13,
    color: "#444",
  },
  equipmentText: {
    fontSize: 12,
    color: "#1f2937",
  },
  equipmentEmpty: {
    fontSize: 12,
    color: "#9ca3af",
  },
  contact: {
    fontSize: 14,

    color: "#6b7280",
  },
  mapButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#eff4ff",
    borderWidth: 1,
    borderColor: "#c7d2fe",
  },
});
