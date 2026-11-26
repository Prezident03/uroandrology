import type en from "@/messages/en.json";

export type Messages = typeof en;

type Join<K, P> = K extends string ? (P extends string ? `${K}.${P}` : never) : never;
type Leaves<T> = T extends string
  ? never
  : { [K in keyof T]: T[K] extends string ? K & string : Join<K, Leaves<T[K]>> }[keyof T];

/** Every valid dot-path into the message files, e.g. "nav.dashboard". */
export type MessageKey = Leaves<Messages>;
export type TranslateVars = Record<string, string | number>;
export type Translator = (key: MessageKey, vars?: TranslateVars) => string;

export function createTranslator(messages: Messages): Translator {
  return (key, vars) => {
    const value = key
      .split(".")
      .reduce<unknown>((node, part) => (node as Record<string, unknown> | undefined)?.[part], messages);
    if (typeof value !== "string") {
      if (process.env.NODE_ENV !== "production") console.warn(`[i18n] missing key: ${key}`);
      return key;
    }
    return vars ? value.replace(/\{(\w+)\}/g, (_, name: string) => String(vars[name] ?? `{${name}}`)) : value;
  };
}
