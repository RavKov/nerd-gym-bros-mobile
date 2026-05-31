import { useCallback } from "react";

import { useContent } from "@/src/context/ContentContext";
import { COPY, type CopyCode, type CopyParams } from "@/src/i18n/copy";

export function useCopy() {
  const { t } = useContent();

  return useCallback((code: CopyCode, params?: CopyParams) => t(code, COPY[code], params), [t]);
}
