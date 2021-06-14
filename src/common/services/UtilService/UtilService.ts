import { MILLISECONDS } from '~constants';
import moment from 'moment';
import generateUUID from 'react-native-uuid';
import packageJson from '~/../../package.json';
import { UnixTimestamp } from '~common/types/common';

type NumberRange = [number, number];

export class UtilService {
  uuid = (): string => generateUUID.v1() as string;

  now = (): UnixTimestamp => moment().unix();

  threeDaysAgo = (): UnixTimestamp => {
    const threeDaysAgo = moment().subtract(3, 'days');
    return threeDaysAgo.unix();
  };

  threeDaysBefore = (someDate: number): UnixTimestamp => {
    const someMoment = moment.unix(someDate);
    const threeDaysBefore = someMoment.subtract(3, 'days');
    return threeDaysBefore.unix();
  };

  appVersion = (): string => packageJson.version;

  // Transforms a version string in the same format we use in package.json - 0.0.3, 0.0.3-rc1 etc
  // into an integer code which can more easily be used to do range comparisons.
  getVersionCode = (versionString: string): number => {
    // logic is the same as ./android/app/build.gradle.

    if (!versionString.match(/^[0-9]{1,2}.[0-9]{1,2}.[0-9]{1,2}(-rc[0-9]{1,2})?$/)) {
      throw new Error('Invalid version format!');
    }

    const [majorMinorPatch, provisional] = versionString.split('-');
    const realProvisional = Number(provisional?.slice(2) ?? 99);
    const [major, minor, patch] = majorMinorPatch.split('.').map((part: string) => Number(part));

    return major * 10000000 + minor * 100000 + patch * 100 + realProvisional;
  };

  /**
   * Normalises a number within some number range i.e. [75-100] into the corresponding
   * number within 0-100.
   */
  normaliseNumber = (currentVal: number, oldRange: NumberRange, newRange = [0, 100]): number => {
    const [oldMin, oldMax] = oldRange;
    const [newMin, newMax] = newRange;

    const newVal = ((currentVal - oldMin) * (newMax - newMin)) / (oldMax - oldMin) + newMin;

    return Math.floor(newVal);
  };

  bufferFromBase64 = (base64: string): Buffer => Buffer.from(base64, 'base64');

  stringFromBase64 = (base64: string): string => this.bufferFromBase64(base64).toString('utf-8');

  base64FromString = (string: string): string => Buffer.from(string, 'utf-8').toString('base64');

  millisecondsToMinutes = (milliseconds: number): number => {
    return milliseconds / MILLISECONDS.ONE_MINUTE;
  };
}
