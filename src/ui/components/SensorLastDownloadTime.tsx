import React, { FC } from 'react';
import { useSelector } from 'react-redux';
import { FormatService } from '../../common/services';
import { RootState } from '../../common/store/store';
import { SensorStatusSelector } from '../../features';
import { withFormatService } from '../hoc/withFormatService';
import { NormalText } from '../presentation/typography';

interface SensorLastDownloadTimeProps {
  id: string;
  formatter: FormatService;
}

export const SensorLastDownloadTimeComponent: FC<SensorLastDownloadTimeProps> = props => {
  const lastDownload = useSelector((state: RootState) =>
    SensorStatusSelector.lastDownloadTime(state, props)
  );

  return <NormalText>{lastDownload}</NormalText>;
};

export const SensorLastDownloadTime = withFormatService(SensorLastDownloadTimeComponent);
