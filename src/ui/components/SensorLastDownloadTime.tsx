import React, { FC } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../common/store/store';
import { SensorStatusSelector } from '../../features';
import { useFormatter } from '../hooks';
import { NormalText } from '../presentation/typography';

interface SensorLastDownloadTimeProps {
  id: string;
}

export const SensorLastDownloadTime: FC<SensorLastDownloadTimeProps> = ({ id }) => {
  const formatter = useFormatter();
  const lastDownload = useSelector((state: RootState) =>
    SensorStatusSelector.lastDownloadTime(state, { id, formatter })
  );

  return <NormalText>{lastDownload}</NormalText>;
};
