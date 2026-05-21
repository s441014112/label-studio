import type { ProviderConfig } from "@humansignal/app-common/blocks/StorageProviderForm/types/provider";
import { IconCloudProviderAzure } from "@humansignal/icons";
import { z } from "zod";

export const azureProvider: ProviderConfig = {
  name: "azure",
  title: "pages.settings.providers.azure.azure_blob",
  description: "pages.settings.providers.azure.desc",
  icon: IconCloudProviderAzure,
  fields: [
    {
      name: "container",
      type: "text",
      label: "pages.settings.providers.azure.container",
      required: true,
      placeholder: "my-azure-container",
      schema: z
        .string()
        .min(1, "pages.settings.providers.azure.container_schema"),
    },
    {
      name: "prefix",
      type: "text",
      label: "pages.settings.providers.azure.prefix",
      placeholder: "path/to/files",
      schema: z.string().optional().default(""),
      target: "export",
    },
    {
      name: "account_name",
      type: "password",
      label: "pages.settings.providers.azure.account_name",
      autoComplete: "off",
      accessKey: true,
      placeholder: "",
      schema: z.string().optional().default(""),
    },
    {
      name: "account_key",
      type: "password",
      label: "pages.settings.providers.azure.account_key",
      autoComplete: "new-password",
      accessKey: true,
      placeholder: "pages.settings.providers.azure.account_key_placeholder",
      schema: z.string().optional().default(""),
    },
    {
      name: "presign",
      type: "toggle",
      label: "pages.settings.providers.azure.presign_label",
      description: "pages.settings.providers.azure.presign_desc",
      schema: z.boolean().default(true),
      target: "import",
      resetConnection: false,
    },
    {
      name: "presign_ttl",
      type: "counter",
      label: "pages.settings.providers.azure.pre_signed_url",
      min: 1,
      max: 10080,
      step: 1,
      schema: z.number().min(1).max(10080).default(15),
      target: "import",
      resetConnection: false,
      dependsOn: {
        field: "presign",
        value: true,
      },
    },
  ],
  layout: [
    { fields: ["container"] },
    { fields: ["prefix"] },
    { fields: ["account_name"] },
    { fields: ["account_key"] },
    { fields: ["presign", "presign_ttl"] },
  ],
};

export default azureProvider;
