import { useCallback, useRef } from "react";
import { Form } from "antd";
import { Button } from "@humansignal/ui";

import { observer } from "mobx-react";
import "../../../../apps/labelstudio/src/translations/i18n";
import { useTranslation } from "react-i18next";

const toJSON = (annotation) => {
  const id = annotation.pk || annotation.id;
  const result = annotation.serializeAnnotation();
  const draft = annotation.versions.draft;
  const json = { id, result };

  if (draft) json.draft = draft;
  return json;
};

const DebugComponent = ({ store }) => {
  const refConfig = useRef();
  const refData = useRef();
  const refAnnotations = useRef();

  const loadTask = useCallback(() => {
    const config = refConfig.current?.value;
    const annotations = JSON.parse(refAnnotations.current?.value || '[{ "result": [] }]');
    const data = JSON.parse(refData.current?.value);

    store.resetState();
    store.assignConfig(config);
    store.assignTask({ data });
    store.initializeStore({ annotations, predictions: [] });
    const cs = store.annotationStore;

    if (cs.annotations.length) cs.selectAnnotation(cs.annotations[0].id);
  }, []);

  const serializeCurrent = useCallback(() => {
    const input = refAnnotations.current;

    if (!input) return;
    const annotation = store.annotationStore.selected;
    const json = [toJSON(annotation)];

    input.value = JSON.stringify(json, null, 2);
  }, []);

  const serializeAll = useCallback(() => {
    const input = refAnnotations.current;

    if (!input) return;
    const { annotations, predictions } = store.annotationStore;
    const json = [...annotations, ...predictions].map(toJSON);

    input.value = JSON.stringify(json, null, 2);
  }, []);

  const t = useTranslation();

  return (
    <div style={{ width: "100%" }}>
      <br />
      <h2>{ t("editor.components.debug.debug") }</h2>
      <div>
        <Button size="small" onClick={serializeAll} aria-label={ t("editor.components.debug.serilaize_all_annotation") }>
          { t("editor.components.debug.serilaize_all_annotation") }
        </Button>
        <Button size="small" onClick={serializeCurrent} aria-label={ t("editor.components.debug.serilaize_current_annotation") }>
          { t("editor.components.debug.serilaize_current_annotation") }
        </Button>
        <Button size="small" onClick={loadTask} aria-label={ t("editor.components.debug.simulate_loading_task") }>
          { t("editor.components.debug.simulate_loading_task") }
        </Button>
      </div>

      <Form>
        <div style={{ display: "flex" }}>
          <div style={{ flexBasis: "50%" }}>
            <p>{ t("editor.components.debug.data") }</p>
            <textarea
              style={{ width: "100%" }}
              ref={refData}
              rows={4}
              defaultValue={store.task.data}
              className="is-search"
            />
            <p>{ t("editor.components.debug.config") }</p>
            <textarea
              style={{ width: "100%" }}
              ref={refConfig}
              rows={16}
              defaultValue={store.config}
              className="is-search"
            />
          </div>
          <div style={{ flexBasis: "50%" }}>
            <p>{ t("editor.components.debug.annotations") }</p>
            <textarea
              style={{ width: "100%" }}
              ref={refAnnotations}
              rows={22}
              // defaultValue={}
              className="is-search"
            />
          </div>
        </div>
      </Form>
    </div>
  );
};

export default observer(DebugComponent);
