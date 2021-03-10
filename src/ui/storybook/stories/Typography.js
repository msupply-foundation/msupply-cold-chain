import { View } from 'react-native';
import { storiesOf } from '@storybook/react-native';

import {
  Header,
  NormalText,
  BoldText,
  LargeText,
  MediumText,
  SmallText,
} from '~presentation/typography';
import { COLOUR } from '~constants';

const HeaderStories = {
  basic: () => <Header>Hello Storybook</Header>,
  temperature: () => <Header>3.2c</Header>,
  'long text': () => (
    <Header>
      Hello Storybookkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk
    </Header>
  ),
};

Object.entries(HeaderStories).forEach(([key, value]) => {
  storiesOf('Header', module).add(key, value);
});

const NormalTextStories = {
  basic: () => <NormalText>Hello Storybook</NormalText>,
  'with white': () => (
    <View style={{ backgroundColor: 'black' }}>
      <NormalText colour={COLOUR.OFF_WHITE}>3.2c</NormalText>
    </View>
  ),
  'long text': () => (
    <NormalText>
      Hello Storybookkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk
    </NormalText>
  ),
};

Object.entries(NormalTextStories).forEach(([key, value]) => {
  storiesOf('NormalWhite', module).add(key, value);
});

const BoldTextStories = {
  basic: () => <BoldText>Hello Storybook</BoldText>,
  'with white': () => (
    <View style={{ backgroundColor: 'black' }}>
      <BoldText colour={COLOUR.OFF_WHITE}>3.2c</BoldText>
    </View>
  ),
  'long text': () => (
    <BoldText>
      Hello Storybookkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk
    </BoldText>
  ),
};

Object.entries(BoldTextStories).forEach(([key, value]) => {
  storiesOf('BoldText', module).add(key, value);
});

const SmallTextStories = {
  basic: () => <SmallText>Hello Storybook</SmallText>,
  'with white': () => (
    <View style={{ backgroundColor: 'black' }}>
      <SmallText colour={COLOUR.OFF_WHITE}>3.2c</SmallText>
    </View>
  ),
  'long text': () => (
    <SmallText>
      Hello Storybookkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk
    </SmallText>
  ),
};

Object.entries(SmallTextStories).forEach(([key, value]) => {
  storiesOf('SmallText', module).add(key, value);
});

const MediumTextStories = {
  basic: () => <MediumText>Hello Storybook</MediumText>,
  'with white': () => (
    <View style={{ backgroundColor: 'black' }}>
      <MediumText colour={COLOUR.OFF_WHITE}>3.2c</MediumText>
    </View>
  ),
  'long text': () => (
    <MediumText>
      Hello Storybookkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk
    </MediumText>
  ),
};

Object.entries(MediumTextStories).forEach(([key, value]) => {
  storiesOf('MediumText', module).add(key, value);
});

const LargeTextStories = {
  basic: () => <LargeText>Hello Storybook</LargeText>,
  'with white': () => (
    <View style={{ backgroundColor: 'black' }}>
      <LargeText color={COLOUR.OFF_WHITE}>3.2c</LargeText>
    </View>
  ),
  'long text': () => (
    <LargeText>
      Hello Storybookkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk
    </LargeText>
  ),
};

Object.entries(LargeTextStories).forEach(([key, value]) => {
  storiesOf('LargeText', module).add(key, value);
});
