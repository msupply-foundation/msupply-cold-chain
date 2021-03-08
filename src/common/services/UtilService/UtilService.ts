import generateUUID from 'react-native-uuid';

export class UtilService {
  uuid = (): string => generateUUID.v1();
}
