import React, { useMemo } from "react";
import { Modal, Table, Tabs } from "antd";
import { observer } from "mobx-react";

import { Hotkey } from "../../core/Hotkey";

import "./Settings.scss";
import { cn } from "../../utils/bem";
import { triggerResizeEvent } from "../../utils/utilities";

import EditorSettings from "../../core/settings/editorsettings";
import * as TagSettings from "./TagSettings";
import { IconClose } from "@humansignal/icons";
import { Checkbox, Toggle } from "@humansignal/ui";
import { FF_DEV_3873, isFF } from "../../utils/feature-flags";
import { ff } from "@humansignal/core";

import i18n from "../../../../../apps/labelstudio/src/translations/i18n";
import { useTranslation } from "react-i18next";

const HotkeysDescription = () => {

  const { t } = useTranslation();

  const columns = [
    { title: t("editor.components.settings.shortcut"), dataIndex: "combo", key: "combo" },
    { title: t("editor.components.settings.description"), dataIndex: "descr", key: "descr" },
  ];

  const keyNamespaces = Hotkey.namespaces();

  const getData = (descr) => {
    const data = Object.keys(descr)
      .filter((k) => descr[k])
      .map((k) => ({
        key: k,
        combo: k.split(",").map((keyGroup) => {
          return (
            <div className={cn("keys").elem("key-group").toClassName()} key={keyGroup}>
              {keyGroup
                .trim()
                .split("+")
                .map((k) => (
                  <kbd className={cn("keys").elem("key").toClassName()} key={k}>
                    {k}
                  </kbd>
                ))}
            </div>
          );
        }),
        descr: t(descr[k]),
      }));

    return data;
  }

  return (
    <div className={cn("keys").toClassName()}>
      <Tabs size="small">
        {Object.entries(keyNamespaces).map(([ns, data]) => {
          if (Object.keys(data.descriptions).length === 0) {
            return null;
          }
          return (
            <Tabs.TabPane key={ns} tab={data.description ?? ns}>
              <Table columns={columns} dataSource={getData(data.descriptions)} size="small" />
            </Tabs.TabPane>
          );
        })}
      </Tabs>
    </div>
  );
};

const newUI = isFF(FF_DEV_3873) ? { newUI: true } : {};

const editorSettingsKeys = Object.keys(EditorSettings).filter((key) => {
  const flag = EditorSettings[key].flag;
  return flag ? ff.isActive(flag) : true;
});

if (isFF(FF_DEV_3873)) {
  const enableTooltipsIndex = editorSettingsKeys.findIndex((key) => key === "enableTooltips");
  const enableLabelTooltipsIndex = editorSettingsKeys.findIndex((key) => key === "enableLabelTooltips");

  // swap these in the array
  const tmp = editorSettingsKeys[enableTooltipsIndex];

  editorSettingsKeys[enableTooltipsIndex] = editorSettingsKeys[enableLabelTooltipsIndex];
  editorSettingsKeys[enableLabelTooltipsIndex] = tmp;
}

const SettingsTag = ({ children }) => {
  return <div className={cn("settings-tag").toClassName()}>{children}</div>;
};

const GeneralSettings = observer(({ store }) => {
  return (
    <div className={cn("settings").mod(newUI).toClassName()}>
      {editorSettingsKeys.map((obj, index) => {
        return (
          <label className={cn("settings").elem("field").toClassName()} key={index}>
            {isFF(FF_DEV_3873) ? (
              <>
                <div className={cn("settings__label").toClassName()}>
                  <div className={cn("settings__label").elem("title").toClassName()}>
                    { i18n.t(EditorSettings[obj].newUI.title) }
                    {EditorSettings[obj].newUI.tags?.split(",").map((tag) => (
                      <SettingsTag key={tag}>{ i18n.t(tag) }</SettingsTag>
                    ))}
                  </div>
                  <div className={cn("settings__label").elem("description").toClassName()}>
                    { i18n.t(EditorSettings[obj].newUI.description) }
                  </div>
                </div>
                <Toggle
                  key={index}
                  checked={store.settings[obj]}
                  onChange={store.settings[EditorSettings[obj].onChangeEvent]}
                  description={ i18n.t(EditorSettings[obj].description) }
                />
              </>
            ) : (
              <>
                <Checkbox
                  key={index}
                  checked={store.settings[obj]}
                  onChange={store.settings[EditorSettings[obj].onChangeEvent]}
                >
                  {i18n.t(EditorSettings[obj].description)}
                </Checkbox>
                <br />
              </>
            )}
          </label>
        );
      })}
    </div>
  );
});

