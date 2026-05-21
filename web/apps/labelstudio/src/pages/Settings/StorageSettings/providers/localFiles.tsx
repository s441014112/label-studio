import { z } from "zod";
import type { ProviderConfig } from "@humansignal/app-common/blocks/StorageProviderForm/types/provider";
import { IconFolderOpen } from "@humansignal/icons";
import { Alert, AlertDescription, AlertTitle } from "@humansignal/shad/components/ui/alert";

import i18n from "../../../../translations/i18n";

const localFilesDocumentRoot =
  typeof window === "undefined" ? undefined : window.APP_SETTINGS?.local_files_document_root;
const localFilesServingEnabled =
  typeof window === "undefined" ? true : window.APP_SETTINGS?.local_files_serving_enabled !== false;
const isCommunityEdition =
  typeof window === "undefined" ? false : window.APP_SETTINGS?.version?.edition === "Community";
const trimTrailingSeparators = (value?: string) => value?.replace(/[/\\]+$/, "");
const defaultPathExample = localFilesDocumentRoot
  ? `${trimTrailingSeparators(localFilesDocumentRoot)}/your-subdirectory`
  : undefined;

const pathSchema = defaultPathExample
  ? z.string().min(1, "pages.settings.providers.localFiles.path_schema").default(defaultPathExample)
  : z.string().min(1, "pages.settings.providers.localFiles.path_schema");

const LocalFilesServingWarning = () => {
  if (localFilesServingEnabled) return null;
  return (
    <>
      <Alert variant="destructive">
        <AlertTitle>{ i18n.t("pages.settings.providers.localFiles.serving_is_disabled") }</AlertTitle>
        <AlertDescription>
          { i18n.t("pages.settings.providers.localFiles.alert_desc") }:{" "}
          <a href="https://labelstud.io/guide/storage.html#Local-storage" target="_blank" rel="noreferrer">
            { i18n.t("pages.settings.providers.localFiles.local_storage_docs") }:{" "}
          </a>
          {isCommunityEdition && (
            <Alert variant="info">
              <AlertDescription>
                <p>
                  { i18n.t("pages.settings.providers.localFiles.alert_info_row_one") }
                </p>
                <p>
                  { i18n.t("pages.settings.providers.localFiles.alert_info_row_two") }
                </p>
              </AlertDescription>
            </Alert>
          )}
        </AlertDescription>
      </Alert>
    </>
  );
};

export const localFilesProvider: ProviderConfig = {
  name: "localfiles",
  title: "pages.settings.providers.localFiles.local_files",
  description: "pages.settings.providers.localFiles.local_files_desc",
  icon: () => (
    <IconFolderOpen
      width={40}
      height={40}
      style={{
        color: "var(--color-accent-canteloupe-base)",
        filter: "drop-shadow(0px 0px 12px var(--color-accent-canteloupe-base))",
      }}
    />
  ),
  fields: [
    {
      name: "serving_warning",
      type: "message",
      content: LocalFilesServingWarning,
    },
    {
      name: "path",
      type: "text",
      label: "pages.settings.providers.localFiles.absolute_path",
      required: true,
      placeholder: defaultPathExample || "/data/my-folder/subdirectory",
      schema: pathSchema,
      defaultValue: defaultPathExample,
      description: "pages.settings.providers.localFiles.absolute_path_desc",
    },
  ],
  layout: [{ fields: ["serving_warning"] }, { fields: ["path"] }],
};

export default localFilesProvider;
