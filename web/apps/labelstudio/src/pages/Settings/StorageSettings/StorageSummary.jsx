import { format } from "date-fns/esm";
import { Button, CodeBlock, IconFileCopy, Space, Tooltip } from "@humansignal/ui";
import { DescriptionList } from "../../../components/DescriptionList/DescriptionList";
import { modal } from "../../../components/Modal/Modal";
import { Oneof } from "../../../components/Oneof/Oneof";
import { getLastTraceback } from "../../../utils/helpers";
import { useCopyText } from "@humansignal/core";
import "../../../translations/i18n";
import { useTranslation } from "react-i18next";

// Component to handle copy functionality within the modal
const CopyButton = ({ msg }) => {
  const [copyText, copied] = useCopyText({ defaultText: msg });
  const { t } = useTranslation();

  return (
    <Button variant="neutral" icon={<IconFileCopy />} onClick={() => copyText()} disabled={copied} className="w-[7rem]">
      {copied ? t("pages.settings.storage_setting.copied") : t("pages.settings.storage_setting.copy") }
    </Button>
  );
};

export const StorageSummary = ({ target, storage, className, storageTypes = [] }) => {
  const storageStatus = storage.status.replace(/_/g, " ").replace(/(^\w)/, (match) => match.toUpperCase());
  const last_sync_count = storage.last_sync_count ? storage.last_sync_count : 0;

  const tasks_existed =
    typeof storage.meta?.tasks_existed !== "undefined" && storage.meta?.tasks_existed !== null
      ? storage.meta.tasks_existed
      : 0;
  const total_annotations =
    typeof storage.meta?.total_annotations !== "undefined" && storage.meta?.total_annotations !== null
      ? storage.meta.total_annotations
      : 0;
  
  const t = useTranslation();

  // help text for tasks and annotations
  const tasks_added_help = t("pages.settings.storage_setting.new_tasks_added", { count: last_sync_count });
  const tasks_total_help = [
    t("pages.settings.storage_setting.tasks_synced", { count: tasks_existed }),
    t("pages.settings.storage_setting.tasks_added_in_total", { count: tasks_existed + last_sync_count }),
  ].join("\n");
  const annotations_help = t("pages.settings.storage_setting.annotations_saved", { count: last_sync_count });
  const total_annotations_help =
    typeof storage.meta?.total_annotations !== "undefined"
      ? t("pages.settings.storage_setting.annotations_saved", { count: storage.meta.total_annotations })
      : "";

  const handleButtonClick = () => {
    const msg = t("pages.settings.storage_setting.errors_logs_for", { type: storage.type });

    const currentModal = modal({
      title: t("pages.settings.storage_setting.storage_sync_error_log"),
      body: <CodeBlock code={msg} variant="negative" className="max-h-[50vh] overflow-y-auto" />,
      footer: (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          {!window.APP_SETTINGS?.whitelabel_is_active && (
            <div>
              <>
                <a
                  href="https://labelstud.io/guide/storage.html#Troubleshooting"
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label={ t("pages.settings.storage_setting.see_docs") }
                >
                  { t("pages.settings.storage_setting.see_docs") }
                </a>
              </>
            </div>
          )}
          <Space>
            <CopyButton msg={msg} />
            <Button variant="primary" className="w-[7rem]" onClick={() => currentModal.close()}>
              { t("pages.settings.storage_setting.close") }
            </Button>
          </Space>
        </div>
      ),
      style: { width: "700px" },
      optimize: false,
      allowClose: true,
    });
  };

  return (
    <div className={className}>
      <DescriptionList>
        <DescriptionList.Item term={ t("pages.settings.storage_setting.type") }>
          {(storageTypes ?? []).find((s) => s.name === storage.type)?.title ?? storage.type}
        </DescriptionList.Item>

        <Oneof value={storage.type}>
          <SummaryS3 case={["s3", "s3s"]} storage={storage} />
          <GSCStorage case="gcs" storage={storage} />
          <AzureStorage case="azure" storage={storage} />
          <RedisStorage case="redis" storage={storage} />
          <LocalStorage case="localfiles" storage={storage} />
        </Oneof>

        <DescriptionList.Item
          term={ t("pages.settings.storage_setting.status") }
        >
          {storageStatus === "Failed" || storageStatus === "Completed with errors" ? (
            <span
              className="cursor-pointer border-b border-dashed border-negative-border-subtle text-negative-content"
              onClick={handleButtonClick}
            >
              {storageStatus} ({ t("pages.settings.storage_setting.view_logs") })
            </span>
          ) : (
            storageStatus
          )}
        </DescriptionList.Item>

        {target === "export" ? (
          <DescriptionList.Item term={ t("pages.settings.storage_setting.annotations") } help={`${annotations_help}\n${total_annotations_help}`}>
            <Tooltip title={annotations_help}>
              <span>{last_sync_count}</span>
            </Tooltip>
            <Tooltip title={total_annotations_help}>
              <span> ({total_annotations} { t("pages.settings.storage_setting.total") })</span>
            </Tooltip>
          </DescriptionList.Item>
        ) : (
          <DescriptionList.Item term={ t("pages.settings.storage_setting.tasks") } help={`${tasks_added_help}\n${tasks_total_help}`}>
            <Tooltip title={`${tasks_added_help}\n${tasks_total_help}`} style={{ whiteSpace: "pre-wrap" }}>
              <span>{last_sync_count + tasks_existed}</span>
            </Tooltip>
            <Tooltip title={tasks_added_help}>
              <span> ({last_sync_count})</span>
            </Tooltip>
          </DescriptionList.Item>
        )}

        <DescriptionList.Item term={ t("pages.settings.storage_setting.last_sync") }>
          {storage.last_sync ? format(new Date(storage.last_sync), "MMMM dd, yyyy ∙ HH:mm:ss") : t("pages.settings.storage_setting.not_synced_yet")}
        </DescriptionList.Item>
      </DescriptionList>
    </div>
  );
};

const SummaryS3 = ({ storage }) => {
  let t = useTranslation();
  return <DescriptionList.Item term={ t("pages.settings.storage_setting.bucket") }>{storage.bucket}</DescriptionList.Item>;
};

const GSCStorage = ({ storage }) => {
  let t = useTranslation();
  return <DescriptionList.Item term={ t("pages.settings.storage_setting.bucket") }>{storage.bucket}</DescriptionList.Item>;
};

const AzureStorage = ({ storage }) => {
  let t = useTranslation();
  return <DescriptionList.Item term={ t("pages.settings.storage_setting.container") }>{storage.container}</DescriptionList.Item>;
};

const RedisStorage = ({ storage }) => {
  let t = useTranslation();
  
  return (
    <>
      <DescriptionList.Item term={ t("pages.settings.storage_setting.path") }>{storage.path}</DescriptionList.Item>
      <DescriptionList.Item term={ t("pages.settings.storage_setting.path") }>
        {storage.host}
        {storage.port ? `:${storage.port}` : ""}
      </DescriptionList.Item>
    </>
  );
};

const LocalStorage = ({ storage }) => {
  let t = useTranslation();
  return <DescriptionList.Item term={ t("pages.settings.storage_setting.path") }>{storage.path}</DescriptionList.Item>;
};
