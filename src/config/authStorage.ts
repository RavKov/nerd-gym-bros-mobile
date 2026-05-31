import * as SecureStore from "expo-secure-store";

const ACCESS_KEY = "auth.access";
const REFRESH_KEY = "auth.refresh";
const USERNAME_KEY = "auth.username";

export async function setTokens(access: string, refresh: string) {
  await SecureStore.setItemAsync(ACCESS_KEY, access);
  await SecureStore.setItemAsync(REFRESH_KEY, refresh);
}

export async function setUserName(userName: string) {
  await SecureStore.setItemAsync(USERNAME_KEY, userName);
}

export async function getUserName() {
  return SecureStore.getItemAsync(USERNAME_KEY);
}

export async function clearUserName() {
  await SecureStore.deleteItemAsync(USERNAME_KEY);
}

export async function getAccess() {
  return SecureStore.getItemAsync(ACCESS_KEY);
}

export async function getRefresh() {
  return SecureStore.getItemAsync(REFRESH_KEY);
}

export async function clearTokens() {
  await SecureStore.deleteItemAsync(ACCESS_KEY);
  await SecureStore.deleteItemAsync(REFRESH_KEY);
  await SecureStore.deleteItemAsync(USERNAME_KEY);
}
