import { storiesOf } from '@storybook/react-native';
import { SensorStatus } from '~components';

const SensorStatusStories = {
  basic: () => <SensorStatus />,
  'is low battery': () => <SensorStatus isLowBattery />,
  'has cold breach': () => <SensorStatus isInColdBreach />,
  'has hot breach': () => <SensorStatus isInHotBreach />,
  'has hot breach & low battery': () => <SensorStatus isInHotBreach isLowBattery />,
  'has cold breach & low battery': () => <SensorStatus isInColdBreach isLowBattery />,
};

Object.entries(SensorStatusStories).forEach(([key, value]) => {
  storiesOf('SensorStatus', module).add(key, value);
});
