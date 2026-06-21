import { Plugin, openTab, getFrontend } from "siyuan";
import { mount, unmount } from "svelte";
import HomepagePanel from "./homepage/HomepagePanel.svelte";

const TAB_TYPE = "home_pro_tab";

export default class PluginHomepage extends Plugin {
  onload() {
    console.log("[HOME Pro] Loading...");

    const frontEnd = getFrontend();
    const isMobile = frontEnd === "mobile" || frontEnd === "browser-mobile";

    this.addIcons(`<symbol id="iconHome" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z"/>
      <path d="M9 22V12H15V22"/>
    </symbol>`);

    this.addTab({
      type: TAB_TYPE,
      init() {
        console.log("[Tab init]");
        const container = document.createElement("div");
        container.style.cssText = "height:100%;overflow:auto;";
        this.app = mount(HomepagePanel, { target: container, props: { isMobile } });
        this.element.appendChild(container);
      },
      destroy() {
        if (this.app) { unmount(this.app); this.app = null; }
      },
    });

    if (isMobile) {
      // Mobile: use dock as entry point (mobile has bottom dock)
      this.addDock({
        config: { icon: "iconHome", title: "主页", position: "LeftTop", index: 0, size: { width: 200, height: 0 } },
        data: {},
        type: "home_dock",
        init() {
          const div = document.createElement("div");
          div.style.cssText = "padding:16px;text-align:center;";
          div.textContent = "打开主页";
          div.onclick = () => {
            openTab({ app: this.app, custom: { icon: "iconHome", title: "首页", data: {}, id: this.name + TAB_TYPE } });
          };
          this.element.appendChild(div);
        },
      });
    } else {
      // Desktop: top bar button
      this.addTopBar({
        icon: "iconHome",
        title: "打开主页",
        position: "left",
        callback: () => {
          openTab({ app: this.app, custom: { icon: "iconHome", title: "首页", data: {}, id: this.name + TAB_TYPE } });
        },
      });
    }

    console.log("[HOME Pro] Loaded");
  }

  onunload() {
    console.log("[HOME Pro] Unloaded");
  }
}
