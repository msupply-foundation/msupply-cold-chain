import { storiesOf } from '@storybook/react-native';

import { PinEntry } from '~components';

const PinEntryStories = {
  basic: () => <PinEntry />,
};

Object.entries(PinEntryStories).forEach(([key, value]) => {
  storiesOf('PinEntry', module).add(key, value);
});
