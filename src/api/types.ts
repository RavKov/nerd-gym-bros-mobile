export type { PaginatedResponse } from "@/src/utils/pagination";

export type StripeSheetResponse = {
  clientSecret: string;
  customerId?: string;
  ephemeralKey?: string;
};

export type MessageResponse = {
  message?: string;
  detail?: string;
};
