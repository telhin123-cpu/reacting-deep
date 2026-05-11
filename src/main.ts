import { ReactingDeepSettingHandler } from "handlers/settings-handler";

// Declare Foundry VTT globals
declare const Hooks: any;
declare const game: any;
declare const ui: any;

Hooks.once("init", async () => {
  if (!game.settings) {
    ui?.notifications?.error(`Game settings are not available. This module requires Foundry VTT version 10 or later.`);
    return;
  }
  const settingHandler = new ReactingDeepSettingHandler();
  await settingHandler.init();
});
