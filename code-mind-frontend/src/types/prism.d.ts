declare module "prismjs" {
  const Prism: {
    highlight: (text: string, grammar: unknown, language: string) => string;
    languages: Record<string, unknown>;
  };
  export default Prism;
}

declare module "prismjs/components/*" {
  const content: unknown;
  export default content;
}

declare module "hoverintent" {
  interface HoverIntentOptions {
    sensitivity?: number;
    interval?: number;
    timeout?: number;
    handleFocus?: boolean;
  }

  interface HoverIntentInstance {
    options: (opts: HoverIntentOptions) => HoverIntentInstance;
    remove: () => void;
  }

  function hoverintent(
    el: Element,
    onOver: (e: MouseEvent) => void,
    onOut: (e: MouseEvent) => void
  ): HoverIntentInstance;

  export default hoverintent;
}
