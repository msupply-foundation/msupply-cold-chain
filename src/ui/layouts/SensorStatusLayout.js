import { ActivityIndicator, View } from 'react-native';

import { COLOUR } from '~constants';

import { Column } from './Column';

export const SensorStatusLayout = ({
  SensorName,
  TemperatureStatus,
  SensorStatusBar,
  CumulativeBreach,
  LastDownload,
  isLoading,
}) => {
  return !isLoading ? (
    <Column flex={1}>
      <Column justifyContent="flex-end" flex={1}>
        {SensorStatusBar}
        {SensorName}
      </Column>
      <View flex={1}>{TemperatureStatus}</View>
      <Column flex={1}>
        {LastDownload}
        {CumulativeBreach}
      </Column>
    </Column>
  ) : (
    <ActivityIndicator size="large" color={COLOUR.PRIMARY} />
  );
};
