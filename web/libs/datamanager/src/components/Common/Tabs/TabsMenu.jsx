import { useMemo } from "react";
import { Menu } from "../Menu/Menu";

import "../../../../../../apps/labelstudio/src/translations/i18n";
import { useTranslation } from "react-i18next";

export const TabsMenu = ({ onClick, editable = true, closable = true, clonable = true, virtual = false }) => {
  
  const { t } = useTranslation();

  const items = useMemo(
    () => [
      {
        key: "edit",
        title: t("datamanager.components.common.rename"),
        enabled: editable && !virtual,
        action: () => onClick("edit"),
      },
      {
        key: "duplicate",
        title: t("datamanager.components.common.duplicate"),
        enabled: !virtual && clonable,
        action: () => onClick("duplicate"),
        willLeave: true,
      },
      {
        key: "save",
        title: t("datamanager.components.common.save"),
        enabled: virtual,
        action: () => onClick("save"),
        willLeave: true,
      },
    ],
    [editable, closable, clonable, virtual],
  );

  const showDivider = useMemo(() => closable && items.some(({ enabled }) => enabled), [items]);

  return (
    <Menu size="medium" onClick={(e) => e.domEvent.stopPropagation()}>
      {items.map((item) =>
        item.enabled ? (
          <Menu.Item key={item.key} onClick={item.action} data-leave={item.willLeave}>
            {item.title}
          </Menu.Item>
        ) : null,
      )}

      {closable ? (
        <>
          {showDivider && <Menu.Divider />}
          <Menu.Item onClick={() => onClick("close")} data-leave>
            { t("datamanager.components.common.close") }
          </Menu.Item>
        </>
      ) : null}
    </Menu>
  );
};
