import { Button, cnm } from "@humansignal/ui";

interface FormFooterProps {
  currentStep: number;
  totalSteps: number;
  onPrevious: () => void;
  onNext: () => void;
  onSave?: () => void;
  isEditMode: boolean;
  connectionChecked: boolean;
  filesPreview: any[] | null;
  testConnection: {
    isLoading: boolean;
    mutate: () => void;
  };
  loadPreview: {
    isLoading: boolean;
    mutate: () => void;
  };
  createStorage: {
    isLoading: boolean;
  };
  saveStorage?: {
    isLoading: boolean;
  };
  target?: "import" | "export";
  isProviderDisabled?: boolean;
  t: any;
}

export const FormFooter = ({
  currentStep,
  totalSteps,
  onPrevious,
  onNext,
  onSave,
  isEditMode,
  connectionChecked,
  filesPreview,
  testConnection,
  loadPreview,
  createStorage,
  saveStorage,
  target,
  isProviderDisabled = false,
  t,
}: FormFooterProps) => {
  return (
    <div className="flex items-center justify-between p-wide border-t border-neutral-border bg-neutral-background">
      <Button look="outlined" onClick={onPrevious} disabled={currentStep === 0}>
        { t("common.blocks.previous") }
      </Button>

      <div className="flex gap-tight items-center">
        {(isEditMode ? currentStep === 0 : currentStep === 1) && (
          <>
            <Button
              waiting={testConnection.isLoading}
              onClick={testConnection.mutate}
              variant={connectionChecked ? "positive" : "primary"}
              className={cnm({
                "border-none shadow-none bg-positive-surface-content-subtle text-positive-content pointer-events-none":
                  connectionChecked,
              })}
              style={connectionChecked ? { textShadow: "none" } : {}}
            >
              {connectionChecked ? t("common.blocks.connection_verified") : t("common.blocks.test_connection") }
            </Button>
          </>
        )}

        {(isEditMode ? currentStep === 1 : currentStep === 2) && (
          <Button waiting={loadPreview.isLoading} onClick={loadPreview.mutate} disabled={filesPreview !== null}>
            {filesPreview !== null ? t("common.blocks.preview_loaded") : t("common.blocks.load_preview") }
          </Button>
        )}

        <Button
          onClick={onNext}
          waiting={currentStep === totalSteps - 1 && createStorage.isLoading}
          disabled={
            (!isEditMode && currentStep === 1 && !connectionChecked) || (currentStep === 0 && isProviderDisabled)
          }
          look={currentStep === totalSteps - 1 && target !== "export" ? "outlined" : undefined}
          tooltip={
            currentStep === 1 && !connectionChecked
              ? t("common.blocks.test_connection_before_continue")
              : currentStep === 0 && isProviderDisabled
                ? t("common.blocks.provider_not_available")
                : undefined
          }
        >
          {currentStep < totalSteps - 1 ? t("common.blocks.next") : target === "export" ? t("common.blocks.save") : t("common.blocks.save_and_sync") }
        </Button>

        {currentStep === totalSteps - 1 && target !== "export" && onSave && (
          <Button onClick={onSave} waiting={saveStorage?.isLoading}>
            { t("common.blocks.save") }
          </Button>
        )}
      </div>
    </div>
  );
};
