import generateUUID from 'react-native-uuid';

export class UtilService {
  uuid = () => generateUUID.v1();
}
