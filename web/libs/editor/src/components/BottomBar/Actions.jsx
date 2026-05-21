import { IconInfoOutline, IconSettings } from "@humansignal/icons";
import { Button } from "@humansignal/ui";
import { isStarterCloudPlan } from "@humansignal/core";
import { cn } from "../../utils/bem";
import { FF_BULK_ANNOTATION, isFF } from "../../utils/feature-flags";
import { AutoAcceptToggle } from "../AnnotationTab/AutoAcceptToggle";
import { DynamicPreannotationsToggle } from "../AnnotationTab/DynamicPreannotationsToggle";
import { GroundTruth } from "../CurrentEntity/GroundTruth";
import { EditingHistory } from "./HistoryActions";
import "./Actions.scss";

export const Actions = ({ store }) => {
  const annotationStore = store.annotationStore;
  const entity = annotationStore.selected;
  const isPrediction = entity?.type === "prediction";
  const isViewAll = annotationStore.viewingAll === true;
  const isBulkMode = isFF(FF_BULK_ANNOTATION) && !isStarterCloudPlan() && store.hasInterface("annotation:bulk");

  const t = store.t;

  return (
    <div className={cn("bottombar").elem("section").toClassName()}>
      {!isPrediction && !isViewAll && store.hasInterface("edit-history") && <EditingHistory entity={entity} t={t} />}

      <div className={cn("action-buttons").toClassName()}>
        {store.description && store.hasInterface("instruction") && (
          <Button
            type="text"
            aria-label="Instructions"
            size="small"
            variant="neutral"
            look="string"
            tooltip={ t("editor.components.bottomBar.show_instructions") }
            onClick={() => store.toggleDescription()}
            className="aspect-square"
            leading={<IconInfoOutline />}
            data-testid="bottombar-instructions-button"
          />
        )}
        <Button
          type="text"
          aria-label="Settings"
          size="small"
          look="string"
          variant="neutral"
          onClick={() => store.toggleSettings()}
          tooltip={ t("editor.components.bottomBar.settings") }
          className="aspect-square"
          leading={<IconSettings />}
          data-testid="bottombar-settings-button"
        />
      </div>

      {store.hasInterface("ground-truth") && !isBulkMode && <GroundTruth entity={entity} t={t} />}

      {!isViewAll && (
        <div className={cn("model-actions").toClassName()}>
          <DynamicPreannotationsToggle />
          <AutoAcceptToggle />
        </div>
      )}
    </div>
  );
};
