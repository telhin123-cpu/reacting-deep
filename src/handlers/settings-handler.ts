import { Translator } from "../translator";
import { KeyFor, ReactingDeepNamespace } from "../types";

// Глобальные переменные Foundry
declare const game: any;
declare const Hooks: any;
declare const $: any;
declare const Application: any;
declare const mergeObject: any;

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
      default: "https://deepseek.com",
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
    const addBtn = (_app: any, html: any) => {
      const modelRow = html.find(`[name="reacting-deep.targetModel"]`).closest(".form-group");
      if (!modelRow.length || modelRow.find(".translate-refresh-btn").length) return;

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
  }

  private _registerChatButton(): void {
    // Хук renderChatLog срабатывает при отрисовке вкладки чата в сайдбаре
    Hooks.on("renderChatLog", (_app: any, html: any) => {
      const allowedRoles = ReactingDeepSettingHandler.getSetting("reacting-deep", "chatButtonRoles") as string;
      const rolesArray = allowedRoles.split(',').map(r => r.trim());
      const userRole = game?.user?.role;

      // Соответствие имен ролей и ID в Foundry VTT
      const roleMap: Record<string, number> = {
        "PLAYER": 1,
        "ASSISTANT": 2,
        "GAMEMASTER": 3
      };

      const hasAccess = rolesArray.some(role => userRole === roleMap[role]);
      if (!hasAccess) return;

      // Создаем компактную кнопку для заголовка чата
      const button = $(`
        <a class="reacting-deep-chat-header-btn" title="Chat with DeepSeek" style="flex: 0; margin-left: 5px; cursor: pointer;">
          <i class="fas fa-robot"></i>
        </a>
      `);

      button.on("click", () => ReactingDeepSettingHandler.openChatDialog());

      // Добавляем кнопку в блок действий в заголовке чата
      const headerActions = html.find(".directory-header .header-actions");
      if (headerActions.length) {
        headerActions.append(button);
      }
    });
  }

  static openChatDialog(): void {
    const dialog = new ChatDialog();
    dialog.render(true);
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
  ): any {
    return game.settings.get(namespace, key);
  }
}

/**
 * Класс окна чата, наследующий стандартный интерфейс Foundry
 */
class ChatDialog extends Application {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      id: "reacting-deep-chat-dialog",
      title: "DeepSeek Assistant",
      template: "modules/reacting-deep/templates/chat-dialog.html",
      width: 450,
      height: 600,
      resizable: true,
      minimizable: true,
      classes: ["reacting-deep-window"]
    });
  }

  getData() {
    return {
      messages: []
    };
  }

  activateListeners(html: any): void {
    super.activateListeners(html);

    const sendBtn = html.find(".chat-send-btn");
    const input = html.find(".chat-input");
    const messagesContainer = html.find(".chat-messages");

    sendBtn.on("click", async () => {
      const message = input.val() as string;
      if (!message.trim()) return;

      this._addMessage(messagesContainer, "user", message);
      input.val("");

      try {
        const response = await Translator.chatWithDeepSeek(message);
        this._addMessage(messagesContainer, "assistant", response || "No response.");
      } catch (error) {
        this._addMessage(messagesContainer, "error", `System Error: ${error}`);
      }
    });

    input.on("keydown", (e: any) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendBtn.trigger("click");
      }
    });
  }

  private _addMessage(container: any, type: string, content: string): void {
    const icon = type === "user" ? "fa-user" : type === "assistant" ? "fa-robot" : "fa-exclamation-triangle";
    const msgHtml = $(`
      <div class="chat-message ${type}-message" style="margin-bottom: 10px; display: flex; gap: 8px;">
        <i class="fas ${icon}"></i>
        <div class="content">${content}</div>
      </div>
    `);
    container.append(msgHtml);
    container.scrollTop(container.prop("scrollHeight"));
  }
}
