declare module 'flarum/common/Application' {
  export default interface Application {
    /**
     * Set by fof/forum-widgets-core, an optional integration, so it may be absent.
     * Only the method this extension calls is typed, to avoid depending on its typings.
     */
    widgets?: {
      addPage(page: Function | string): unknown;
    };
  }
}

export {};
