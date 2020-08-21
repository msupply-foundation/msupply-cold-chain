import { storiesOf } from '@storybook/react-native';
import * as Yup from 'yup';
import { MainSettingsScreen } from '~screens/settings';
import {
  SettingsNumberInputModal,
  SettingsEditModal,
  SettingsTextEditModal,
} from '~components/settings';
import { Slider } from '~presentation';

const MainSettingsScreenStories = {
  basic: () => <MainSettingsScreen />,
};

Object.entries(MainSettingsScreenStories).forEach(([key, value]) => {
  storiesOf('MainSettingsScreen', module).add(key, value);
});

const SettingsEditModalStories = {
  basic: () => <SettingsEditModal title="Title here" Content={<Slider style={{ width: 600 }} />} />,
};

Object.entries(SettingsEditModalStories).forEach(([key, value]) => {
  storiesOf('SettingsEditModal', module).add(key, value);
});

const SettingsNumberInputModalStories = {
  basic: () => (
    <SettingsNumberInputModal
      title="Temperature range"
      initialSliderValue={30}
      maximumValue={999}
      minimumValue={10}
      step={7}
    />
  ),
  'with picker': () => (
    <SettingsNumberInputModal
      title="Temperature range"
      initialSliderValue={30}
      maximumValue={999}
      minimumValue={10}
      step={7}
      pickerOptions={[
        { value: 'Ada', label: 'Lovelace' },
        { value: 'Charles', label: 'Babbage' },
      ]}
      initialPickerValue="Babbage"
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
