import { StyleSheet } from "react-native";

export const mainStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFF",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  largeTitle: {
    fontSize: 32,
    fontWeight: "700",
    color: "#1D4ED8",
  },
  header: {
    paddingHorizontal: 4,
    paddingVertical: 8,
    gap: 4,
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1D4ED8",
  },
  subtitle: {
    fontSize: 16,
    color: "#475569",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  input: {
    height: 44,
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    color: "#0F172A",
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#475569",
    marginBottom: 6,
  },
  labelInputContainer: {
    marginBottom: 12,
  },

  messageCard: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  messageCardError: {
    backgroundColor: "#FEF2F2",
    borderColor: "#ff9393",
  },
  messageTextError: {
    color: "#991B1B",
    fontWeight: "700",
    textAlign: "left",
    lineHeight: 18,
  },

  messageCardSuccess: {
    backgroundColor: "#F0FDF4",
    borderColor: "#BBF7D0",
  },
  messageTextSuccess: {
    color: "#166534",
    fontWeight: "700",
    textAlign: "left",
    lineHeight: 18,
  },
  contentCenter: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  planOptionCard: {
    padding: 16,
    marginVertical: 8,
    borderWidth: 2,
    borderColor: "#b0d2ff",
    borderRadius: 8,
    width: "80%",
    alignItems: "center",
  },
  planOptionCardSelected: {
    borderColor: "#007BFF",
    backgroundColor: "#E0F0FF",
    borderWidth: 2,
  },

  warningText: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    paddingHorizontal: 20,
  },
  textarea: {
    minHeight: 120,
    height: 140,
  },
  videoCard: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  video: {
    width: "100%",
    aspectRatio: 16 / 9,
  },
  statusButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#CBD5F5",
    backgroundColor: "#EFF6FF",
  },
  statusButtonGo: {
    borderColor: "#2563EB",
    backgroundColor: "#DBEAFE",
  },
  statusButtonDone: {
    borderColor: "#16A34A",
    backgroundColor: "#DCFCE7",
  },
  statusButtonInactive: {
    borderColor: "#E2E8F0",
    backgroundColor: "#F1F5F9",
  },
  statusButtonPressed: {
    transform: [{ scale: 0.98 }],
  },
  statusButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1E40AF",
  },
  statusButtonTextDone: {
    color: "#15803D",
  },
  statusButtonTextInactive: {
    color: "#94A3B8",
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#475569",
    textAlign: "center",
  },
});
