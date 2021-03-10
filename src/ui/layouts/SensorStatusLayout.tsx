import React, { FC, ReactNode } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { COLOUR } from '../../common/constants';
import { Column } from './Column';

interface SensorStatusLayoutProps {
  SensorName: ReactNode;
  TemperatureStatus: ReactNode;
  SensorStatusBar: ReactNode;
  CumulativeBreach: ReactNode;
  LastDownload: ReactNode;
  isLoading: ReactNode;
}

export const SensorStatusLayout: FC<SensorStatusLayoutProps> = ({
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
      <View>{TemperatureStatus}</View>
      <Column flex={1}>
        {LastDownload}
        {CumulativeBreach}
      </Column>
    </Column>
  ) : (
    <ActivityIndicator size="large" color={COLOUR.PRIMARY} />
  );
};
