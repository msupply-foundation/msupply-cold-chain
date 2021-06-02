import { MILLISECONDS } from '~constants';
import moment from 'moment';
import generateUUID from 'react-native-uuid';
import packageJson from '~/../../package.json';

export class UtilService {
  uuid = (): string => generateUUID.v1() as string;

  now = (): number => moment().unix();

  appVersion = (): string => packageJson.version;

  // Transforms a version string in the same format we use in package.json - 0.0.3, 0.0.3-rc1 etc
  // into an integer code which can more easily be used to do range comparisons.
  getVersionCode = (versionString: string) => {
    // logic is the same as ./android/app/build.gradle.

    if (!versionString.match(/^[0-9]{1,2}.[0-9]{1,2}.[0-9]{1,2}(-rc[0-9]{1,2})?$/)) {
      throw new Error('Invalid version format!');
    }

    const [majorMinorPatch, provisional] = versionString.split('-');
    const realProvisional = Number(provisional?.slice(2) ?? 99);
    const [major, minor, patch] = majorMinorPatch.split('.').map((part: string) => Number(part));

    return major * 10000000 + minor * 100000 + patch * 100 + realProvisional;
  };

  millisecondsToMinutes = (milliseconds: number): number => {
    return milliseconds / MILLISECONDS.ONE_MINUTE;
  };
}
