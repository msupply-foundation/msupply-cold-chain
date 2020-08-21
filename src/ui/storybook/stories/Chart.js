import moment from 'moment';
import { storiesOf } from '@storybook/react-native';
import { Chart } from '~presentation';

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

const ChartStories = {
  basic: () => <Chart data={getData(30)} />,
  'Bit more data': () => <Chart data={getData(300)} />,
  'Heaps more data': () => <Chart data={getData(3000)} />,
};

Object.entries(ChartStories).forEach(([key, value]) => {
  storiesOf('Chart', module).add(key, value);
});
