import { connect } from 'react-redux';

import { SensorStatusSelector } from '~features';

import { withFormatService } from '../hoc/withFormatService';
import { NormalText } from '../presentation/typography';

const stateToProps = (state, ownProps) => {
  const lastDownload = SensorStatusSelector.lastDownloadTime(state, ownProps);
  return { lastDownload };
};

export const SensorLastDownloadTimeComponent = ({ lastDownload }) => {
  return <NormalText>{lastDownload}</NormalText>;
};

export const SensorLastDownloadTime = withFormatService(
  connect(stateToProps)(SensorLastDownloadTimeComponent)
);
