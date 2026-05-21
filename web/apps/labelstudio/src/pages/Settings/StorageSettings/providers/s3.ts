import { z } from "zod";
import type { ProviderConfig } from "@humansignal/app-common/blocks/StorageProviderForm/types/provider";
import { IconCloudProviderS3 } from "@humansignal/icons";

import "../../../../translations/i18n";

export const s3Provider: ProviderConfig = {
  name: "s3",
  title: "pages.settings.providers.s3.amazon_s3",
  description: "pages.settings.providers.s3.desc",
  icon: IconCloudProviderS3,
  fields: [
    {
      name: "bucket",
      type: "text",
      label: "pages.settings.providers.s3.bucket_name",
      required: true,
      placeholder: "",
      schema: z
        .string()
        .min(1, "pages.settings.providers.s3.bucket_name_schema"),
    },
    {
      name: "region_name",
      type: "text",
      label: "pages.settings.providers.s3.region_name",
      placeholder: "us-east-1",
      schema: z.string().optional().default(""),
    },
    {
      name: "s3_endpoint",
      type: "text",
      label: "pages.settings.providers.s3.s3_endpoint",
      placeholder: "https://s3.amazonaws.com",
      schema: z.string().optional().default(""),
    },
    {
      name: "prefix",
      type: "text",
      label: "pages.settings.providers.s3.prefix",
      placeholder: "path/to/files",
      schema: z.string().optional().default(""),
      target: "export",
    },
    {
      name: "aws_access_key_id",
      type: "password",
      label: "pages.settings.providers.s3.aws_access_key_id",
      required: true,
      placeholder: "AKIAIOSFODNN7EXAMPLE",
      autoComplete: "off",
      accessKey: true,
      schema: z
        .string()
        .min(1, "pages.settings.providers.s3.aws_access_key_id_schema"),
    },
    {
      name: "aws_secret_access_key",
      type: "password",
      label: "pages.settings.providers.s3.aws_secret_access_key",
      required: true,
      placeholder: "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY",
      autoComplete: "new-password",
      accessKey: true,
      schema: z
        .string()
        .min(1, "pages.settings.providers.s3.aws_secret_access_key_schema"),
    },
    {
      name: "aws_session_token",
      type: "password",
      label: "pages.settings.providers.s3.aws_session_token",
      placeholder: "Session token (optional)",
      autoComplete: "new-password",
      schema: z.string().optional().default(""),
    },
    {
      name: "presign",
      type: "toggle",
      label: "pages.settings.providers.s3.presign",
      description: "pages.settings.providers.s3.presign_desc",
      schema: z.boolean().default(true),
      target: "import",
      resetConnection: false,
    },
    {
      name: "presign_ttl",
      type: "counter",
      label: "pages.settings.providers.s3.pre_signed_url",
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
    { fields: ["region_name"] },
    { fields: ["s3_endpoint"] },
    { fields: ["prefix"] },
    { fields: ["aws_access_key_id"] },
    { fields: ["aws_secret_access_key"] },
    { fields: ["aws_session_token"] },
    { fields: ["presign", "presign_ttl"] },
  ],
};
