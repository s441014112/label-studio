import { EnterpriseBadge, Select, Typography } from "@humansignal/ui";
import { useCallback, useContext } from "react";
import { Button } from "@humansignal/ui";
import { Form, Input, TextArea } from "../../components/Form";
import { RadioGroup } from "../../components/Form/Elements/RadioGroup/RadioGroup";
import { ProjectContext } from "../../providers/ProjectProvider";
import { cn } from "../../utils/bem";
import { HeidiTips } from "../../components/HeidiTips/HeidiTips";
import { FF_LSDV_E_297, isFF } from "../../utils/feature-flags";
import { createURL } from "../../components/HeidiTips/utils";
import "../../translations/i18n";
import { useTranslation } from "react-i18next";

export const GeneralSettings = () => {
  const { project, fetchProject } = useContext(ProjectContext);
  const { t } = useTranslation();

  const updateProject = useCallback(() => {
    if (project.id) fetchProject(project.id, true);
  }, [project]);

  const colors = ["#FDFDFC", "#FF4C25", "#FF750F", "#ECB800", "#9AC422", "#34988D", "#617ADA", "#CC6FBE"];

  const samplings = [
    { value: "Sequential", label: t("pages.settings.general.sequential"), description: t("pages.settings.general.sequential_desc") },
    { value: "Uniform", label: t("pages.settings.general.sequential"), description: t("pages.settings.general.random_desc") },
  ];

  return (
    <div className={cn("general-settings").toClassName()}>
      <div className={cn("general-settings").elem("wrapper").toClassName()}>
        <h1>{ t("pages.settings.general.general_setting") }</h1>
        <div className={cn("settings-wrapper").toClassName()}>
          <Form action="updateProject" formData={{ ...project }} params={{ pk: project.id }} onSubmit={updateProject}>
            <Form.Row columnCount={1} rowGap="16px">
              <Input name="title" label={ t("pages.settings.general.project_name") } />

              <TextArea name="description" label={ t("pages.settings.general.description") } style={{ minHeight: 128 }} />
              {/* {isFF(FF_LSDV_E_297) && (
                <div className={cn("workspace-placeholder").toClassName()}>
                  <div className={cn("workspace-placeholder").elem("badge-wrapper").toClassName()}>
                    <div className={cn("workspace-placeholder").elem("title").toClassName()}>{ t("pages.settings.general.workspace") }</div>
                    <EnterpriseBadge className="ml-2" />
                  </div>
                  <Select placeholder={ t("pages.settings.general.select_a_option") } disabled options={[]} />
                  <Typography size="small" className="my-tight">
                    { t("pages.settings.general.simplify_project") }{" "}
                    <a
                      target="_blank"
                      href={createURL(
                        "https://docs.humansignal.com/guide/manage_projects#Create-workspaces-to-organize-projects",
                        {
                          experiment: "project_settings_tip",
                          treatment: "simplify_project_management",
                        },
                      )}
                      rel="noreferrer"
                      className="underline hover:no-underline"
                    >
                      { t("pages.settings.general.learn_more") }
                    </a>
                  </Typography>
                </div>
              )} */}
              <RadioGroup name="color" label={ t("pages.settings.general.color") } size="large" labelProps={{ size: "large" }}>
                {colors.map((color) => (
                  <RadioGroup.Button key={color} value={color}>
                    <div className={cn("color").toClassName()} style={{ "--background": color }} />
                  </RadioGroup.Button>
                ))}
              </RadioGroup>

              <RadioGroup label={ t("pages.settings.general.task_sampling") } labelProps={{ size: "large" }} name="sampling" simple>
                {samplings.map(({ value, label, description }) => (
                  <RadioGroup.Button
                    key={value}
                    value={`${value} ${ t("pages.settings.general.sampling") }`}
                    label={`${label} ${ t("pages.settings.general.sampling") }`}
                    description={description}
                  />
                ))}
                {/* {isFF(FF_LSDV_E_297) && (
                  <RadioGroup.Button
                    key="uncertainty-sampling"
                    value=""
                    label={
                      <>
                        { t("pages.settings.general.uncertainty_sampling") } <EnterpriseBadge className="ml-2" />
                      </>
                    }
                    disabled
                    description={
                      <>
                        { t("pages.settings.general.task_learn_more") }.{" "}
                        <a
                          target="_blank"
                          href={createURL("https://docs.humansignal.com/guide/active_learning", {
                            experiment: "project_settings_workspace",
                            treatment: "workspaces",
                          })}
                          rel="noreferrer"
                        >
                          { t("pages.settings.general.learn_more") }
                        </a>
                      </>
                    }
                  />
                )} */}
              </RadioGroup>
            </Form.Row>

            <Form.Actions>
              <Form.Indicator>
                <span case="success">{ t("pages.settings.general.saved") }</span>
              </Form.Indicator>
              <Button type="submit" className="w-[150px]" aria-label={ t("pages.settings.general.save_settings") }>
                { t("pages.settings.general.save") }
              </Button>
            </Form.Actions>
          </Form>
        </div>
      </div>
      {isFF(FF_LSDV_E_297) && <></>}
      {/* <HeidiTips collection="projectSettings" /> */}
    </div>
  );
};

GeneralSettings.menuItem = "sideMenu.general";
GeneralSettings.path = "/";
GeneralSettings.exact = true;
