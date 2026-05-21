import { useState } from "react";
import { Button } from "@humansignal/ui";
import { ErrorWrapper } from "../../../components/Error/Error";
import { InlineError } from "../../../components/Error/InlineError";
import { Form, Input, Select, TextArea, Toggle } from "../../../components/Form";
import "./MachineLearningSettings.scss";
import "../../../translations/i18n";
import { useTranslation } from "react-i18next";

const CustomBackendForm = ({ action, backend, project, onSubmit }) => {
  const [selectedAuthMethod, setAuthMethod] = useState("NONE");
  const [, setMLError] = useState();

  const { t } = useTranslation();

  return (
    <Form
      action={action}
      formData={{ ...(backend ?? {}) }}
      params={{ pk: backend?.id }}
      onSubmit={async (response) => {
        if (!response.error_message) {
          onSubmit(response);
        }
      }}
    >
      <Input type="hidden" name="project" value={project.id} />

      <Form.Row columnCount={1}>
        <Input name="title" label={ t("pages.settings.machine_learning_setting.name") } placeholder={ t("pages.settings.machine_learning_setting.enter_a_name") } required />
      </Form.Row>

      <Form.Row columnCount={1}>
        <Input name="url" label={ t("pages.settings.machine_learning_setting.backend_url") } required />
      </Form.Row>

      <Form.Row columnCount={2}>
        <Select
          name="auth_method"
          label={ t("pages.settings.machine_learning_setting.select_authentication") }
          options={[
            { label: t("pages.settings.machine_learning_setting.no_authentication"), value: "NONE" },
            { label: t("pages.settings.machine_learning_setting.basic_authentication"), value: "BASIC_AUTH" },
          ]}
          value={selectedAuthMethod}
          onChange={setAuthMethod}
        />
      </Form.Row>

      {(backend?.auth_method === "BASIC_AUTH" || selectedAuthMethod === "BASIC_AUTH") && (
        <Form.Row columnCount={2}>
          <Input name="basic_auth_user" label={ t("pages.settings.machine_learning_setting.basic_auth_user") } />
          {backend?.basic_auth_pass_is_set ? (
            <Input name="basic_auth_pass" label={ t("pages.settings.machine_learning_setting.basic_auth_pass") } type="password" placeholder="********" />
          ) : (
            <Input name="basic_auth_pass" label={ t("pages.settings.machine_learning_setting.basic_auth_pass") } type="password" />
          )}
        </Form.Row>
      )}

      <Form.Row columnCount={1}>
        <TextArea
          name="extra_params"
          label={ t("pages.settings.machine_learning_setting.extra_params") }
          style={{ minHeight: 120 }}
        />
      </Form.Row>

      <Form.Row columnCount={1}>
        <Toggle
          name="is_interactive"
          label={ t("pages.settings.machine_learning_setting.interactive_preannotations") }
          description={ t("pages.settings.machine_learning_setting.preannotations_tip") }
        />
      </Form.Row>

      <Form.Actions>
        <Button type="submit" look="primary" onClick={() => setMLError(null)} aria-label={ t("pages.settings.machine_learning_setting.validate_and_save") }>
          { t("pages.settings.machine_learning_setting.validate_and_save") }
        </Button>
      </Form.Actions>

      <Form.ResponseParser>
        {(response) => (
          <>
            {response.error_message && (
              <ErrorWrapper
                error={{
                  response: {
                    detail: `Failed to ${backend ? "save" : "add new"} ML backend.`,
                    exc_info: response.error_message,
                  },
                }}
              />
            )}
          </>
        )}
      </Form.ResponseParser>

      <InlineError />
    </Form>
  );
};

export { CustomBackendForm };
