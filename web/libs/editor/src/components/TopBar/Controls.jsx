/**
 * @deprecated It was used only without FF_3873 in old interface.
 */

import { inject, observer } from "mobx-react";
import { IconBan, IconInfoOutline } from "@humansignal/icons";
import { Button, Tooltip } from "@humansignal/ui";
import { cn } from "../../utils/bem";
import { isDefined } from "../../utils/utilities";

import "./Controls.scss";
import { useCallback, useMemo, useState } from "react";

const TOOLTIP_DELAY = 0.8;

const ButtonTooltip = inject("store")(
  observer(({ store, title, children }) => {
    return (
      <Tooltip title={title} disabled={!store.settings.enableTooltips}>
        {children}
      </Tooltip>
    );
  }),
);

const controlsInjector = inject(({ store }) => {
  return {
    store,
    history: store?.annotationStore?.selected?.history,
  };
});

export const Controls = controlsInjector(
  observer(({ store, history, annotation }) => {
    const isReview = store.hasInterface("review");

    const historySelected = isDefined(store.annotationStore.selectedHistory);
    const { userGenerate, sentUserGenerate, versions, results, editable } = annotation;
    const buttons = [];

    const [isInProgress, setIsInProgress] = useState(false);

    // const isReady = store.annotationStore.selected.objects.every(object => object.isReady === undefined || object.isReady);
    const disabled = !editable || store.isSubmitting || historySelected || isInProgress; // || !isReady;
    const submitDisabled = store.hasInterface("annotations:deny-empty") && results.length === 0;

    const t = store.t;

    const buttonHandler = useCallback(
      async (e, callback, tooltipMessage) => {
        const { addedCommentThisSession, currentComment, commentFormSubmit, inputRef } = store.commentStore;

        if (isInProgress) return;
        setIsInProgress(true);
        if (!inputRef.current || addedCommentThisSession) {
          callback();
        } else if ((currentComment ?? "").trim()) {
          e.preventDefault();
          await commentFormSubmit();
          callback();
        } else {
          const commentsInput = inputRef.current;

          store.commentStore.setTooltipMessage(tooltipMessage);
          commentsInput.scrollIntoView({
            behavior: "smooth",
          });
          commentsInput.focus({ preventScroll: true });
        }
        setIsInProgress(false);
      },
      [
        store.rejectAnnotation,
        store.skipTask,
        store.commentStore.currentComment,
        store.commentStore.inputRef,
        store.commentStore.commentFormSubmit,
        store.commentStore.addedCommentThisSession,
        isInProgress,
      ],
    );

    const RejectButton = useMemo(() => {
      return (
        <ButtonTooltip key="reject" title="Reject annotation: [ Ctrl+Space ]">
          <Button
            aria-label={ t("editor.components.topbar.reject") }
            disabled={disabled}
            look="danger"
            onClick={async (e) => {
              if (store.hasInterface("comments:reject") ?? true) {
                buttonHandler(e, () => store.rejectAnnotation({}), t("editor.components.topbar.enter_comment_before_reject"));
              } else {
                console.log("rejecting");
                await store.commentStore.commentFormSubmit();
                store.rejectAnnotation({});
              }
            }}
          >
            { t("editor.components.topbar.reject") } 
          </Button>
        </ButtonTooltip>
      );
    }, [disabled, store]);

    if (isReview) {
      buttons.push(RejectButton);

      buttons.push(
        <ButtonTooltip key="accept" title={ t("editor.components.topbar.accept_annotation") }>
          <Button
            aria-label={ t("editor.components.topbar.accept_current_annotation") }
            disabled={disabled}
            look="primary"
            onClick={async () => {
              await store.commentStore.commentFormSubmit();
              store.acceptAnnotation();
            }}
          >
            {history.canUndo || annotation.versions.draft ? t("editor.components.topbar.fix_and_accept") : t("editor.components.topbar.accept") }
          </Button>
        </ButtonTooltip>,
      );
    } else if (annotation.skipped) {
      buttons.push(
        <div className={cn("controls").elem("skipped-info").toClassName()} key="skipped">
          <IconBan color="#d00" /> { t("editor.components.topbar.was_skipped") }
        </div>,
      );
      buttons.push(
        <ButtonTooltip key="cancel-skip" title={ t("editor.components.topbar.cancel_skip") }>
          <Button
            aria-label={ t("editor.components.topbar.cancel_skip_and_return") }
            disabled={disabled}
            look="outlined"
            onClick={async () => {
              await store.commentStore.commentFormSubmit();
              store.unskipTask();
            }}
          >
            { t("editor.components.topbar.cancel_skip") }
          </Button>
        </ButtonTooltip>,
      );
    } else {
      // Manager roles that can force-skip unskippable tasks (OW=Owner, AD=Admin, MA=Manager)
      const MANAGER_ROLES = ["OW", "AD", "MA"];

      if (store.hasInterface("skip")) {
        const task = store.task;

        const isEnterprise = window.APP_SETTINGS?.billing?.enterprise;
        const skipDisabled = isEnterprise ? task?.allow_skip === false : false;
        const userRole = window.APP_SETTINGS?.user?.role;
        const hasForceSkipPermission = MANAGER_ROLES.includes(userRole);
        const canSkip = !skipDisabled || hasForceSkipPermission;
        const isDisabled = disabled || !canSkip;

        const tooltip = canSkip ?  t("editor.components.topbar.cancel_skip_task") : t("editor.components.topbar.cannot_skip");

        const showInfoIcon = skipDisabled && hasForceSkipPermission;

        if (showInfoIcon) {
          buttons.push(
            <Tooltip key="skip-info" title={ t("editor.components.topbar.annotators_cannot_skip") }>
              <IconInfoOutline width={20} height={20} className="text-neutral-content ml-auto cursor-pointer" />
            </Tooltip>,
          );
        }

        buttons.push(
          <ButtonTooltip key="skip" title={tooltip}>
            <Button
              aria-label={t("editor.components.topbar.skip_current_task")}
              disabled={isDisabled}
              variant="negative"
              look="outlined"
              onClick={async (e) => {
                if (!canSkip) return;
                if (store.hasInterface("comments:skip") ?? true) {
                  buttonHandler(e, () => store.skipTask({}), t("editor.components.topbar.enter_comment_before_reject"));
                } else {
                  await store.commentStore.commentFormSubmit();
                  store.skipTask({});
                }
              }}
            >
              Skip
            </Button>
          </ButtonTooltip>,
        );
      }

      if ((userGenerate && !sentUserGenerate) || (store.explore && !userGenerate && store.hasInterface("submit"))) {
        const title = submitDisabled ? t("editor.components.topbar.empty_denied_in_project") : t("editor.components.topbar.save_results");
        // span is to display tooltip for disabled button

        buttons.push(
          <ButtonTooltip key="submit" title={title}>
            <div className={cn("controls").elem("tooltip-wrapper").toClassName()}>
              <Button
                aria-label={ t("editor.components.topbar.submit") }
                disabled={disabled || submitDisabled}
                look="primary"
                onClick={async () => {
                  await store.commentStore.commentFormSubmit();
                  store.submitAnnotation();
                }}
              >
                { t("editor.components.topbar.submit") }
              </Button>
            </div>
          </ButtonTooltip>,
        );
      }

      if ((userGenerate && sentUserGenerate) || (!userGenerate && store.hasInterface("update"))) {
        const isUpdate = sentUserGenerate || versions.result;
        const button = (
          <ButtonTooltip key="update" title={t("editor.components.topbar.update")}>
            <Button
              aria-label={t("editor.components.topbar.update")}
              disabled={disabled || submitDisabled}
              look="primary"
              onClick={async () => {
                await store.commentStore.commentFormSubmit();
                store.updateAnnotation();
              }}
            >
              {isUpdate ? t("editor.components.topbar.update") : t("editor.components.topbar.submit")}
            </Button>
          </ButtonTooltip>
        );

        buttons.push(button);
      }
    }

    return (
      <div className={cn("controls").toClassName()}>
        <div className="grid grid-flow-col auto-cols-fr gap-tight items-center">{buttons}</div>
      </div>
    );
  }),
);
