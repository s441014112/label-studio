import { Button } from "@humansignal/ui";
import { observer } from "mobx-react";
import { type FC, useCallback } from "react";
import { cn } from "../../../utils/bem";
import "./RelationsControls.scss";
import { IconOutlinerEyeClosed, IconOutlinerEyeOpened, IconSortDown, IconSortUp } from "@humansignal/icons";

import "../../../../../../apps/labelstudio/src/translations/i18n";
import { useTranslation } from "react-i18next"; 

const RelationsControlsComponent: FC<any> = ({ relationStore }) => {
  return (
    <div className={cn("relation-controls").toClassName()}>
      <ToggleRelationsVisibilityButton relationStore={relationStore} />
      <ToggleRelationsOrderButton relationStore={relationStore} />
    </div>
  );
};

interface ToggleRelationsVisibilityButtonProps {
  relationStore: any;
}

const ToggleRelationsVisibilityButton = observer<FC<ToggleRelationsVisibilityButtonProps>>(({ relationStore }) => {
  const toggleRelationsVisibility = useCallback(
    (e: any) => {
      e.preventDefault();
      e.stopPropagation();
      relationStore.toggleAllVisibility();
    },
    [relationStore],
  );

  const isDisabled = !relationStore?.relations?.length;
  const isAllHidden = !(!isDisabled && relationStore.isAllHidden);

  const { t } = useTranslation();

  // This comes from an Elem tag that was set without a name. The CSS was fixed to make it work,
  // but this is clearly bad CSS usage.
  return (
    <Button
      className={cn("relation-controls").mod({ hidden: isAllHidden }).toClassName()}
      variant="neutral"
      look="string"
      size="small"
      disabled={isDisabled}
      onClick={toggleRelationsVisibility}
      aria-label={isAllHidden ? t("editor.components.sidepanels.show_all") : t("editor.components.sidepanels.hide_all")}
      icon={
        isAllHidden ? (
          <IconOutlinerEyeClosed width={16} height={16} />
        ) : (
          <IconOutlinerEyeOpened width={16} height={16} />
        )
      }
      tooltip={isAllHidden ? t("editor.components.sidepanels.show_all") : t("editor.components.sidepanels.hide_all")}
      tooltipTheme="dark"
    />
  );
});

interface ToggleRelationsOrderButtonProps {
  relationStore: any;
}

const ToggleRelationsOrderButton = observer<FC<ToggleRelationsOrderButtonProps>>(({ relationStore }) => {
  const toggleRelationsOrder = useCallback(
    (e: any) => {
      e.preventDefault();
      e.stopPropagation();
      relationStore.toggleOrder();
    },
    [relationStore],
  );

  const isDisabled = !relationStore?.relations?.length;
  const isAsc = relationStore.order === "asc";

  const { t } = useTranslation();

  // This comes from an Elem tag that was set without a name. The CSS was fixed to make it work,
  // but this is clearly bad CSS usage.
  return (
    <Button
      className={cn("relation-controls").mod({ order: relationStore.order }).toClassName()}
      variant="neutral"
      look="string"
      size="small"
      onClick={toggleRelationsOrder}
      disabled={isDisabled}
      aria-label={isAsc ? t("editor.components.sidepanels.order_by_oldest") : t("editor.components.sidepanels.order_by_newest")}
      icon={isAsc ? <IconSortUp /> : <IconSortDown />}
      tooltip={isAsc ? t("editor.components.sidepanels.order_by_oldest") : t("editor.components.sidepanels.order_by_newest")}
      tooltipTheme="dark"
    />
  );
});

export const RelationsControls = observer(RelationsControlsComponent);
