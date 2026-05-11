import { Translator } from "../translator";
import { KeyFor, ReactingDeepNamespace } from "../types";

// Declare Foundry VTT globals
declare const game: any;
declare const Hooks: any;
declare const $: any;

export class ReactingDeepSettingHandler {
  gameSettings: any = game?.settings;
  readonly settings = {
    apiKeyDeepSeek: {
      name: "reacting-deep.settings.apiKeyDeepSeek.name",
      hint: "reacting-deep.settings.apiKeyDeepSeek.hint",
      scope: "world",
      config: true,
      type: String,
      default: "",
      masked: true,
    },
    apiEndpoint: {
      name: "reacting-deep.settings.apiEndpoint.name",
      hint: "reacting-deep.settings.apiEndpoint.hint",
      scope: "world",
      config: true,
      type: String,
      default: "https://api.deepseek.com",
    },
    targetModel: {
      name: "reacting-deep.settings.model.name",
      hint: "reacting-deep.settings.model.hint",
      scope: "world",
      config: true,
      type: String,
      default: "deepseek-chat",
      choices: {},
    },
    chatButtonRoles: {
      name: "reacting-deep.settings.chatButtonRoles.name",
      hint: "reacting-deep.settings.chatButtonRoles.hint",
      scope: "world",
      config: true,
      type: String,
      default: "GAMEMASTER,ASSISTANT",
    },
  };

  constructor() {}

  async init(): Promise<void> {
    await this._registerSettings();
    this._registerRefreshButton();
    this._registerChatButton();
  }

  private _registerRefreshButton(): void {
    // Foundry v13 uses "renderSettingsConfig", fallback also handles "renderApplication"
    const addBtn = (_app: any, html: any) => {
      const modelRow = html.find(`[name="reacting-deep.targetModel"]`).closest(".form-group");
      if (!modelRow.length) return;
      if (modelRow.find(".translate-refresh-btn").length) return;

      const btn = $(`<button type="button" class="translate-refresh-btn" style="margin-top:4px;width:100%;">
        <i class="fas fa-sync-alt"></i> Refresh Models
      </button>`);

      btn.on("click", async () => {
        btn.prop("disabled", true).find("i").addClass("fa-spin");
        const models = await Translator.getModels();
        if (models) {
          const select = html.find(`[name="reacting-deep.targetModel"]`);
          const current = select.val();
          select.empty();
          for (const [id, label] of Object.entries(models)) {
            select.append(`<option value="${id}" ${id === current ? "selected" : ""}>${label}</option>`);
          }
        }
        btn.prop("disabled", false).find("i").removeClass("fa-spin");
      });

      modelRow.append(btn);
    };

    Hooks.on("renderSettingsConfig", addBtn);
    Hooks.on("renderApplication", addBtn);
  }

