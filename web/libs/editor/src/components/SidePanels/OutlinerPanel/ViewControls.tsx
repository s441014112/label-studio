import {
  IconBoundingBox,
  IconClockTimeFourOutline,
  IconCursor,
  IconList,
  IconOutlinerEyeClosed,
  IconOutlinerEyeOpened,
  IconPredictions,
  IconSortDown,
  IconSortUp,
  IconTimelineRegion,
} from "@humansignal/icons";
import { Button } from "@humansignal/ui";
import { type FC, useCallback, useContext, useEffect, useMemo } from "react";
import { Dropdown } from "@humansignal/ui";
// eslint-disable-next-line
// @ts-ignore
import { Menu } from "../../../common/Menu/Menu";
import { cn } from "../../../utils/bem";
import { SidePanelsContext } from "../SidePanelsContext";
import "./ViewControls.scss";
import { observer } from "mobx-react";
import { FF_DEV_3873, isFF } from "../../../utils/feature-flags";

import "../../../../../../apps/labelstudio/src/translations/i18n";
import { useTranslation } from "react-i18next";

export type GroupingOptions = "manual" | "label" | "type";

export type OrderingOptions = "score" | "date" | "mediaStartTime";

export type OrderingDirection = "asc" | "desc";

interface ViewControlsProps {
  ordering: OrderingOptions;
  orderingDirection?: OrderingDirection;
  regions: any;
  onOrderingChange: (ordering: OrderingOptions) => void;
  onGroupingChange: (grouping: GroupingOptions) => void;
}

const mediaStartTimeSupportedTags = [
  ["labels", "audio"],
  ["labels", "videorectangle", "video"],
  ["timelinelabels", "video"],
  ["timeserieslabels", "timeseries"],
];

export const ViewControls: FC<ViewControlsProps> = observer(
  ({ ordering, regions, orderingDirection, onOrderingChange, onGroupingChange }) => {
    const grouping = regions.group;
    const context = useContext(SidePanelsContext);

    // Check labeling configuration for media-time-capable object tags
    const mediaTimeSupport: boolean | null = useMemo(() => {
      const names = regions.annotation?.names;
      if (!names || names.size === 0) return null;

      const tags = Array.from(names.values());
      // Check if all tag types from the tuple exist in the configuration
      return mediaStartTimeSupportedTags.some((requiredTagTypes) => {
        return requiredTagTypes.every((requiredType) => tags.some((tag: any) => tag?.type === requiredType));
      });
    }, [regions.annotation?.names]);

    const { t } = useTranslation();

    // Auto-fallback to "date" if current ordering is "mediaStartTime" but no media-time support in config
    useEffect(() => {
      if (ordering === "mediaStartTime" && mediaTimeSupport === false) {
        onOrderingChange("date");
      }
    }, [ordering, mediaTimeSupport, onOrderingChange]);

    const getGroupingLabels = useCallback((value: GroupingOptions): LabelInfo => {
      switch (value) {
        case "manual":
          return {
            label: (
              <>
                <IconList /> { t("editor.components.sidepanels.manual_grouping") }
              </>
            ),
            selectedLabel: isFF(FF_DEV_3873) ? t("editor.components.sidepanels.manual") : t("editor.components.sidepanels.manual_grouping"),
            icon: <IconList width={16} height={16} />,
            tooltip: t("editor.components.sidepanels.manually_grouped"),
          };
        case "label":
          return {
            label: (
              <>
                <IconBoundingBox /> { t("editor.components.sidepanels.grouped_by_label") }
              </>
            ),
            selectedLabel: isFF(FF_DEV_3873) ? t("editor.components.sidepanels.by_label") : t("editor.components.sidepanels.grouped_by_label"),
            icon: <IconBoundingBox width={16} height={16} />,
            tooltip: t("editor.components.sidepanels.grouped_by_label"),
          };
        case "type":
          return {
            label: (
              <>
                <IconCursor /> { t("editor.components.sidepanels.grouped_by_tool") }
              </>
            ),
            selectedLabel: isFF(FF_DEV_3873) ? t("editor.components.sidepanels.by_tool") : t("editor.components.sidepanels.grouped_by_tool"),
            icon: <IconCursor width={16} height={16} />,
            tooltip: t("editor.components.sidepanels.grouped_by_tool"),
          };
      }
    }, []);

    const getOrderingLabels = useCallback((value: OrderingOptions): LabelInfo => {
      switch (value) {
        case "date":
          return {
            label: (
              <>
                <IconClockTimeFourOutline /> { t("editor.components.sidepanels.order_by_time") }
              </>
            ),
            selectedLabel: t("editor.components.sidepanels.by_time"),
            icon: <IconClockTimeFourOutline width={16} height={16} />,
          };
        case "score":
          return {
            label: (
              <>
                <IconPredictions /> { t("editor.components.sidepanels.order_by_score") }
              </>
            ),
            selectedLabel: t("editor.components.sidepanels.by_score"),
            icon: <IconPredictions width={16} height={16} />,
          };
        case "mediaStartTime":
          return {
            label: (
              <>
                <IconTimelineRegion /> { t("editor.components.sidepanels.order_by_media_start_time") }
              </>
            ),
            selectedLabel: t("editor.components.sidepanels.by_media_start_time"),
            icon: <IconTimelineRegion width={16} height={16} />,
          };
      }
    }, []);

    const renderOrderingDirectionIcon = orderingDirection === "asc" ? <IconSortUp /> : <IconSortDown />;

    return (
      <div className={cn("view-controls").mod({ collapsed: context.locked }).toClassName()}>
        <Grouping
          value={grouping}
          options={["manual", "type", "label"]}
          onChange={(value) => onGroupingChange(value)}
          readableValueForKey={getGroupingLabels}
        />
        {grouping === "manual" && (
          <div className={cn("view-controls").elem("sort").toClassName()}>
            <Grouping
              value={ordering}
              direction={orderingDirection}
              options={mediaTimeSupport ? ["score", "date", "mediaStartTime"] : ["score", "date"]}
              onChange={(value) => onOrderingChange(value)}
              readableValueForKey={getOrderingLabels}
              allowClickSelected
              extraIcon={renderOrderingDirectionIcon}
              width={230}
            />
          </div>
        )}
        <ToggleRegionsVisibilityButton regions={regions} />
      </div>
    );
  },
);

