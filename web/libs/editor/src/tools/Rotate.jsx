import { observer } from "mobx-react";
import { types } from "mobx-state-tree";

import BaseTool from "./Base";
import ToolMixin from "../mixins/Tool";
import { Tool } from "../components/Toolbar/Tool";
import { IconRotateLeftTool, IconRotateRightTool } from "@humansignal/icons";

import i18n from "../../../../apps/labelstudio/src/translations/i18n";

const ToolView = observer(({ item }) => {

  return (
    <>
      <Tool
        active={item.selected}
        icon={<IconRotateLeftTool />}
        ariaLabel={ i18n.t("editor.tools.rotate_left") }
        label={ i18n.t("editor.tools.rotate_left") }
        shortcut="tool:rotate-left"
        onClick={() => {
          item.rotate(-90);
        }}
      />
      <Tool
        active={item.selected}
        icon={<IconRotateRightTool />}
        ariaLabel={ i18n.t("editor.tools.rotate_right") }
        label={ i18n.t("editor.tools.rotate_right") }
        shortcut="tool:rotate-right"
        onClick={() => {
          item.rotate(90);
        }}
      />
    </>
  );
});

const _Tool = types
  .model("RotateTool", {
    group: "control",
  })
  .views((self) => ({
    get viewClass() {
      return () => <ToolView item={self} />;
    },
  }))
  .actions((self) => ({
    rotate(degree) {
      self.obj.rotate(degree);
    },
  }));

const Rotate = types.compose(_Tool.name, ToolMixin, BaseTool, _Tool);

export { Rotate };
