import { Button } from "@humansignal/ui";
import { modal } from "../../components/Modal/Modal";
import { useModalControls } from "../../components/Modal/ModalPopup";
import { Space } from "../../components/Space/Space";
import { cn } from "../../utils/bem";
import "../../translations/i18n"
import { useTranslation } from "react-i18next";

export const WebhookDeleteModal = ({ onDelete }) => {

  const { t } = useTranslation();

  return modal({
    title: t("pages.web_hook_page.web_hook_delete_modal.title"),
    body: () => {
      const ctrl = useModalControls();
      const rootClass = cn("webhook-delete-modal");
      return (
        <div className={rootClass}>
          <div className={rootClass.elem("modal-text")}>
            { t("pages.web_hook_page.web_hook_delete_modal.delete_webhook_confirm_tip") }
          </div>
        </div>
      );
    },
    footer: () => {
      const ctrl = useModalControls();
      const rootClass = cn("webhook-delete-modal");
      return (
        <Space align="end">
          <Button
            look="outlined"
            onClick={() => {
              ctrl.hide();
            }}
            aria-label={ t("pages.web_hook_page.web_hook_delete_modal.cancel") }
          >
            { t("pages.web_hook_page.web_hook_delete_modal.cancel") }
          </Button>
          <Button
            variant="negative"
            onClick={async () => {
              await onDelete();
              ctrl.hide();
            }}
            aria-label={ t("pages.web_hook_page.web_hook_delete_modal.confirm") }
          >
            { t("pages.web_hook_page.web_hook_delete_modal.confirm") }
          </Button>
        </Space>
      );
    },
    style: { width: 512 },
  });
};
