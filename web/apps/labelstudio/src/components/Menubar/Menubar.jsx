import { createContext, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { StaticContent } from "../../app/StaticContent/StaticContent";
import {
  IconBook,
  IconFolder,
  IconHome,
  IconHotkeys,
  IconPeople,
  IconPersonInCircle,
  IconPin,
  IconTerminal,
  IconDoor,
  IconGithub,
  IconSlack,
} from "@humansignal/icons";
import { LSLogo } from "../../assets/images";
import { Button, Userpic, ThemeToggle } from "@humansignal/ui";
import { useConfig } from "../../providers/ConfigProvider";
import { useContextComponent, useFixedLocation } from "../../providers/RoutesProvider";
import { useAuth } from "@humansignal/core/providers/AuthProvider";
import { cn } from "../../utils/bem";
import { absoluteURL, isDefined } from "../../utils/helpers";
import { useAPI } from "../../providers/ApiProvider";
import { Breadcrumbs } from "../Breadcrumbs/Breadcrumbs";
import { Dropdown } from "@humansignal/ui";
import { Hamburger } from "../Hamburger/Hamburger";
import { Menu } from "../Menu/Menu";
import { VersionNotifier, VersionProvider } from "../VersionNotifier/VersionNotifier";
import "./Menubar.scss";
import "./MenuContent.scss";
import "./MenuSidebar.scss";
import { FF_HOMEPAGE } from "../../utils/feature-flags";
import { pages } from "@humansignal/app-common";
import { isFF } from "../../utils/feature-flags";
import { ff } from "@humansignal/core";
import { openHotkeyHelp } from "@humansignal/app-common/pages/AccountSettings/sections/Hotkeys/Help";
import { LanguagePicker } from '../LanguagePicker/LanguagePicker';
import { useTranslation } from "react-i18next";
import i18n from "../../translations/i18n";

export const MenubarContext = createContext();

const LeftContextMenu = ({ className }) => (
  <StaticContent id="context-menu-left" className={className}>
    {(template) => <Breadcrumbs fromTemplate={template} />}
  </StaticContent>
);

const RightContextMenu = ({ className, ...props }) => {
  const { ContextComponent, contextProps } = useContextComponent();

  return ContextComponent ? (
    <div className={className}>
      <ContextComponent {...props} {...(contextProps ?? {})} />
    </div>
  ) : (
    <StaticContent id="context-menu-right" className={className} />
  );
};

export const Menubar = ({ enabled, defaultOpened, defaultPinned, children, onSidebarToggle, onSidebarPin }) => {
  const menuDropdownRef = useRef();
  const useMenuRef = useRef();
  const { user, isLoading } = useAuth();
  const location = useFixedLocation();

  const config = useConfig();
  const [sidebarOpened, setSidebarOpened] = useState(defaultOpened ?? false);
  const [sidebarPinned, setSidebarPinned] = useState(defaultPinned ?? false);
  const [PageContext, setPageContext] = useState({
    Component: null,
    props: {},
  });

  const menubarClass = cn("menu-header");
  const menubarContext = menubarClass.elem("context");
  const sidebarClass = cn("sidebar");
  const contentClass = cn("content-wrapper");
  const contextItem = menubarClass.elem("context-item");
  const showNewsletterDot = !isDefined(user?.allow_newsletters);

  const { t } = useTranslation();

  const api = useAPI();

  const sidebarPin = useCallback(
    (e) => {
      e.preventDefault();

      const newState = !sidebarPinned;

      setSidebarPinned(newState);
      onSidebarPin?.(newState);
    },
    [sidebarPinned],
  );

  const sidebarToggle = useCallback(
    (visible) => {
      const newState = visible;

      setSidebarOpened(newState);
      onSidebarToggle?.(newState);
    },
    [sidebarOpened],
  );

  const providerValue = useMemo(
    () => ({
      PageContext,

      setContext(ctx) {
        setTimeout(() => {
          setPageContext({
            ...PageContext,
            Component: ctx,
          });
        });
      },

      setProps(props) {
        setTimeout(() => {
          setPageContext({
            ...PageContext,
            props,
          });
        });
      },

      contextIsSet(ctx) {
        return PageContext.Component === ctx;
      },
    }),
    [PageContext],
  );

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlToken = urlParams.get('token');
    if (urlToken) {
      // 如果缓存里没有，或者缓存里的和链接上的不一致，就更新缓存
      if (!localStorage.getItem("token") || localStorage.getItem("token") !== urlToken) {
        localStorage.setItem("token", urlToken);
      }
    }

    const digitoken = urlParams.get('digi-middleware-auth-app');
    if (digitoken) {
      // 如果缓存里没有，或者缓存里的和链接上的不一致，就更新缓存
      if (!localStorage.getItem("digi-middleware-auth-app") || localStorage.getItem("digi-middleware-auth-app") !== digitoken) {
        localStorage.setItem("digi-middleware-auth-app", digitoken);
      }
    }

    const urlLanguage = urlParams.get('language');

    if (urlLanguage) {
      if (!localStorage.getItem("language") || localStorage.getItem("language") !== urlLanguage) {
        localStorage.setItem("language", urlLanguage);
        i18n.changeLanguage(urlLanguage);
      }
    } else {
      // 如果缓存里没有，或者缓存里的和链接上的不一致，就更新缓存
      if (localStorage.getItem("language")) {
        i18n.changeLanguage(localStorage.getItem("language") || 'en');
      }
    }
    // 通知后端语言切换
    changeLanguage(i18n.language);
  }, [])

  useEffect(() => {
    if (!sidebarPinned) {
      menuDropdownRef?.current?.close();
    }
    useMenuRef?.current?.close();
  }, [location]);


  const changeLanguage = async (language) => {

    const BACKEND_LANG_MAP = {
      zh: 'zh-hans',
      tc: 'zh-hant',
      en: 'en',
    };

    await api.callApi("apiLanguage", {
      body: {
        language: BACKEND_LANG_MAP[language] || 'en',
      }
    });
  }

  return (
    <div className={contentClass}>
      {enabled && (
        <div className={menubarClass}>
          <Dropdown.Trigger dropdown={menuDropdownRef} closeOnClickOutside={!sidebarPinned}>
            <div className={`${menubarClass.elem("trigger")} main-menu-trigger`}>
              <LSLogo className={`${menubarClass.elem("logo")}`} alt="Logo" />
              <Hamburger opened={sidebarOpened} />
            </div>
          </Dropdown.Trigger>

          <div className={menubarContext}>
            <LeftContextMenu className={contextItem.mod({ left: true })} />
            <RightContextMenu className={contextItem.mod({ right: true })} />
          </div>

          <div className={menubarClass.elem("hotkeys")}>
            <div className={menubarClass.elem("hotkeys-button")}>
              <Button
                variant="neutral"
                look="outlined"
                tooltip={t("components.menubar.keyboard_shortcuts")}
                data-testid="hotkeys-button"
                size="small"
                onClick={() => {
                  openHotkeyHelp([
                    "annotation",
                    "data_manager",
                    "regions",
                    "tools",
                    "audio",
                    "video",
                    "timeseries",
                    "image_gallery",
                  ]);
                }}
                icon={<IconHotkeys />}
              />
            </div>
          </div>

          {/* {ff.isActive(ff.FF_THEME_TOGGLE) && <ThemeToggle />} */}

          {/* <Dropdown.Trigger
            ref={useMenuRef}
            align="right"
            content={
              <Menu>
                <Menu.Item
                  icon={<IconPersonInCircle />}
                  label="Account &amp; Settings"
                  href={pages.AccountSettingsPage.path}
                />
                <Menu.Item icon={<IconDoor />} label="Log Out" href={absoluteURL("/logout")} data-external />
                {showNewsletterDot && (
                  <>
                    <Menu.Divider />
                    <Menu.Item className={cn("newsletter-menu-item")} href={pages.AccountSettingsPage.path}>
                      <span>Please check new notification settings in the Account & Settings page</span>
                      <span className={cn("newsletter-menu-badge")} />
                    </Menu.Item>
                  </>
                )}
              </Menu>
            }
          >
            <div title={user?.email} className={menubarClass.elem("user")}>
              <Userpic user={user} isInProgress={isLoading} />
              {showNewsletterDot && <div className={menubarClass.elem("userpic-badge")} />}
            </div>
          </Dropdown.Trigger> */}
        </div>
      )}

      <VersionProvider>
        <div className={contentClass.elem("body")}>
          {enabled && (
            <Dropdown
              ref={menuDropdownRef}
              onToggle={sidebarToggle}
              onVisibilityChanged={() => window.dispatchEvent(new Event("resize"))}
              visible={sidebarOpened}
              className={[sidebarClass, sidebarClass.mod({ floating: !sidebarPinned })].join(" ")}
              style={{ width: 240 }}
            >
              <Menu>
                {isFF(FF_HOMEPAGE) && <Menu.Item label={ t("components.menubar.home") } to="/" icon={<IconHome />} data-external exact />}
                <Menu.Item label={ t("components.menubar.projects") } to="/projects" icon={<IconFolder />} data-external exact />
                {/* <Menu.Item label="Organization" to="/organization" icon={<IconPeople />} data-external exact /> */}

                <Menu.Spacer />

                {/* <VersionNotifier showNewVersion /> */}

                <Menu.Item
                  label={t("components.menubar.api")}
                  href="https://api.labelstud.io/api-reference/introduction/getting-started"
                  icon={<IconTerminal />}
                  target="_blank"
                />
                <Menu.Item label={t("components.menubar.docs")} href="https://labelstud.io/guide" icon={<IconBook />} target="_blank" />
                {/* <Menu.Item
                  label="GitHub"
                  href="https://github.com/HumanSignal/label-studio"
                  icon={<IconGithub />}
                  target="_blank"
                  rel="noreferrer"
                /> */}
                {/* <Menu.Item
                  label="Slack Community"
                  href="https://slack.labelstud.io/?source=product-menu"
                  icon={<IconSlack />}
                  target="_blank"
                  rel="noreferrer"
                /> */}

                {/* <VersionNotifier showCurrentVersion /> */}

                <Menu.Divider />

                <Menu.Item
                  icon={<IconPin />}
                  className={sidebarClass.elem("pin")}
                  onClick={sidebarPin}
                  active={sidebarPinned}
                >
                  {sidebarPinned ? t("components.menubar.unpin_menu") : t("components.menubar.pin_menu")}
                </Menu.Item>
              </Menu>
            </Dropdown>
          )}

          <MenubarContext.Provider value={providerValue}>
            <div className={contentClass.elem("content").mod({ withSidebar: sidebarPinned && sidebarOpened })}>
              {children}
            </div>
          </MenubarContext.Provider>
        </div>
      </VersionProvider>
    </div>
  );
};
