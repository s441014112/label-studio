import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { Button } from "@humansignal/ui";
import { useUpdatePageTitle, createTitleFromSegments } from "@humansignal/core";
import { Form, TextArea, Toggle } from "../../components/Form";
import { MenubarContext } from "../../components/Menubar/Menubar";
import { cn } from "../../utils/bem";

import { ModelVersionSelector } from "./AnnotationSettings/ModelVersionSelector";
import { ProjectContext } from "../../providers/ProjectProvider";
import { Divider } from "../../components/Divider/Divider";
import "../../translations/i18n"
import { useTranslation } from "react-i18next";

export const AnnotationSettings = () => {
  const { project, fetchProject } = useContext(ProjectContext);
  const pageContext = useContext(MenubarContext);
  const formRef = useRef();
  const [collab, setCollab] = useState(null);

  const { t } = useTranslation();

  useUpdatePageTitle(createTitleFromSegments([project?.title, t("pages.settings.annotation_settings.title")]));

  useEffect(() => {
    pageContext.setProps({ formRef });
  }, [formRef]);

  const updateProject = useCallback(() => {
    fetchProject(project.id, true);
  }, [project]);

  return (
    <div className={cn("annotation-settings").toClassName()}>
      <div className={cn("annotation-settings").elem("wrapper").toClassName()}>
        <h1>{ t("pages.settings.annotation_settings.title") }</h1>
        <div className={cn("settings-wrapper").toClassName()}>
          <Form
            ref={formRef}
            action="updateProject"
            formData={{ ...project }}
            params={{ pk: project.id }}
            onSubmit={updateProject}
          >
            <Form.Row columnCount={1}>
              <div className={cn("settings-wrapper").elem("header").toClassName()}>{ t("pages.settings.annotation_settings.labeling_instructions") }</div>
              <div class="settings-description">
                <p style={{ marginBottom: "0" }}>{ t("pages.settings.annotation_settings.instruction_desc") }</p>
                <p style={{ marginTop: "8px" }}>
                  { t("pages.settings.annotation_settings.instruction_support") }
                </p>
              </div>
              <div>
                <Toggle label={ t("pages.settings.annotation_settings.show_before_labeling") } name="show_instruction" />
              </div>
              <TextArea name="expert_instruction" style={{ minHeight: 128, maxWidth: "520px" }} />
            </Form.Row>

            <Divider height={32} />

            <Form.Row columnCount={1}>
              <br />
              <div className={cn("settings-wrapper").elem("header").toClassName()}>{ t("pages.settings.annotation_settings.prelabeling") }</div>
              <div>
                <Toggle
                  label={ t("pages.settings.annotation_settings.use_predictions") }
                  description={<span>{ t("pages.settings.annotation_settings.enable_use_predictions") } </span>}
                  name="show_collab_predictions"
                  onChange={(e) => {
                    setCollab(e.target.checked);
                  }}
                />
              </div>

              {(collab !== null ? collab : project.show_collab_predictions) && <ModelVersionSelector />}
            </Form.Row>

            <Form.Actions>
              <Form.Indicator>
                <span case="success">{ t("pages.settings.annotation_settings.saved") }</span>
              </Form.Indicator>
              <Button type="submit" look="primary" className="w-[150px]" aria-label={ t("pages.settings.annotation_settings.save_settings") }>
                { t("pages.settings.annotation_settings.save") }
              </Button>
            </Form.Actions>
          </Form>
        </div>
      </div>
    </div>
  );
};

AnnotationSettings.title = "sideMenu.annotation";
AnnotationSettings.path = "/annotation";
