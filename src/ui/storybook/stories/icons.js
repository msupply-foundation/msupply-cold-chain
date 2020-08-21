import { View } from 'react-native';
import { storiesOf } from '@storybook/react-native';

import { LowBattery, Chevron, ColdBreach, HotBreach } from '~presentation/icons';

const ChevronStories = {
  left: () => (
    <View style={{ height: '100%', width: '100%', justifyContent: 'center', alignItems: 'center' }}>
      <Chevron direction="left" size={70} />
    </View>
  ),
  right: () => (
    <View style={{ height: '100%', width: '100%', justifyContent: 'center', alignItems: 'center' }}>
      <Chevron direction="right" size={70} />
    </View>
  ),
};

Object.entries(ChevronStories).forEach(([key, value]) => {
  storiesOf('Chevron', module).add(key, value);
});

const HotBreachStories = {
  basic: () => (
    <View style={{ height: '100%', width: '100%', justifyContent: 'center', alignItems: 'center' }}>
      <HotBreach />
    </View>
  ),
};

Object.entries(HotBreachStories).forEach(([key, value]) => {
  storiesOf('HotBreach', module).add(key, value);
});

const ColdBreachStories = {
  basic: () => (
    <View style={{ height: '100%', width: '100%', justifyContent: 'center', alignItems: 'center' }}>
      <ColdBreach />
    </View>
  ),
};

Object.entries(ColdBreachStories).forEach(([key, value]) => {
  storiesOf('ColdBreach', module).add(key, value);
});

const LowBatteryStories = {
  basic: () => (
    <View style={{ height: '100%', width: '100%', justifyContent: 'center', alignItems: 'center' }}>
      <LowBattery />
    </View>
  ),
};

Object.entries(LowBatteryStories).forEach(([key, value]) => {
  storiesOf('LowBattery', module).add(key, value);
});
