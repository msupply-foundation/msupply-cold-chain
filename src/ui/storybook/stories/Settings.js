import { storiesOf } from '@storybook/react-native';
import { Provider } from 'react-redux';
import * as Yup from 'yup';
import { MainSettingsScreen } from '~screens/settings';
import {
  SettingsNumberInputModal,
  SettingsEditModal,
  SettingsTextEditModal,
  SettingsAddSensorModal,
} from '~components/settings';
import { Slider } from '~presentation';
import { store } from '~store';

const MainSettingsScreenStories = {
  basic: () => <MainSettingsScreen />,
};

Object.entries(MainSettingsScreenStories).forEach(([key, value]) => {
  storiesOf('MainSettingsScreen', module).add(key, value);
});

const SettingsEditModalStories = {
  basic: () => (
    <SettingsEditModal isOpen title="Title here" Content={<Slider style={{ width: 600 }} />} />
  ),
};

Object.entries(SettingsEditModalStories).forEach(([key, value]) => {
  storiesOf('SettingsEditModal', module).add(key, value);
});

const SettingsNumberInputModalStories = {
  basic: () => (
    <SettingsNumberInputModal
      title="Temperature range"
      initialValue={30}
      maximumValue={999}
      minimumValue={10}
      step={7}
    />
  ),
};

Object.entries(SettingsNumberInputModalStories).forEach(([key, value]) => {
  storiesOf('SettingsNumberInputModal', module).add(key, value);
});

const SettingsTextEditModalStories = {
  basic: () => (
    <SettingsTextEditModal
      title="Change sensor name"
      initialValue="Hello!"
      validation={Yup.string()
        .min(1, 'Must not be empty!')
        .max(20, 'Must be less than 20 characters!')
        .required('Required!')}
      onConfirm={(...props) => console.log(...props)}
    />
  ),
};

Object.entries(SettingsTextEditModalStories).forEach(([key, value]) => {
  storiesOf('SettingsTextEditModal', module).add(key, value);
});

const SettingsAddSensorModalStories = {
  basic: () => (
    <Provider store={store}>
      <SettingsAddSensorModal isOpen />
    </Provider>
  ),
};

Object.entries(SettingsAddSensorModalStories).forEach(([key, value]) => {
  storiesOf('SettingsAddSensorModal', module).add(key, value);
});
