import { settingsAtom, TOKEN_SETTINGS_KEY } from "@humansignal/app-common/pages/AccountSettings/atoms";
import type { AuthTokenSettings } from "@humansignal/app-common/pages/AccountSettings/types";
import { Button } from "@humansignal/ui";
import { Form, Input, Toggle } from "apps/labelstudio/src/components/Form";
import { useAtomValue } from "jotai";
import { queryClientAtom } from "jotai-tanstack-query";
import { type ChangeEvent, useState } from "react";

import "../../../../../apps/labelstudio/src/translations/i18n";
import { useTranslation } from 'react-i18next';

export const TokenSettingsModal = ({
  showTTL,
  onSaved,
}: {
  showTTL?: boolean;
  onSaved?: () => void;
}) => {
  const settings = useAtomValue(settingsAtom);
  if (!settings.isSuccess || settings.isError || "error" in settings.data) {
    return <div>Error loading settings.</div>;
  }
  return (
    <TokenSettingsModalView
      key={settings.data?.api_tokens_enabled}
      settings={settings.data}
      showTTL={showTTL}
      onSaved={onSaved}
    />
  );
};

function TokenSettingsModalView({
  settings,
  showTTL,
  onSaved,
}: {
  settings: AuthTokenSettings;
  showTTL?: boolean;
  onSaved?: () => void;
}) {
  const [enableTTL, setEnableTTL] = useState(settings.api_tokens_enabled);
  const queryClient = useAtomValue(queryClientAtom);

  const { t } = useTranslation();
  const reloadSettings = () => {
    queryClient.invalidateQueries({ queryKey: [TOKEN_SETTINGS_KEY] });
    onSaved?.();
  };

  return (
    <Form action="accessTokenUpdateSettings" onSubmit={reloadSettings}>
      <Form.Row columnCount={1}>
        <Toggle
          label={ t("common.blocks.personal_access_token") }
          name="api_tokens_enabled"
          description={ t("common.blocks.enable_token_security") }
          checked={settings.api_tokens_enabled ?? true}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setEnableTTL(e.target.checked)}
        />
      </Form.Row>
      <Form.Row columnCount={1}>
        <Toggle
          label={ t("common.blocks.legacy_tokens") }
          name="legacy_api_tokens_enabled"
          description={ t("common.blocks.enable_access_tokens") }
          checked={settings.legacy_api_tokens_enabled ?? false}
        />
      </Form.Row>
      {showTTL === true && (
        <Form.Row columnCount={1}>
          <Input
            name="api_token_ttl_days"
            label={ t("common.blocks.time_to_live") }
            description={ t("common.blocks.token_will_valid") }
            labelProps={{
              description:
                t("common.blocks.token_will_valid"),
            }}
            disabled={!enableTTL}
            type="number"
            min={10}
            max={365}
            value={settings.api_token_ttl_days ?? 30}
          />
        </Form.Row>
      )}
      <Form.Actions>
        <Button variant="primary" look="filled" type="submit">
          { t("common.blocks.save_changes") }
        </Button>
      </Form.Actions>
    </Form>
  );
}
