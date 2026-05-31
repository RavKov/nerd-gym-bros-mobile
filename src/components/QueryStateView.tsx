import type { ReactNode } from "react";

import { ErrorStateView } from "@/src/components/ErrorStateView";
import { LoadingView } from "@/src/components/LoadingView";
import { getErrorMessage } from "@/src/utils/apiErrors";

type QueryStateViewProps = {
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  onRetry?: () => void;
  loadingMessage?: string;
  errorTitle?: string;
  children: ReactNode;
};

export function QueryStateView({
  isLoading,
  isError,
  error,
  onRetry,
  loadingMessage,
  errorTitle,
  children,
}: QueryStateViewProps) {
  if (isLoading) {
    return <LoadingView message={loadingMessage} />;
  }

  if (isError) {
    return <ErrorStateView title={errorTitle} message={getErrorMessage(error)} onRetry={onRetry} />;
  }

  return children;
}
