import { getProviderConfig } from "../providers";
import { ProviderForm } from "../components/provider-form";
import Input from "apps/labelstudio/src/components/Form/Elements/Input/Input";
import { Toggle } from "@humansignal/ui";

interface ProviderDetailsStepProps {
  formData: any;
  errors: Record<string, string>;
  handleProviderFieldChange: (name: string, value: any) => void;
  handleFieldBlur?: (name: string, value: any) => void;
  provider?: string;
  isEditMode?: boolean;
  target?: "import" | "export";
  t: any;
}

export const ProviderDetailsStep = ({
  formData,
  errors,
  handleProviderFieldChange,
  handleFieldBlur,
  provider,
  isEditMode = false,
  target,
  t,
}: ProviderDetailsStepProps) => {
  const providerConfig = getProviderConfig(provider);

  if (!provider || !providerConfig) {
    return <div className="text-red-500">{!provider ? t("common.blocks.no_provider_selected") : `${ t("common.blocks.unknown_provider") }: ${provider}`}</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">{t(providerConfig.title)}</h2>
        <p className="text-muted-foreground">{t(providerConfig.description)}</p>
      </div>

      {/* Title field - common for all providers */}
      <div className="space-y-2">
        <Input
          name="title"
          value={formData.title ?? ""}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleProviderFieldChange("title", e.target.value)}
          placeholder={ `${ t("common.blocks.enter_descriptive_name") } (e.g., 'Legal Documents', 'Training Data')` }
          validate=""
          skip={false}
          labelProps={{}}
          ghost={false}
          tooltip=""
          tooltipIcon={null}
          required={true}
          label={ t("common.blocks.storage_title") }
          description={ t("common.blocks.name_help_tip") }
          footer={errors.title ? <span className="text-negative-content">{errors.title}</span> : ""}
          className={errors.title ? "border-negative-content" : ""}
        />
      </div>

      <ProviderForm
        provider={providerConfig}
        formData={formData}
        errors={errors}
        onChange={handleProviderFieldChange}
        onBlur={handleFieldBlur}
        isEditMode={isEditMode}
        target={target}
        t={t}
      />

      {/* Export-specific common fields */}
      {target === "export" && (
        <div className="space-y-6">
          <div className="space-y-2">
            <Toggle
              checked={formData.can_delete_objects ?? false}
              onChange={(e) => handleProviderFieldChange("can_delete_objects", e.target.checked)}
              aria-label="Can delete objects from storage"
              label={ t("common.blocks.delete_storage") }
              description={ t("common.blocks.delete_storage_confirm") }
            />
          </div>
        </div>
      )}
    </div>
  );
};
