import { inject, observer } from "mobx-react";
import { RadioGroup } from "../../Common/RadioGroup/RadioGroup";
import { IconGrid, IconList } from "@humansignal/icons";
import { Tooltip } from "@humansignal/ui";

import i18n from "../../../../../../apps/labelstudio/src/translations/i18n";

const viewInjector = inject(({ store }) => ({
  view: store.currentView,
}));

export const ViewToggle = viewInjector(
  observer(({ view, size, ...rest }) => {

    // t 应该从store取的，这边做简化

    return (
      <RadioGroup
        size={size}
        value={view.type}
        onChange={(e) => view.setType(e.target.value)}
        {...rest}
        style={{ "--button-padding": "0 var(--spacing-tighter)" }}
      >
        <Tooltip title={ i18n.t("datamanager.components.datamanager.list_view")}>
          <div>
            <RadioGroup.Button value="list" aria-label="Switch to list view">
              <IconList />
            </RadioGroup.Button>
          </div>
        </Tooltip>
        <Tooltip title={ i18n.t("datamanager.components.datamanager.grid_view") }>
          <div>
            <RadioGroup.Button value="grid" aria-label="Switch to grid view">
              <IconGrid />
            </RadioGroup.Button>
          </div>
        </Tooltip>
      </RadioGroup>
    );
  }),
);

export const DataStoreToggle = viewInjector(({ view, size, ...rest }) => {
  return (
    <RadioGroup value={view.target} size={size} onChange={(e) => view.setTarget(e.target.value)} {...rest}>
      <RadioGroup.Button value="tasks">{ i18n.t("datamanager.components.datamanager.tasks") }</RadioGroup.Button>
      <RadioGroup.Button value="annotations" disabled>
        { i18n.t("datamanager.components.datamanager.annotations") }
      </RadioGroup.Button>
    </RadioGroup>
  );
});
