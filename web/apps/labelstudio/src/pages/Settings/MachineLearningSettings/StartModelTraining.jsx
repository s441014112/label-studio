import { useCallback, useState } from "react";
import { Button } from "@humansignal/ui";
import { useAPI } from "../../../providers/ApiProvider";
import { Typography } from "@humansignal/ui";
import "../../../translations/i18n";
import { useTranslation } from "react-i18next";

export const StartModelTraining = ({ backend }) => {
  const api = useAPI();
  const [response, setResponse] = useState(null);

  const { t } = useTranslation();

  const onStartTraining = useCallback(
    async (backend) => {
      const res = await api.callApi("trainMLBackend", {
        params: {
          pk: backend.id,
        },
      });

      setResponse(res.response || {});
    },
    [api],
  );

  return (
    <div className="max-w-[680px]">
      <Typography size="small" className="text-neutral-content-subtler">
        { t("pages.settings.machine_learning_setting.training_process_tip") }
      </Typography>
      <Typography size="small" className="text-neutral-content-subtler mt-base mb-wide">
        { t("pages.settings.machine_learning_setting.training_process_note") }
      </Typography>

      {!response && (
        <Button
          onClick={() => {
            onStartTraining(backend);
          }}
        >
          { t("pages.settings.machine_learning_setting.start_training") }
        </Button>
      )}

      {!!response && (
        <>
          <pre>{ t("pages.settings.machine_learning_setting.request_sent") }</pre>
          <pre>{ t("pages.settings.machine_learning_setting.response") }: {JSON.stringify(response, null, 2)}</pre>
        </>
      )}
    </div>
  );
};
