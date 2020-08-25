import { View } from 'react-native';
import { storiesOf } from '@storybook/react-native';

import { Button, HalfCircleButton } from '../../components/buttons';

import { Chevron } from '../../presentation/icons';

const ButtonStories = {
  basic: () => (
    <View style={{ height: '100%', width: '50%', marginTop: 50 }}>
      <Button text="Press Me" />
    </View>
  ),
};

Object.entries(ButtonStories).forEach(([key, value]) => {
  storiesOf('Button', module).add(key, value);
});

const HalfCircleButtonStories = {
  left: () => (
    <View style={{ height: '100%', width: '50%', margin: 200 }}>
      <HalfCircleButton Icon={<Chevron direction="left" />} direction="left" />
    </View>
  ),
  right: () => (
    <View style={{ height: '100%', width: '50%', margin: 200 }}>
      <HalfCircleButton Icon={<Chevron direction="right" />} direction="right" />
    </View>
  ),
};

Object.entries(HalfCircleButtonStories).forEach(([key, value]) => {
  storiesOf('HalfCircleButton', module).add(key, value);
});
