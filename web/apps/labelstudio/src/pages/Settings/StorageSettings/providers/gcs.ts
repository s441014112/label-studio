import { z } from "zod";
import type { ProviderConfig } from "@humansignal/app-common/blocks/StorageProviderForm/types/provider";
import { IconCloudProviderGCS } from "@humansignal/icons";

export const gcsProvider: ProviderConfig = {
  name: "gcs",
  title: "pages.settings.providers.gcs.gcs",
  description: "pages.settings.providers.gcs.desc",
  icon: IconCloudProviderGCS,
  fields: [
    {
      name: "bucket",
      type: "text",
      label: "pages.settings.providers.gcs.bucket",
      required: true,
      schema: z.string().min(1, "pages.settings.providers.gcs.bucket_schema"),
    },
    {
      name: "prefix",
      type: "text",
      label: "pages.settings.providers.gcs.prefix",
      placeholder: "path/to/files",
      schema: z.string().optional().default(""),
      target: "export",
    },
    {
      name: "google_application_credentials",
      type: "password",
      label: "pages.settings.providers.gcs.google_application_credentials",
      description:
        "pages.settings.providers.gcs.google_application_credentials_desc",
      autoComplete: "new-password",
      accessKey: true,
      schema: z.string().optional().default(""), // JSON validation could be added if needed
    },
    {
      name: "google_project_id",
      type: "text",
      label: "pages.settings.providers.gcs.project_id",
      description: "pages.settings.providers.gcs.project_id_desc",
      schema: z.string().optional().default(""),
    },
    {
      name: "presign",
      type: "toggle",
      label: "pages.settings.providers.gcs.presign_label",
      description: "pages.settings.providers.gcs.presign_desc",
      schema: z.boolean().default(true),
      target: "import",
      resetConnection: false,
    },
    {
      name: "presign_ttl",
      type: "counter",
      label: "pages.settings.providers.gcs.pre_signed_url",
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
    { fields: ["bucket"] },
    { fields: ["prefix"] },
    { fields: ["google_application_credentials"] },
    { fields: ["google_project_id"] },
    { fields: ["presign", "presign_ttl"] },
  ],
};

export default gcsProvider;
