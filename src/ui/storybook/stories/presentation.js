import { View } from 'react-native';
import { storiesOf } from '@storybook/react-native';

import { Switch, Divider } from '~presentation';
import { Slider } from '../../presentation';

const DividerStories = {
  basic: () => (
    <View style={{ height: '100%', width: '100%', marginTop: 50 }}>
      <Divider />
    </View>
  ),
};

Object.entries(DividerStories).forEach(([key, value]) => {
  storiesOf('Divider', module).add(key, value);
});

const SwitchStories = {
  enabled: () => <Switch isEnabled />,
  disabled: () => <Switch isEnabled={false} />,
};

Object.entries(SwitchStories).forEach(([key, value]) => {
  storiesOf('Switch', module).add(key, value);
});

const SliderStories = {
  basic: () => <Slider />,
  disabled: () => <Switch isEnabled={false} />,
};

Object.entries(SliderStories).forEach(([key, value]) => {
  storiesOf('Slider', module).add(key, value);
});
