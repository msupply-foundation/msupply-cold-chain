import { storiesOf } from '@storybook/react-native';
import { LargeHeader } from '../../presentation/typography/LargeHeader';

const stories = {
  basic: () => <LargeHeader>Hello Storybook</LargeHeader>,
  temperature: () => <LargeHeader>3.2c</LargeHeader>,
  'long text': () => (
    <LargeHeader>
      Hello Storybookkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk
    </LargeHeader>
  ),
};

Object.entries(stories).forEach(([key, value]) => {
  storiesOf('LargeHeader', module).add(key, value);
});
