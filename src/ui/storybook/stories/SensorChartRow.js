import moment from 'moment';
import { storiesOf } from '@storybook/react-native';
import { SensorChartRow } from '~components';

const getData = n => {
  const date = moment().subtract(30 * n, 'minutes');

  const getTemperature = () => Number((Math.random() * 10).toFixed(2));

  return Array.from({ length: n }).map((_, i) => ({
    timestamp: moment(date)
      .add(30 * i, 'hour')
      .toDate(),
    temperature: getTemperature(),
  }));
};

const sensor = { name: 'sensor one', temperature: '3.2c' };
const data = getData(30);

const SensorChartRowStories = {
  basic: () => <SensorChartRow sensor={sensor} logs={data} />,
};

Object.entries(SensorChartRowStories).forEach(([key, value]) => {
  storiesOf('SensorChartRow', module).add(key, value);
});
