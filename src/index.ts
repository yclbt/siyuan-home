import { mount, unmount } from "svelte";
import { Plugin } from "siyuan";

import { configManager } from "@/libs/config";
import { eventBus } from "@/libs/eventBus";
import { isMobile } from "@/libs/utils";
import HomepagePanel from "./homepage/HomepagePanel.svelte";
import HomepageSettings from "./homepage/settings/HomepageSettings.svelte";

const TAB_TYPE = "homepage_pro_tab";
const TAB_ID = "siyuan-homepage-pro-tab";
const DOCK_TYPE = "homepage_pro_dock";
const SETTINGS_TAB_TYPE = "homepage_pro_settings_tab";

declare global {
  interface Window {
    siyuanHomepage?: {
      plugin: PluginHomepage;
    };
  }
}

export default class PluginHomepage extends Plugin {
  private homepageInstance: Record<string, any> | null = null;
  private homepageTabDiv: HTMLDivElement | null = null;
  private settingsInstance: Record<string, any> | null = null;
  private sidebarDockInstance: Record<string, any> | null = null;
  private isMobileDevice = false;

  async onload() {
    console.log("[Homepage Pro] Loading...");

    // 加载配置
    await configManager.load();

    // 检测设备类型
    this.isMobileDevice = isMobile();
    window.addEventListener("resize", () => {
      const mobile = isMobile();
      if (mobile !== this.isMobileDevice) {
        this.isMobileDevice = mobile;
        eventBus.emit("homepage:mobile-toggle", { mobile });
      }
    });

    // 暴露插件实例给全局
    window.siyuanHomepage = { plugin: this };

    // 注册主页标签页
    this.addTab({
      type: TAB_TYPE,
      id: TAB_ID,
      app: this.app,
      icon: "iconHomepage",
      init: () => {
        this.homepageTabDiv = document.createElement("div");
        this.homepageTabDiv.style.height = "100%";
        this.homepageTabDiv.style.overflow = "auto";

        this.homepageInstance = mount(HomepagePanel, {
          target: this.homepageTabDiv,
          props: {
            plugin: this,
            isMobile: this.isMobileDevice,
          },
        });

        return this.homepageTabDiv;
      },
      destroy: () => {
        if (this.homepageInstance) {
          unmount(this.homepageInstance);
          this.homepageInstance = null;
        }
        this.homepageTabDiv = null;
      },
    });

    // 注册停靠栏（侧边栏）
    this.addDock({
      type: DOCK_TYPE,
      tab: TAB_TYPE,
      index: 0,
      title: "主页",
      icon: "iconHomepage",
      hotkey: "⌘H",
      position: "LeftTop",
    });

    // 注册设置入口
    this.addTab({
      type: SETTINGS_TAB_TYPE,
      id: `${TAB_ID}-settings`,
      app: this.app,
      icon: "iconSettings",
      init: () => {
        const div = document.createElement("div");
        div.style.height = "100%";
        div.style.overflow = "auto";
        this.settingsInstance = mount(HomepageSettings, {
          target: div,
          props: { plugin: this },
        });
        return div;
      },
      destroy: () => {
        if (this.settingsInstance) {
          unmount(this.settingsInstance);
          this.settingsInstance = null;
        }
      },
    });

    // 监听事件
    eventBus.on("homepage:config-changed", () => {
      // 配置变化时自动保存
    });

    console.log("[Homepage Pro] Loaded successfully");
  }

  onunload() {
    console.log("[Homepage Pro] Unloading...");
    eventBus.clear();
    window.siyuanHomepage = undefined;
  }

  openSettings() {
    this.openTab({
      id: `${TAB_ID}-settings`,
      type: SETTINGS_TAB_TYPE,
      app: this.app,
    });
  }

  /** 打开指定文档 */
  openDoc(docId: string) {
    try {
      // 通过思源内置方法打开文档
      const siyuan = (window as any).siyuan;
      if (siyuan?.openTab) {
        siyuan.openTab({ id: docId, app: this.app });
      }
    } catch (e) {
      console.error("[Homepage] Failed to open doc:", e);
    }
  }

  /** 获取是否移动端 */
  get isMobile(): boolean {
    return this.isMobileDevice;
  }
}
