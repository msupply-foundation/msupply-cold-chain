/* eslint-disable class-methods-use-this */

export class DevLoggerService {
  breadcrumb(message) {
    console.log('-------------------------------------');
    console.log(message);
    console.log('-------------------------------------');
  }

  notify(error, metadata) {
    console.log('#####################################');
    console.log(error?.message);
    console.log(metadata);
    console.log('#####################################');
  }
}
