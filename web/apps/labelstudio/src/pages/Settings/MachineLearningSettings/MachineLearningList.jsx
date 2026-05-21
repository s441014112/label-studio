import { formatDistanceToNow, format, parseISO } from "date-fns";
import { useCallback, useContext } from "react";

import truncate from "truncate-middle";
import { Menu } from "../../../components";
import { Button, Dropdown } from "@humansignal/ui";
import { confirm } from "../../../components/Modal/Modal";
import { Oneof } from "../../../components/Oneof/Oneof";
import { IconEllipsis } from "@humansignal/icons";
import { Tooltip } from "@humansignal/ui";
import { ApiContext } from "../../../providers/ApiProvider";
import { cn } from "../../../utils/bem";

import "./MachineLearningList.scss";

import "../../../translations/i18n";
import { useTranslation } from "react-i18next";

export const MachineLearningList = ({ backends, fetchBackends, onEdit, onTestRequest, onStartTraining }) => {
  const api = useContext(ApiContext);

  const onDeleteModel = useCallback(
    async (backend) => {
      await api.callApi("deleteMLBackend", {
        params: {
          pk: backend.id,
        },
      });
      await fetchBackends();
    },
    [fetchBackends, api],
  );

  return (
    <div>
      {backends.map((backend) => (
        <BackendCard
          key={backend.id}
          backend={backend}
          onStartTrain={onStartTraining}
          onDelete={onDeleteModel}
          onEdit={onEdit}
          onTestRequest={onTestRequest}
        />
      ))}
    </div>
  );
};

const BackendCard = ({ backend, onStartTrain, onEdit, onDelete, onTestRequest }) => {

  const { t } = useTranslation();

  const confirmDelete = useCallback(
    (backend) => {
      confirm({
        title: t("pages.settings.machine_learning_setting.delete_backend"),
        body: t("pages.settings.machine_learning_setting.delete_backend_confirm"),
        buttonLook: "destructive",
        onOk() {
          onDelete?.(backend);
        },
      });
    },
    [backend, onDelete],
  );

  const rootClass = cn("backend-card");

  return (
    <div className={rootClass.toClassName()}>
      <div className={rootClass.elem("title-container")}>
        <div>
          <BackendState backend={backend} />
          <div className={rootClass.elem("title")}>{backend.title}</div>
        </div>

        <div className={rootClass.elem("menu")}>
          <Dropdown.Trigger
            align="right"
            content={
              <Menu size="medium" contextual>
                <Menu.Item onClick={() => onEdit(backend)}>{ t("pages.settings.machine_learning_setting.edit") }</Menu.Item>
                <Menu.Item onClick={() => onTestRequest(backend)}>{ t("pages.settings.machine_learning_setting.send_request") }</Menu.Item>
                <Menu.Item onClick={() => onStartTrain(backend)}>{ t("pages.settings.machine_learning_setting.start_training") }</Menu.Item>
                <Menu.Divider />
                <Menu.Item onClick={() => confirmDelete(backend)} isDangerous>
                  { t("pages.settings.machine_learning_setting.delete") }
                </Menu.Item>
              </Menu>
            }
          >
            <Button look="string" size="small" className="!p-0" aria-label={ t("pages.settings.machine_learning_setting.machine_learning_options") }>
              <IconEllipsis />
            </Button>
          </Dropdown.Trigger>
        </div>
      </div>

      <div className={rootClass.elem("meta")}>
        <div className={rootClass.elem("group")}>{truncate(backend.url, 20, 10, "...")}</div>
        <div className={rootClass.elem("group")}>
          <Tooltip title={format(parseISO(backend.created_at), "yyyy-MM-dd HH:mm:ss")}>
            <span>
              { t("pages.settings.machine_learning_setting.created") }&nbsp;
              {formatDistanceToNow(parseISO(backend.created_at), {
                addSuffix: true,
              })}
            </span>
          </Tooltip>
        </div>
      </div>
    </div>
  );
};

const BackendState = ({ backend }) => {
  const { state } = backend;
  const { t } = useTranslation();

  return (
    <div className={cn("ml").elem("status")}>
      <span className={cn("ml").elem("indicator").mod({ state })} />
      <Oneof value={state} className={cn("ml").elem("status-label")}>
        <span case="DI">{ t("pages.settings.machine_learning_setting.disconnect") }</span>
        <span case="CO">{ t("pages.settings.machine_learning_setting.connected") }</span>
        <span case="ER">{ t("pages.settings.machine_learning_setting.error") }</span>
        <span case="TR">{ t("pages.settings.machine_learning_setting.training") }</span>
        <span case="PR">{ t("pages.settings.machine_learning_setting.predicting") }</span>
      </Oneof>
    </div>
  );
};
