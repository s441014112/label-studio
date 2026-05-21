export default {
  enableHotkeys: {
    newUI: {
      title: "editor.hotkeys.newUI.enableHotkeys_title",
      description: "editor.hotkeys.newUI.enableHotkeys_desc",
    }, 
    description: "editor.hotkeys.enable_labeling_hotkeys",
    onChangeEvent: "toggleHotkeys",
    defaultValue: true,
  },
  enableTooltips: {
    newUI: {
      title: "editor.hotkeys.newUI.enableTooltips_title",
      description: "editor.hotkeys.newUI.enableTooltips_desc",
    },
    description: "editor.hotkeys.show_hotkey_tooltips",
    onChangeEvent: "toggleTooltips",
    checked: "",
    defaultValue: false,
  },
  enableLabelTooltips: {
    newUI: {
      title: "editor.hotkeys.newUI.enableLabelTooltips_title",
      description: "editor.hotkeys.newUI.enableLabelTooltips_desc",
    },
    description: "editor.hotkeys.show_labels_hotkey_tooltips",
    onChangeEvent: "toggleLabelTooltips",
    defaultValue: true,
  },
  showLabels: {
    newUI: {
      title: "editor.hotkeys.newUI.showLabels_title",
      description: "editor.hotkeys.newUI.showLabels_desc",
    },
    description: "editor.hotkeys.show_labels_inside",
    onChangeEvent: "toggleShowLabels",
    defaultValue: false,
  },
  continuousLabeling: {
    newUI: {
      title: "editor.hotkeys.newUI.continuousLabeling_title",
      description: "editor.hotkeys.newUI.continuousLabeling_desc"
    },
    description: "editor.hotkeys.keep_labels",
    onChangeEvent: "toggleContinuousLabeling",
    defaultValue: false,
  },
  selectAfterCreate: {
    newUI: {
      title: "editor.hotkeys.newUI.selectAfterCreate_title",
      description: "editor.hotkeys.newUI.selectAfterCreate_desc",
    },
    description: "editor.hotkeys.select_regions",
    onChangeEvent: "toggleSelectAfterCreate",
    defaultValue: false,
  },
  showLineNumbers: {
    newUI: {
      tags: "editor.hotkeys.newUI.text_tag",
      title: "editor.hotkeys.newUI.showLineNumbers_title",
      description: "editor.hotkeys.newUI.showLineNumbers_desc",
    },
    description: "editor.hotkeys.show_line_numbers",
    onChangeEvent: "toggleShowLineNumbers",
    defaultValue: false,
  },
  preserveSelectedTool: {
    newUI: {
      tags: "editor.hotkeys.newUI.image_tag",
      title: "editor.hotkeys.newUI.preserveSelectedTool_title",
      description: "editor.hotkeys.newUI.preserveSelectedTool_desc",
    },
    description: "editor.hotkeys.remember_selected_tool",
    onChangeEvent: "togglepreserveSelectedTool",
    defaultValue: true,
  },
  enableSmoothing: {
    newUI: {
      tags: "editor.hotkeys.newUI.image_tag",
      title: "editor.hotkeys.newUI.enableSmoothing_title",
      description: "editor.hotkeys.newUI.enableSmoothing_desc",
    },
    description: "editor.hotkeys.enable_image",
    onChangeEvent: "toggleSmoothing",
    defaultValue: true,
  },
  invertedZoom: {
    newUI: {
      tags: "editor.hotkeys.newUI.image_tag",
      title: "editor.hotkeys.newUI.invertedZoom_title",
      description: "editor.hotkeys.newUI.invertedZoom_desc",
    },
    description: "editor.hotkeys.enable_inverted",
    onChangeEvent: "toggleInvertedZoom",
    defaultValue: false,
  },
};
