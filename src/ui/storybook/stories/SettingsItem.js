import { storiesOf } from '@storybook/react-native';
import { SettingsItem } from '~components/settings';

const SettingsItemStories = {
  basic: () => <SettingsItem />,
};

Object.entries(SettingsItemStories).forEach(([key, value]) => {
  storiesOf('SettingsItem', module).add(key, value);
});
