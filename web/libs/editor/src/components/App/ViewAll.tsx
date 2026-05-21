import { ff } from "@humansignal/core";
import { usePersistentState } from "@humansignal/core/lib/hooks/usePersistentState";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@humansignal/ui/lib/tabs";
import type { MSTAnnotation, MSTStore } from "../../stores/types";
import TaskSummary from "../TaskSummary/TaskSummary";
import Grid from "./Grid";

type Props = {
  store: MSTStore["annotationStore"];
  annotations: MSTAnnotation[];
  root: any;
  rootstore: any;
};

export const ViewAll = ({ store: annotationStore, annotations, root, rootstore }: Props) => {
  const [tab, setTab] = usePersistentState<"summary" | "compare">("view-all-tab", "summary");

  if (annotationStore.store.hasInterface("annotations:summary") && ff.isActive(ff.FF_SUMMARY)) {
    return (
      <div className="px-base pt-tighter mt-base">
        <Tabs variant="default" value={tab} onValueChange={(value) => setTab(value as "summary" | "compare")}>
          <TabsList>
            <TabsTrigger value="summary" data-testid="compare-all-summary-tab">
              { rootstore.t("editor.components.app.summary")  }
            </TabsTrigger>
            <TabsTrigger value="compare" data-testid="compare-all-side-by-side-tab">
              { rootstore.t("editor.components.app.side_by_side")  }
            </TabsTrigger>
          </TabsList>

          <TabsContent value="summary">
            <TaskSummary store={annotationStore} annotations={annotations} rootstore={rootstore} />
          </TabsContent>

          <TabsContent value="compare">
            <Grid store={annotationStore} annotations={annotations} root={root} rootstore={rootstore} />
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  return <Grid store={annotationStore} annotations={annotations} root={root} rootstore={rootstore} />;
};
