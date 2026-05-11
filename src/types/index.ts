export const MODULE_NAME = 'reacting-deep';

export interface ReactingDeepConfigSettingConfig {
  'reacting-deep.apiKeyDeepSeek': string;
  'reacting-deep.targetModel': string;
  'reacting-deep.apiEndpoint': string;
  'reacting-deep.chatButtonRoles': string;
}

// Simple namespace type for compatibility
export type ReactingDeepNamespace = typeof MODULE_NAME | string;

type GetKeys<
  N extends string,
  SettingPath extends PropertyKey,
> = SettingPath extends `${N}.${infer Name}` ? Name : never;
export type KeyFor<N extends ReactingDeepNamespace> = GetKeys<
  N,
  keyof ReactingDeepConfigSettingConfig
>;
