import { FileLogger, LogLevel } from 'react-native-file-logger';

export class FileLoggerService {
  public enabled = false;
  captureConsole = true;
  public logLevel = LogLevel.Debug;

  constructor() {
    const { captureConsole, logLevel } = this;
    FileLogger.configure({ captureConsole, logLevel });
  }

  breadcrumb(message: string): void {
    console.log('-------------------------------------');
    console.log(message);
    console.log('-------------------------------------');
  }

  debug(message: string): void {
    FileLogger.debug(message);
  }
  info(message: string): void {
    FileLogger.info(message);
  }
  warn(message: string): void {
    FileLogger.warn(message);
  }
  error(message: string): void {
    FileLogger.error(message);
  }

  deleteLogFiles(): Promise<void> {
    return FileLogger.deleteLogFiles();
  }

  emailLogFiles({
    to,
    subject = 'mSupply Cold Chain Logs',
    body = 'Developer logs from mSupply cold chain',
  }: {
    to: string;
    subject?: string;
    body?: string;
  }): Promise<void> {
    return FileLogger.sendLogFilesByEmail({ to, subject, body });
  }

  notify(error: Error, metadata: string): void {
    console.log('#####################################');
    console.log(error?.message);
    console.log(metadata);
    console.log('#####################################');
  }

  //   setEnabled(enabled: boolean): void {
  //     this.enabled = enabled;
  //   }

  setCaptureConsole(captureConsole: boolean): void {
    this.captureConsole = captureConsole;
    if (captureConsole) FileLogger.enableConsoleCapture();
    else FileLogger.disableConsoleCapture();
  }

  setLogLevel(logLevel: LogLevel): void {
    this.logLevel = logLevel;
    FileLogger.setLogLevel(logLevel);
  }
}
