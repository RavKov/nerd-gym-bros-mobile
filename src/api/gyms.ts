import { api } from "@/src/api/client";
import { fetchAllPages } from "@/src/utils/pagination";

export type Equipment = {
  id: number;
  name: string;
};

export type GymAddress = {
  id: number;
  street: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  latitude: string;
  longitude: string;
};

export type Gym = {
  id: number;
  name: string;
  address: GymAddress;
  equipments: Equipment[];
  contact_email?: string | null;
  contact_phone?: string | null;
};

export async function fetchEquipments(): Promise<Equipment[]> {
  return fetchAllPages<Equipment>(api, "/api/equipments/");
}

export async function fetchGyms(): Promise<Gym[]> {
  return fetchAllPages<Gym>(api, "/api/gyms/");
}
