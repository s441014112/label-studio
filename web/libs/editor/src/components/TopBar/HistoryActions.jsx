import { observer } from "mobx-react";
import { IconRedo, IconRemove, IconUndo } from "@humansignal/icons";
import { Button } from "@humansignal/ui";
import { cn } from "../../utils/bem";
import "./HistoryActions.scss";

export const EditingHistory = observer(({ entity, store }) => {
  const { history } = entity;

  const t = store.t;

  return (
    <div className={cn("history-buttons").toClassName()}>
      <Button
        variant="neutral"
        look="string"
        aria-label={ t("editor.components.topbar.undo") }
        className="!p-0"
        tooltip={ t("editor.components.topbar.undo") }
        disabled={!history?.canUndo}
        onClick={() => entity.undo()}
      >
        <IconUndo />
      </Button>
      <Button
        variant="neutral"
        look="string"
        aria-label={ t("editor.components.topbar.redo") }
        className="!p-0"
        tooltip={ t("editor.components.topbar.redo") }
        disabled={!history?.canRedo}
        onClick={() => entity.redo()}
        leading={<IconRedo />}
      />
      <Button
        look="string"
        variant="negative"
        aria-label={ t("editor.components.topbar.reset") }
        tooltip={ t("editor.components.topbar.reset") }
        className="!p-0"
        disabled={!history?.canUndo}
        onClick={() => history?.reset()}
        leading={<IconRemove />}
      />
    </div>
  );
});
