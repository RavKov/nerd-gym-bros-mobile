import React, { Component, type ErrorInfo, type ReactNode } from "react";

import { ErrorStateView } from "@/src/components/ErrorStateView";
import { COPY } from "@/src/i18n/copy";
import { devWarn } from "@/src/utils/devLog";

type ErrorBoundaryProps = {
  children: ReactNode;
};

type ErrorBoundaryState = {
  error: Error | null;
};

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    devWarn("[ErrorBoundary]", error.message, info.componentStack);
  }

  private handleRetry = () => {
    this.setState({ error: null });
  };

  render() {
    if (this.state.error) {
      return (
        <ErrorStateView
          title={COPY.error_boundary_title}
          message={__DEV__ ? this.state.error.message : COPY.error_boundary_message}
          onRetry={this.handleRetry}
        />
      );
    }

    return this.props.children;
  }
}
