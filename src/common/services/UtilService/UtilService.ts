import moment from 'moment';
import generateUUID from 'react-native-uuid';

export class UtilService {
  uuid = (): string => generateUUID.v1() as string;

  now = (): number => moment().unix();
}
