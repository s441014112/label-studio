import { observer } from "mobx-react";
import { Button, Tooltip } from "@humansignal/ui";
import Utils from "../../utils";
import { cn } from "../../utils/bem";

import "./DraftPanel.scss";

import i18n from "../../../../../apps/labelstudio/src/translations/i18n";

const panel = cn("draft-panel");

export const DraftPanel = observer(({ item }) => {
  if (!item.draftSaved && !item.versions.draft) return null;
  const saved = item.draft && item.draftSaved ? ` saved ${Utils.UDate.prettyDate(item.draftSaved)}` : "";

  if (!item.selected) {
    if (!item.draft) return null;
    return <div className={panel}>draft{saved}</div>;
  }
  if (!item.versions.result || !item.versions.result.length) {
    return <div className={panel}>{saved ? `draft${saved}` : "not submitted draft"}</div>;
  }
  return (
    <div className={panel}>
      <Tooltip
        alignment="top-left"
        title={item.draftSelected ? i18n.t("editor.components.draftPanel.switch_to_original") : i18n.t("editor.components.draftPanel.switch_to_draft")}
      >
        <Button
          type="button"
          size="smaller"
          look="string"
          onClick={() => item.toggleDraft()}
          className={panel.elem("toggle")}
          aria-label="Toggle draft mode"
        >
          {item.draftSelected ? i18n.t("editor.components.draftPanel.draft") : i18n.t("editor.components.draftPanel.original")}
        </Button>
      </Tooltip>
      {saved}
    </div>
  );
});