  private _registerChatButton(): void {
    Hooks.on("renderSidebarTab", (app: any, html: any) => {
      // Проверяем, есть ли у пользователя доступ к кнопке
      const allowedRoles = ReactingDeepSettingHandler.getSetting("reacting-deep", "chatButtonRoles") as string;
      const userRoles = allowedRoles.split(',').map((r: string) => r.trim());
      const userRole = game?.user?.role || 0;
      
      // Проверяем доступ по роли (1=GAMEMASTER, 2=ASSISTANT, 3=PLAYER)
      const hasAccess = userRoles.some((role: string) => {
        if (role === "GAMEMASTER" && userRole === 1) return true;
        if (role === "ASSISTANT" && userRole === 2) return true;
        if (role === "PLAYER" && userRole === 3) return true;
        return false;
      });

      if (!hasAccess) return;

      // Создаем кнопку для чата с DeepSeek
      const button = $(`
        <button class="reacting-deep-chat-btn" style="
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 8px;
          padding: 10px 16px;
          margin: 10px;
          cursor: pointer;
          font-weight: bold;
          display: flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
        ">
          <i class="fas fa-robot" style="font-size: 1.2em;"></i>
          <span>Chat with DeepSeek</span>
        </button>
      `);

      button.on("click", () => {
        ReactingDeepSettingHandler.openChatDialog();
      });

      button.on("mouseenter", function(this: any) {
        $(this).css({
          transform: "translateY(-2px)",
          boxShadow: "0 6px 12px rgba(0, 0, 0, 0.15)"
        });
      });

      button.on("mouseleave", function(this: any) {
        $(this).css({
          transform: "translateY(0)",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)"
        });
      });

      // Добавляем кнопку в Sidebar Controls
      const controls = html.find(".sidebar-tab[data-tab='controls']");
      if (controls.length) {
        controls.append(button);
      }
    });
  }

  static openChatDialog(): void {
    new ChatDialog().render(true);
  }

  private async _registerSettings(): Promise<void> {
    this._register("reacting-deep" as ReactingDeepNamespace, "apiKeyDeepSeek" as KeyFor<ReactingDeepNamespace>, this.settings.apiKeyDeepSeek);
    this._register("reacting-deep" as ReactingDeepNamespace, "apiEndpoint" as KeyFor<ReactingDeepNamespace>, this.settings.apiEndpoint);

    const models = await Translator.getModels();
    if (models) {
      this.settings.targetModel.choices = models;
    }

    this._register("reacting-deep" as ReactingDeepNamespace, "targetModel" as KeyFor<ReactingDeepNamespace>, this.settings.targetModel);
    this._register("reacting-deep" as ReactingDeepNamespace, "chatButtonRoles" as KeyFor<ReactingDeepNamespace>, this.settings.chatButtonRoles);
  }

  _register(namespace: ReactingDeepNamespace, key: KeyFor<ReactingDeepNamespace>, config: any): void {
    this.gameSettings.register(namespace as "core", key as KeyFor<"core">, config);
  }

  static getSetting(
    namespace: ReactingDeepNamespace,
    key: KeyFor<ReactingDeepNamespace>,
  ): string | boolean | number | object | undefined {
    const gameSettings = game.settings!;
    return gameSettings.get(namespace as "core", key as KeyFor<"core">);
  }
}

class ChatDialog {
  static get defaultOptions() {
    return {
      title: "DeepSeek Chat",
      template: "modules/reacting-deep/templates/chat-dialog.html",
      width: 600,
      height: 700,
      resizable: true,
    };
  }

  render(force?: boolean): any {
    // Simple render implementation
    const app = this as any;
    app._render(force);
    return app;
  }

  getData() {
    return {
      messages: [],
    };
  }

  activateListeners(html: any): void {
    const sendBtn = html.find(".chat-send-btn");
    const input = html.find(".chat-input");
    const messagesContainer = html.find(".chat-messages");

    sendBtn.on("click", async () => {
      const message = input.val() as string;
      if (!message.trim()) return;

      // Добавляем сообщение пользователя
      this.addMessage(messagesContainer, "user", message);
      input.val("");

      // Отправляем запрос к DeepSeek
      try {
        const response = await Translator.chatWithDeepSeek(message);
        this.addMessage(messagesContainer, "assistant", response || "No response from DeepSeek");
      } catch (error) {
        this.addMessage(messagesContainer, "error", `Error: ${error}`);
      }
    });

    input.on("keypress", (e: any) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendBtn.trigger("click");
      }
    });
  }

  private addMessage(container: any, type: string, content: string): void {
    const messageClass = type === "user" ? "user-message" : type === "assistant" ? "assistant-message" : "error-message";
    const icon = type === "user" ? "fas fa-user" : type === "assistant" ? "fas fa-robot" : "fas fa-exclamation-triangle";
    
    const message = $(`
      <div class="chat-message ${messageClass}">
        <div class="message-icon"><i class="${icon}"></i></div>
        <div class="message-content">${content}</div>
      </div>
    `);
    
    container.append(message);
    container.scrollTop(container[0].scrollHeight);
  }

  // Simple implementation for Foundry VTT compatibility
  private _render(force?: boolean): void {
    // This would be implemented by Foundry VTT
  }
}
