import { connect } from 'react-redux';

import { SensorSelector } from '~features';

import { withFormatService } from '../hoc/withFormatService';
import { Row } from '../layouts';
import { BatteryStatus } from './BatteryStatus';

const stateToProps = (state, ownProps) => {
  const batteryLevel = SensorSelector.getBatteryLevel(state, ownProps);

  return { batteryLevel };
};

export const SensorStatusBarComponent = ({ batteryLevel }) => {
  return (
    <Row alignItems="center" style={{ alignSelf: 'flex-start' }}>
      <BatteryStatus batteryLevel={batteryLevel} variant="small" />
    </Row>
  );
};

export const SensorStatusBar = withFormatService(connect(stateToProps)(SensorStatusBarComponent));