const LayoutSettings = observer(({ store }) => {

  const t = store?.t;

  return (
    <div className={cn("settings").mod(newUI).toClassName()}>
      <div className={cn("settings").elem("field").toClassName()}>
        <Checkbox
          checked={store.settings.bottomSidePanel}
          onChange={() => {
            store.settings.toggleBottomSP();
            setTimeout(triggerResizeEvent);
          }}
        >
          { t("editor.components.settings.move_panel_to_bottom") }
        </Checkbox>
      </div>

      <div className={cn("settings").elem("field").toClassName()}>
        <Checkbox checked={store.settings.displayLabelsByDefault} onChange={store.settings.toggleSidepanelModel}>
          { t("editor.components.settings.display_labels_by_default") }
        </Checkbox>
      </div>

      <div className={cn("settings").elem("field").toClassName()}>
        <Checkbox
          value="Show Annotations panel"
          defaultChecked={store.settings.showAnnotationsPanel}
          onChange={() => {
            store.settings.toggleAnnotationsPanel();
          }}
        >
          { t("editor.components.settings.show_annotation_panel") }
        </Checkbox>
      </div>

      <div className={cn("settings").elem("field").toClassName()}>
        <Checkbox
          value="Show Predictions panel"
          defaultChecked={store.settings.showPredictionsPanel}
          onChange={() => {
            store.settings.togglePredictionsPanel();
          }}
        >
          { t("editor.components.settings.show_predictions_panel") }
        </Checkbox>
      </div>

      {/* Saved for future use */}
      {/* <div className={cn("settings").elem("field").toClassName()}>
        <Checkbox
          value="Show image in fullsize"
          defaultChecked={store.settings.imageFullSize}
          onChange={() => {
            store.settings.toggleImageFS();
          }}
        >
          Show image in fullsize
        </Checkbox>
      </div> */}
    </div>
  );
});

const Settings = {
  General: { name: i18n.t("editor.components.settings.general"), component: GeneralSettings },
  Hotkeys: { name: i18n.t("editor.components.settings.hotkeys"), component: HotkeysDescription },
};

if (!isFF(FF_DEV_3873)) {
  Settings.Layout = { name: "Layout", component: LayoutSettings };
}

const DEFAULT_ACTIVE = Object.keys(Settings)[0];

const DEFAULT_MODAL_SETTINGS = isFF(FF_DEV_3873)
  ? {
      name: "settings-modal",
      title: i18n.t("editor.components.settings.labeling_interface_settings"),
      closeIcon: <IconClose />,
    }
  : {
      name: "settings-modal-old",
      title: i18n.t("editor.components.settings.settings"),
      bodyStyle: { paddingTop: "0" },
    };

export default observer(({ store }) => {
  const availableSettings = useMemo(() => {
    const availableTags = Object.values(store.annotationStore.names.toJSON());
    const settingsScreens = Object.values(TagSettings);

    return availableTags.reduce((res, tagName) => {
      const tagType = store.annotationStore.names.get(tagName).type;
      const settings = settingsScreens.find(({ tagName }) => tagName.toLowerCase() === tagType.toLowerCase());

      if (settings) res.push(settings);

      return res;
    }, []);
  }, []);

  return (
    <Modal
      className={cn(DEFAULT_MODAL_SETTINGS.name).toClassName()}
      open={store.showingSettings}
      onCancel={store.toggleSettings}
      footer=""
      title={DEFAULT_MODAL_SETTINGS.title}
      closeIcon={DEFAULT_MODAL_SETTINGS.closeIcon}
      bodyStyle={DEFAULT_MODAL_SETTINGS.bodyStyle}
    >
      <Tabs defaultActiveKey={DEFAULT_ACTIVE}>
        {Object.entries(Settings).map(([key, { name, component }]) => (
          <Tabs.TabPane tab={name} key={key}>
            {React.createElement(component, { store })}
          </Tabs.TabPane>
        ))}
        {availableSettings.map((Page) => (
          <Tabs.TabPane tab={Page.title} key={Page.tagName}>
            <Page store={store} />
          </Tabs.TabPane>
        ))}
      </Tabs>
    </Modal>
  );
});
