/* eslint-disable @typescript-eslint/no-unused-vars */
export class DevLoggerService {
  public captureConsole: boolean;
  public enabled: boolean;
  public logLevel: any;

  breadcrumb(message: string): void {
    console.log('-------------------------------------');
    console.log(message);
    console.log('-------------------------------------');
  }

  notify(error: Error, metadata: string): void {
    console.log('#####################################');
    console.log(error?.message);
    console.log(metadata);
    console.log('#####################################');
  }

  debug(message: string): void {
    this.breadcrumb(message);
  }
  info(message: string): void {
    this.breadcrumb(message);
  }
  warn(message: string): void {
    this.breadcrumb(message);
  }
  error(message: string): void {
    this.breadcrumb(message);
  }

  emailLogFiles(props: { to: string; subject?: string; body?: string }): Promise<void> {
    return new Promise(resolve => resolve());
  }

  setCaptureConsole(captureConsole: boolean): void {}

  setLogLevel(logLevel: any): void {}
}
