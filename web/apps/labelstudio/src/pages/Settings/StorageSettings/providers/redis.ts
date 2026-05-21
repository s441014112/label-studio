import { z } from "zod";
import type { ProviderConfig } from "@humansignal/app-common/blocks/StorageProviderForm/types/provider";
import { IconCloudProviderRedis } from "@humansignal/icons";

export const redisProvider: ProviderConfig = {
  name: "redis",
  title: "pages.settings.providers.redis.redis_storage",
  description: "pages.settings.providers.redis.desc",
  icon: IconCloudProviderRedis,
  fields: [
    {
      name: "db",
      type: "text",
      label: "pages.settings.providers.redis.db",
      placeholder: "1",
      schema: z.string().default("1"),
    },
    {
      name: "password",
      type: "password",
      label: "pages.settings.providers.redis.password",
      autoComplete: "new-password",
      placeholder: "",
      schema: z.string().optional().default(""),
    },
    {
      name: "host",
      type: "text",
      label: "pages.settings.providers.redis.host",
      required: true,
      placeholder: "redis://example.com",
      schema: z.string().min(1, "Host is required"),
    },
    {
      name: "port",
      type: "text",
      label: "pages.settings.providers.redis.port",
      placeholder: "6379",
      schema: z.string().default("6379"),
    },
    {
      name: "prefix",
      type: "text",
      label: "pages.settings.providers.redis.prefix",
      placeholder: "path/to/files",
      schema: z.string().optional().default(""),
      target: "export",
    },
  ],
  layout: [
    { fields: ["host", "port", "db", "password"] },
    { fields: ["prefix"] },
  ],
};

export default redisProvider;
