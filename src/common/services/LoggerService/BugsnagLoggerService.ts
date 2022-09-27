// TODO: Bugsnag logging service

export class BugsnagLoggerService {
  breadcrumb(): void {
    // TODO
  }

  notify(): void {
    // TODO
  }

  debug(): void {}
  info(): void {}
  warn(): void {}
  error(): void {}

  emailLogFiles(): Promise<void> {
    return new Promise(resolve => resolve());
  }

  setEnabled(): void {}
  setCaptureConsole(): void {}
  setLogLevel(): void {}
}