interface LabelInfo {
  label: string | React.ReactNode | JSX.Element;
  selectedLabel: string;
  icon: JSX.Element;
  tooltip?: string;
}

interface GroupingProps<T extends string> {
  value: T;
  options: T[];
  direction?: OrderingDirection;
  allowClickSelected?: boolean;
  onChange: (value: T) => void;
  readableValueForKey: (value: T) => LabelInfo;
  extraIcon?: JSX.Element;
  width?: number;
}

const Grouping = <T extends string>({
  value,
  options,
  direction,
  allowClickSelected,
  onChange,
  readableValueForKey,
  extraIcon,
  width = 200,
}: GroupingProps<T>) => {
  const readableValue = useMemo(() => {
    return readableValueForKey(value);
  }, [value]);

  const optionsList: [T, LabelInfo][] = useMemo(() => {
    return options.map((key) => [key, readableValueForKey(key)]);
  }, [options, readableValueForKey]);

  const dropdownContent = useMemo(() => {
    return (
      <Menu
        size="medium"
        style={{
          width,
          minWidth: width,
          borderRadius: isFF(FF_DEV_3873) && 4,
        }}
        selectedKeys={[value]}
        allowClickSelected={allowClickSelected}
      >
        {optionsList.map(([key, label]) => (
          <GroupingMenuItem
            key={key}
            name={key}
            value={value}
            direction={direction}
            label={label}
            onChange={(value) => onChange(value)}
          />
        ))}
      </Menu>
    );
  }, [value, optionsList, readableValue, direction, onChange]);

  return (
    <Dropdown.Trigger content={dropdownContent} style={{ width }}>
      <Button
        variant="neutral"
        size="smaller"
        data-testid={`grouping-${value}`}
        look="string"
        leading={readableValue.icon}
        trailing={
          isFF(FF_DEV_3873) ? (
            extraIcon
          ) : (
            <DirectionIndicator direction={direction} name={value} value={value} wrap={false} />
          )
        }
      >
        {readableValue.selectedLabel}
      </Button>
    </Dropdown.Trigger>
  );
};

interface GroupingMenuItemProps<T extends string> {
  name: T;
  label: LabelInfo;
  value: T;
  direction?: OrderingDirection;
  onChange: (key: T) => void;
}

const GroupingMenuItem = <T extends string>({ value, name, label, direction, onChange }: GroupingMenuItemProps<T>) => {
  return (
    <Menu.Item name={name} onClick={() => onChange(name)}>
      <div className={cn("view-controls").elem("label").toClassName()}>
        {label.label}
        <DirectionIndicator direction={direction} name={name} value={value} />
      </div>
    </Menu.Item>
  );
};

interface DirectionIndicator {
  direction?: OrderingDirection;
  value: string;
  name: string;
  wrap?: boolean;
}

const DirectionIndicator: FC<DirectionIndicator> = ({ direction, value, name, wrap = true }) => {
  const content = direction === "asc" ? <IconSortUp /> : <IconSortDown />;

  if (!direction || value !== name || isFF(FF_DEV_3873)) return null;
  if (!wrap) return content;

  return <span>{content}</span>;
};

interface ToggleRegionsVisibilityButton {
  regions: any;
}

const ToggleRegionsVisibilityButton = observer<FC<ToggleRegionsVisibilityButton>>(({ regions }) => {
  const toggleRegionsVisibility = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      regions.toggleVisibility();
    },
    [regions],
  );

  const isDisabled = !regions?.regions?.length;
  const isAllHidden = !isDisabled && regions.isAllHidden;

  const { t } = useTranslation();

  return (
    <Button
      variant="neutral"
      size="smaller"
      look="string"
      disabled={isDisabled}
      onClick={toggleRegionsVisibility}
      aria-label={isAllHidden ? t("editor.components.sidepanels.show_all_regions") : t("editor.components.sidepanels.hide_all_regions")}
      tooltip={isAllHidden ? t("editor.components.sidepanels.show_all_regions") : t("editor.components.sidepanels.hide_all_regions")}
    >
      {isAllHidden ? (
        <IconOutlinerEyeClosed width={16} height={16} />
      ) : (
        <IconOutlinerEyeOpened width={16} height={16} />
      )}
    </Button>
  );
});
