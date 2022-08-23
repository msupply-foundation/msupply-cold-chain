import { FileLogger, LogLevel } from 'react-native-file-logger';

export class FileLoggerService {
  public enabled = false;
  public captureConsole = false;
  public logLevel = LogLevel.Debug;
  isDevelopment;

  constructor(isDevelopment?: boolean) {
    const { captureConsole, logLevel } = this;
    FileLogger.configure({ captureConsole, logLevel });
    this.isDevelopment = isDevelopment ?? false;

    // FileLogger.getLogFilePaths().then((path: string) =>
    //   console.log(`***** log path ${path} ******`)
    // );
  }

  breadcrumb(message: string): void {
    if (!this.isDevelopment) return;

    console.log('-------------------------------------');
    console.log(message);
    console.log('-------------------------------------');
  }

  public debug(message: string): void {
    if (this.enabled) FileLogger.debug(message);
  }
  public info(message: string): void {
    if (this.enabled) FileLogger.info(message);
  }
  public warn(message: string): void {
    if (this.enabled) FileLogger.warn(message);
  }
  public error(message: string): void {
    if (this.enabled) FileLogger.error(message);
  }

  public emailLogFiles({
    to,
    subject = 'mSupply Cold Chain logs',
    body = 'Developer logs from mSupply cold chain',
  }: {
    to: string;
    subject?: string;
    body?: string;
  }): Promise<void> {
    return FileLogger.sendLogFilesByEmail({ to, subject, body });
  }

  notify(error: Error, metadata: string): void {
    if (!this.isDevelopment) return;

    console.log('#####################################');
    console.log(error?.message);
    console.log(metadata);
    console.log('#####################################');
  }

  public setCaptureConsole(captureConsole: boolean): void {
    this.captureConsole = captureConsole;
    if (captureConsole) FileLogger.enableConsoleCapture();
    else FileLogger.disableConsoleCapture();
  }

  public setLogLevel(logLevel: LogLevel): void {
    this.logLevel = logLevel;
    FileLogger.setLogLevel(logLevel);
  }
}
