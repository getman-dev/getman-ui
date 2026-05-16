/**
 * Global ambient declarations for Svelte 5 runes.
 * These are compiler-provided globals transformed at build time by the Svelte compiler.
 */

declare function $state<T>(value: T): T;
declare function $state<T>(): T | undefined;
declare namespace $state {
  function raw<T>(value: T): T;
  function raw<T>(): T | undefined;
  function snapshot<T>(state: T): T;
}

declare function $derived<T>(expression: T): T;
declare namespace $derived {
  function by<T>(fn: () => T): T;
}

declare function $effect(fn: () => void | (() => void)): void;
declare namespace $effect {
  function pre(fn: () => void | (() => void)): void;
  function tracking(): boolean;
  function root(fn: () => void | (() => void)): () => void;
}

declare function $props<T extends Record<string, unknown>>(): T;
declare function $bindable<T>(fallback?: T): T;
declare function $inspect<T>(...values: T[]): {
  with(fn: (type: "init" | "update", ...values: T[]) => void): void;
};
declare function $host<El extends HTMLElement = HTMLElement>(): El;
