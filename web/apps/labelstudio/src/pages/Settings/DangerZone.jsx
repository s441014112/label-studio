import { useMemo, useState } from "react";
import { useHistory } from "react-router";
import { Button, Typography, useToast } from "@humansignal/ui";
import { useUpdatePageTitle, createTitleFromSegments } from "@humansignal/core";
import { Label } from "../../components/Form";
import { modal } from "../../components/Modal/Modal";
import { useModalControls } from "../../components/Modal/ModalPopup";
import Input from "../../components/Form/Elements/Input/Input";
import { Space } from "../../components/Space/Space";
import { Spinner } from "../../components/Spinner/Spinner";
import { useAPI } from "../../providers/ApiProvider";
import { useProject } from "../../providers/ProjectProvider";
import { cn } from "../../utils/bem";
import "../../translations/i18n"
import { useTranslation } from "react-i18next";

export const DangerZone = () => {
  const { project } = useProject();
  const api = useAPI();
  const history = useHistory();
  const toast = useToast();
  const [processing, setProcessing] = useState(null);
  const { t } = useTranslation();

  useUpdatePageTitle(createTitleFromSegments([project?.title, t("pages.settings.dangerZone.title")]));

  const showDangerConfirmation = ({ title, message, requiredWord, buttonText, onConfirm }) => {
    const isDev = process.env.NODE_ENV === "development";

    return modal({
      title,
      width: 600,
      allowClose: false,
      body: () => {
        const ctrl = useModalControls();
        const inputValue = ctrl?.state?.inputValue || "";

        return (
          <div>
            <Typography variant="body" size="medium" className="mb-tight">
              {message}
            </Typography>
            <Input
              label={ t("pages.settings.dangerZone.type_required_below", { requiredWord })}
              value={inputValue}
              onChange={(e) => ctrl?.setState({ inputValue: e.target.value })}
              autoFocus
              data-testid="danger-zone-confirmation-input"
              autoComplete="off"
            />
          </div>
        );
      },
      footer: () => {
        const ctrl = useModalControls();
        const inputValue = (ctrl?.state?.inputValue || "").trim().toLowerCase();
        const isValid = isDev || inputValue === requiredWord.toLowerCase();

        let { t } = useTranslation();

        return (
          <Space align="end">
            <Button
              variant="neutral"
              look="outline"
              onClick={() => ctrl?.hide()}
              data-testid="danger-zone-cancel-button"
            >
              { t("pages.settings.dangerZone.cancel") }
            </Button>
            <Button
              variant="negative"
              disabled={!isValid}
              onClick={async () => {
                await onConfirm();
                ctrl?.hide();
              }}
              data-testid="danger-zone-confirm-button"
            >
              {buttonText}
            </Button>
          </Space>
        );
      },
    });
  };

  const handleOnClick = (type) => () => {

    const actionConfig = {
      reset_cache: {
        title: t("pages.settings.dangerZone.reset_cache"),
        message: (
          <>
            { t("pages.settings.dangerZone.reset_cache_tip") }<strong>{project.title}</strong>. { t("pages.settings.dangerZone.action_cannot_undone") }
          </>
        ),
        requiredWord: "cache",
        buttonText: t("pages.settings.dangerZone.reset_cache"),
      },
      tabs: {
        title: t("pages.settings.dangerZone.drop_tabs"),
        message: (
          <>
            { t("pages.settings.dangerZone.drop_tabs_tip") }<strong>{project.title}</strong>. { t("pages.settings.dangerZone.action_cannot_undone") }
          </>
        ),
        requiredWord: "tabs",
        buttonText: t("pages.settings.dangerZone.drop_tabs"),
      },
      project: {
        title: t("pages.settings.dangerZone.delete_project"),
        message: (
          <>
            { t("pages.settings.dangerZone.delete_project_tip") }<strong>{project.title}</strong>. { t("pages.settings.dangerZone.action_cannot_undone") }
          </>
        ),
        requiredWord: "delete",
        buttonText: t("pages.settings.dangerZone.delete_project"),
      },
    };

    const config = actionConfig[type];

    if (!config) {
      return;
    }

    showDangerConfirmation({
      ...config,
      onConfirm: async () => {
        setProcessing(type);
        try {
          if (type === "reset_cache") {
            await api.callApi("projectResetCache", {
              params: {
                pk: project.id,
              },
            });
            toast.show({ message: t("pages.settings.dangerZone.reset_cache_success") });
          } else if (type === "tabs") {
            await api.callApi("deleteTabs", {
              body: {
                project: project.id,
              },
            });
            toast.show({ message: t("pages.settings.dangerZone.drop_tabs_success") });
          } else if (type === "project") {
            await api.callApi("deleteProject", {
              params: {
                pk: project.id,
              },
            });
            toast.show({ message: t("pages.settings.dangerZone.delete_project_success") });
            history.replace("/projects");
          }
        } catch (error) {
          toast.show({ message: `Error: ${error.message}`, type: "error" });
        } finally {
          setProcessing(null);  
        }
      },
    });
  };

  const buttons = useMemo(
    () => [
      // {
      //   type: "annotations",
      //   disabled: true, //&& !project.total_annotations_number,
      //   label: `Delete ${project.total_annotations_number} Annotations`,
      // },
      // {
      //   type: "tasks",
      //   disabled: true, //&& !project.task_number,
      //   label: `Delete ${project.task_number} Tasks`,
      // },
      // {
      //   type: "predictions",
      //   disabled: true, //&& !project.total_predictions_number,
      //   label: `Delete ${project.total_predictions_number} Predictions`,
      // },
      {
        type: "reset_cache",
        help:
          "pages.settings.dangerZone.reset_cache_help_first",
        label: "pages.settings.dangerZone.reset_cache",
      },
      {
        type: "tabs",
        help: "pages.settings.dangerZone.drop_tabs_help",
        label: "pages.settings.dangerZone.drop_tabs",
      },
      {
        type: "project",
        help: "pages.settings.dangerZone.delete_project_help",
        label: "pages.settings.dangerZone.delete_project",
      },
    ],
    [project],
  );

  return (
    <div className={cn("simple-settings")}>
      <Typography variant="headline" size="medium" className="mb-tighter">
        { t("pages.settings.dangerZone.title") }
      </Typography>
      <Typography variant="body" size="medium" className="text-neutral-content-subtler !mb-base">
        { t("pages.settings.dangerZone.title_risk_tip") }
      </Typography>

      {project.id ? (
        <div style={{ marginTop: 16 }}>
          {buttons.map((btn) => {
            const waiting = processing === btn.type;
            const disabled = btn.disabled || (processing && !waiting);

            return (
              btn.disabled !== true && (
                <div className={cn("settings-wrapper")} key={btn.type}>
                  <Typography variant="title" size="large">
                    { t(`${btn.label}`)}
                  </Typography>
                  {btn.help && <Label description={ t(`${btn.help}`)} style={{ width: 600, display: "block" }} />}
                  <Button
                    key={btn.type}
                    variant="negative"
                    look="outlined"
                    disabled={disabled}
                    waiting={waiting}
                    onClick={handleOnClick(btn.type)}
                    style={{ marginTop: 16 }}
                  >
                    { t(`${btn.label}`)}
                  </Button>
                </div>
              )
            );
          })}
        </div>
      ) : (
        <div style={{ display: "flex", justifyContent: "center", marginTop: 32 }}>
          <Spinner size={32} />
        </div>
      )}
    </div>
  );
};

DangerZone.title = "sideMenu.dangerZone";
DangerZone.path = "/danger-zone";
