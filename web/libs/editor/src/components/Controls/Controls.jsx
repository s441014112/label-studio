import { inject, observer } from "mobx-react";
import { CheckCircleOutlined, CheckOutlined } from "@ant-design/icons";

import Hint from "../Hint/Hint";
import { DraftPanel } from "../Annotations/Annotations";
import styles from "./Controls.module.scss";
import { Button, Tooltip } from "@humansignal/ui";
import { IconInfoOutline } from "@humansignal/icons";
import { cn } from "../../utils/bem";

import "../../../../../apps/labelstudio/src/translations/i18n";
import { useTranslation } from "react-i18next";

export default inject("store")(
  observer(({ item, store }) => {
    /**
     * Buttons of Controls
     */
    const buttons = {
      skip: "",
      update: "",
      submit: "",
    };

    const { userGenerate, sentUserGenerate, versions } = item;
    const { enableHotkeys, enableTooltips } = store.settings;

    const { t } = useTranslation();

    /**
     * Task information
     */
    let taskInformation;
    const taskInfoClassName = cn("task-info").toClassName();
    const skipButtonClassName = cn("skip-btn").toClassName();
    const submitButtonClassName = cn("submit-btn").toClassName();
    const updateButtonClassName = cn("update-btn").toClassName();

    if (store.task) {
      taskInformation = <h4 className={`${styles.task} ${taskInfoClassName}`}>{ t("editor.components.controls.task_id") }: {store.task.id}</h4>;
    }

    /**
     * Hotkeys
     */
    if (enableHotkeys && enableTooltips) {
      buttons.submit = <Hint> [ Ctrl+Enter ]</Hint>;
      buttons.skip = <Hint> [ Ctrl+Space ]</Hint>;
      buttons.update = <Hint> [ Alt+Enter] </Hint>;
    }

    let skipButton;
    let updateButton;
    let submitButton;
    let draftMenu;

    /**
     * Check for Predict Menu
     */
    // Manager roles that can force-skip unskippable tasks (OW=Owner, AD=Admin, MA=Manager)
    const MANAGER_ROLES = ["OW", "AD", "MA"];

    if (!store.annotationStore.predictSelect || store.explore) {
      const disabled = store.isSubmitting;
      const task = store.task;
      const isEnterprise = window.APP_SETTINGS?.billing?.enterprise;
      const skipDisabled = isEnterprise ? task?.allow_skip === false : false;
      const userRole = window.APP_SETTINGS?.user?.role;
      const hasForceSkipPermission = MANAGER_ROLES.includes(userRole);
      const canSkip = !skipDisabled || hasForceSkipPermission;
      const skipButtonDisabled = disabled || !canSkip;

      const skipTooltip = canSkip ? t("editor.components.controls.cancel_skip") : t("editor.components.controls.task_can_not_skip");

      const showInfoIcon = skipButtonDisabled && hasForceSkipPermission;

      if (store.hasInterface("skip")) {
        skipButton = (
          <>
            {showInfoIcon && (
              <Tooltip title={ t("editor.components.controls.task_not_skip") }>
                <IconInfoOutline width={20} height={20} className="text-neutral-content ml-auto cursor-pointer" />
              </Tooltip>
            )}
            <Button
              disabled={skipButtonDisabled}
              look="danger"
              onClick={canSkip ? store.skipTask : undefined}
              tooltip={skipTooltip}
              className={`${styles.skip} ${skipButtonClassName}`}
            >
              { t("editor.components.controls.skip") } {buttons.skip}
            </Button>
          </>
        );
      }

      if ((userGenerate && !sentUserGenerate) || (store.explore && !userGenerate && store.hasInterface("submit"))) {
        submitButton = (
          <Button
            disabled={disabled}
            look="primary"
            icon={<CheckOutlined />}
            onClick={store.submitAnnotation}
            tooltip={ t("editor.components.controls.save_result") }
            className={`${styles.submit} ${submitButtonClassName}`}
          >
            { t("editor.components.controls.submit") } {buttons.submit}
          </Button>
        );
      }

      if ((userGenerate && sentUserGenerate) || (!userGenerate && store.hasInterface("update"))) {
        updateButton = (
          <Button
            disabled={disabled}
            look="primary"
            icon={<CheckCircleOutlined />}
            onClick={store.updateAnnotation}
            tooltip={ t("editor.components.controls.update") }
            className={updateButtonClassName}
          >
            {sentUserGenerate || versions.result ? t("editor.components.controls.update") : t("editor.components.controls.submit")} {buttons.update}
          </Button>
        );
      }

      if (!store.hasInterface("annotations:menu")) {
        draftMenu = <DraftPanel item={item} />;
      }
    }

    const content = (
      <div className={styles.block}>
        <div className={styles.wrapper}>
          <div className={styles.container}>
            {skipButton}
            {updateButton}
            {submitButton}
            {draftMenu}
          </div>
          {taskInformation}
        </div>
      </div>
    );

    return (item.type === "annotation" || store.explore) && content;
  }),
);
