import { FileLogger, LogLevel as FileLogLevel } from 'react-native-file-logger';
import { LogLevel } from 'react-native-ble-plx';

export class FileLoggerService {
  public enabled = false;
  public captureConsole = false;
  public logLevel = FileLogLevel.Warning;
  isDevelopment;

  constructor(isDevelopment?: boolean) {
    const { captureConsole, logLevel } = this;
    FileLogger.configure({
      captureConsole,
      logLevel,
      maximumFileSize: 1024 * 1024 * 5,
      maximumNumberOfFiles: 10,
    });
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

  public trace(error: string | Error): void {
    if (this.enabled) FileLogger.debug(String(error));
  }
  public debug(error: string | Error): void {
    if (this.enabled) FileLogger.debug(String(error));
  }
  public info(error: string | Error): void {
    if (this.enabled) FileLogger.info(String(error));
  }
  public warn(error: string | Error): void {
    if (this.enabled) FileLogger.warn(String(error));
  }
  public error(error: string | Error): void {
    if (this.enabled) FileLogger.error(String(error));
  }
  public fatal(error: string | Error): void {
    if (this.enabled) FileLogger.error(String(error));
  }

  public emailLogFiles({
    to,
    subject = 'mSupply Cold Chain logs',
    body = 'Developer logs from mSupply cold chain',
  }: {
    to?: string;
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
    if (logLevel === LogLevel.None) {
      this.enabled = false;
      return;
    }

    this.logLevel = this.mapLogLevel(logLevel);
    FileLogger.setLogLevel(this.logLevel);
  }

  mapLogLevel = (logLevel: LogLevel): FileLogLevel => {
    switch (logLevel) {
      case LogLevel.Verbose:
      case LogLevel.Debug:
        return FileLogLevel.Debug;
      case LogLevel.Info:
        return FileLogLevel.Info;
      case LogLevel.Warning:
        return FileLogLevel.Warning;
      case LogLevel.Error:
        return FileLogLevel.Error;
      default:
        return FileLogLevel.Warning;
    }
  };
}
