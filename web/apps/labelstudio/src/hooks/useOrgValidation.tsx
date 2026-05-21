import { useEffect } from "react";
import { ToastType, useToast } from "@humansignal/ui";
import "../translations/i18n"
import { useTranslation } from "react-i18next";

/**
 * Creates a shared AbortController, which can be used to abort requests.
 * Automatically cancels the current controller when the component unmounts.
 */
export const useOrgValidation = (): void => {
  const toast = useToast();
  const { t } = useTranslation();

  useEffect(() => {
    if (window.APP_SETTINGS?.flags?.storage_persistence) return;
    toast.show({
      message: (
        <>
          { t("hooks.orgValidateTips") }
        </>
      ),
      type: ToastType.alertError,
      duration: -1,
    });
  }, []);
};
