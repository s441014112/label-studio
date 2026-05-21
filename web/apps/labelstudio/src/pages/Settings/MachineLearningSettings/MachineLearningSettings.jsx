import { useCallback, useContext, useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { Button, Typography, Spinner, EmptyState, SimpleCard } from "@humansignal/ui";
import { useUpdatePageTitle, createTitleFromSegments } from "@humansignal/core";
import { Form, Label, Toggle } from "../../../components/Form";
import { modal } from "../../../components/Modal/Modal";
import { IconModels, IconExternal } from "@humansignal/icons";
import { useAPI } from "../../../providers/ApiProvider";
import { ProjectContext } from "../../../providers/ProjectProvider";
import { MachineLearningList } from "./MachineLearningList";
import { CustomBackendForm } from "./Forms";
import { TestRequest } from "./TestRequest";
import { StartModelTraining } from "./StartModelTraining";
import "./MachineLearningSettings.scss";
import "../../../translations/i18n";
import { useTranslation } from "react-i18next";

export const MachineLearningSettings = () => {
  const api = useAPI();
  const { project, fetchProject } = useContext(ProjectContext);
  const [backends, setBackends] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const { t } = useTranslation();

  useUpdatePageTitle(createTitleFromSegments([project?.title, t("pages.settings.machine_learning_setting.model_setting")]));

  const fetchBackends = useCallback(async () => {
    setLoading(true);
    const models = await api.callApi("mlBackends", {
      params: {
        project: project.id,
        include_static: true,
      },
    });

    if (models) setBackends(models);
    setLoading(false);
    setLoaded(true);
  }, [project, setBackends]);

  const startTrainingModal = useCallback(
    (backend) => {
      const modalProps = {
        title: t("pages.settings.machine_learning_setting.start_training"),
        style: { width: 760 },
        closeOnClickOutside: true,
        body: <StartModelTraining backend={backend} />,
      };

      modal(modalProps);
    },
    [project],
  );

  const showRequestModal = useCallback(
    (backend) => {
      const modalProps = {
        title: t("pages.settings.machine_learning_setting.test_request"),
        style: { width: 760 },
        closeOnClickOutside: true,
        body: <TestRequest backend={backend} />,
      };

      modal(modalProps);
    },
    [project],
  );

  const showMLFormModal = useCallback(
    (backend) => {
      const action = backend ? "updateMLBackend" : "addMLBackend";
      const modalProps = {
        title: backend ?  t("pages.settings.machine_learning_setting.edit_model") : t("pages.settings.machine_learning_setting.connect_model"),
        style: { width: 760 },
        closeOnClickOutside: false,
        body: (
          <CustomBackendForm
            action={action}
            backend={backend}
            project={project}
            onSubmit={() => {
              fetchBackends();
              modalRef.close();
            }}
          />
        ),
      };

      const modalRef = modal(modalProps);
    },
    [project, fetchBackends],
  );

  useEffect(() => {
    if (project.id) {
      fetchBackends();
    }
  }, [project.id]);

  return (
    <section>
      <div className="w-[42rem]">
        <Typography variant="headline" size="medium" className="mb-base">
          { t("pages.settings.machine_learning_setting.model") }
        </Typography>
        {loading && <Spinner size={32} />}
        {loaded && backends.length === 0 && (
          <SimpleCard title="" className="bg-primary-background border-primary-border-subtler p-base">
            <EmptyState
              size="medium"
              variant="primary"
              icon={<IconModels />}
              title={ t("pages.settings.machine_learning_setting.first_model_connect") }
              description={ t("pages.settings.machine_learning_setting.connect_tip") }
              actions={
                <Button
                  variant="primary"
                  look="filled"
                  onClick={() => showMLFormModal()}
                  aria-label={ t("pages.settings.machine_learning_setting.connect_model") }
                >
                 { t("pages.settings.machine_learning_setting.connect_model") }
                </Button>
              }
              footer={
                !window.APP_SETTINGS?.whitelabel_is_active && (
                  <Typography variant="label" size="small" className="text-primary-link">
                    <a
                      href="https://labelstud.io/guide/ml"
                      target="_blank"
                      rel="noopener noreferrer"
                      data-testid="ml-help-link"
                      aria-label={ t("pages.settings.machine_learning_setting.learn_more") }
                      className="inline-flex items-center gap-1 hover:underline"
                    >
                      { t("pages.settings.machine_learning_setting.learn_more") }
                      <IconExternal width={16} height={16} />
                    </a>
                  </Typography>
                )
              }
            />
          </SimpleCard>
        )}
        <MachineLearningList
          onEdit={(backend) => showMLFormModal(backend)}
          onTestRequest={(backend) => showRequestModal(backend)}
          onStartTraining={(backend) => startTrainingModal(backend)}
          fetchBackends={fetchBackends}
          backends={backends}
        />

        {backends.length > 0 && (
          <div className="my-wide">
            <Typography size="small" className="text-neutral-content-subtler">
              { t("pages.settings.machine_learning_setting.predictions_tips_first") }
            </Typography>
            <Typography size="small" className="text-neutral-content-subtler mt-base">
              { t("pages.settings.machine_learning_setting.predictions_tips_second") } <i>{ t("pages.settings.machine_learning_setting.data_manager") }</i>.
            </Typography>
            <Typography size="small" className="text-neutral-content-subtler mt-tighter">
              { t("pages.settings.machine_learning_setting.predictions_tips_third") }
            </Typography>
            <Typography size="small" className="text-neutral-content-subtler mt-tighter">
              { t("pages.settings.machine_learning_setting.predictions_tips_fourth") } <i>{ t("pages.settings.machine_learning_setting.batch_predictions") }</i> { t("pages.settings.machine_learning_setting.predictions_tips_fifth") } <i>{ t("pages.settings.machine_learning_setting.actions") }</i> { t("pages.settings.machine_learning_setting.predictions_tips_sixth") }
            </Typography>
            <Typography size="small" className="text-neutral-content-subtler mt-base">
              { t("pages.settings.machine_learning_setting.predictions_tips_seventh") }{" "}
              <NavLink to="annotation" className="hover:underline">
                { t("pages.settings.machine_learning_setting.Annotation_settings") }
              </NavLink>
              .
            </Typography>
          </div>
        )}

        <Form
          action="updateProject"
          formData={{ ...project }}
          params={{ pk: project.id }}
          onSubmit={() => fetchProject()}
        >
          {backends.length > 0 && (
            <div className="p-wide border border-neutral-border rounded-md">
              <Form.Row columnCount={1}>
                <Label text={ t("pages.settings.machine_learning_setting.configuration") } large />

                <div>
                  <Toggle
                    label={ t("pages.settings.machine_learning_setting.start_training_on_submission") }
                    description={ t("pages.settings.machine_learning_setting.start_training_on_submission_tip") }
                    name="start_training_on_annotation_update"
                  />
                </div>
              </Form.Row>
            </div>
          )}

          {backends.length > 0 && (
            <Form.Actions>
              <Form.Indicator>
                <span case="success">{ t("pages.settings.machine_learning_setting.saved") }</span>
              </Form.Indicator>
              <Button type="submit" look="primary" className="w-[120px]" aria-label={ t("pages.settings.machine_learning_setting.save") }>
                { t("pages.settings.machine_learning_setting.save") }
              </Button>
            </Form.Actions>
          )}
        </Form>
      </div>
    </section>
  );
};

MachineLearningSettings.title = "sideMenu.model";
MachineLearningSettings.path = "/ml";
