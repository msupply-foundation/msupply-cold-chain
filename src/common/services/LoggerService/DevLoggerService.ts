/* eslint-disable class-methods-use-this */

export class DevLoggerService {
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
}
