import { View, Text, ActivityIndicator } from 'react-native';
import { storiesOf } from '@storybook/react-native';

import {
  SettingsList,
  SensorRowLayout,
  Row,
  Column,
  LargeRectangle,
  SettingsRowLayout,
  LoadingModalLayout,
  FullScreenModal,
} from '~layouts';
import { MediumText, NormalText, LargeText } from '~presentation/typography';
import { COLOUR } from '~constants';

import { Chevron } from '../../presentation/icons';

const A = ({ i }) => {
  return (
    <View
      style={{
        width: 100,
        height: 100,
        backgroundColor: 'red',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Text style={{ fontSize: 50, color: 'white' }}>{i}</Text>
    </View>
  );
};

const B = ({ i }) => {
  return (
    <View
      style={{
        width: 100,
        height: 100,
        backgroundColor: 'blue',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Text style={{ fontSize: 50, color: 'white' }}>{i}</Text>
    </View>
  );
};

const ColumnStories = {
  basic: () => (
    <Column>
      <A i={0} />
      <B i={1} />
    </Column>
  ),
  stacked: () => (
    <>
      <Column>
        <A i={0} />
        <B i={1} />
      </Column>
      <Column>
        <A i={0} />
        <B i={1} />
      </Column>
    </>
  ),
  nested: () => (
    <Column>
      <Column>
        <Column>
          <A i={0} />
          <B i={1} />
        </Column>
        <Column>
          <A i={0} />
          <B i={1} />
        </Column>
      </Column>
      <Column>
        <A i={0} />
        <B i={1} />
      </Column>
    </Column>
  ),
};

Object.entries(ColumnStories).forEach(([key, value]) => {
  storiesOf('Column', module).add(key, value);
});

const RowStories = {
  basic: () => (
    <Row>
      <A i={0} />
      <B i={1} />
    </Row>
  ),
  stacked: () => (
    <>
      <Row>
        <A i={0} />
        <B i={1} />
      </Row>
      <Row>
        <A i={0} />
        <B i={1} />
      </Row>
    </>
  ),
  nested: () => (
    <Row>
      <Row>
        <Row>
          <A i={0} />
          <B i={1} />
        </Row>
        <Row>
          <A i={0} />
          <B i={1} />
        </Row>
      </Row>
      <Row>
        <A i={0} />
        <B i={1} />
      </Row>
    </Row>
  ),
};

Object.entries(RowStories).forEach(([key, value]) => {
  storiesOf('Row', module).add(key, value);
});

const LargeRectangleStories = {
  basic: () => <LargeRectangle />,
  'with child': () => (
    <LargeRectangle>
      <Text>Hello World</Text>
    </LargeRectangle>
  ),
  'with transparent background': () => (
    <LargeRectangle color="transparent">
      <Text>Hello World</Text>
    </LargeRectangle>
  ),
};

Object.entries(LargeRectangleStories).forEach(([key, value]) => {
  storiesOf('LargeRectangle', module).add(key, value);
});

const SensorRowStories = {
  left: () => (
    <SensorRowLayout
      SensorStatus={<LargeRectangle />}
      Chart={<LargeRectangle />}
      direction="left"
      SensorName={<MediumText>Sensor Name1</MediumText>}
    />
  ),
  right: () => (
    <SensorRowLayout
      SensorStatus={<LargeRectangle />}
      Chart={<LargeRectangle />}
      direction="right"
      SensorName={<MediumText>Sensor Name1</MediumText>}
    />
  ),
  'big chart': () => (
    <SensorRowLayout
      SensorStatus={<LargeRectangle />}
      Chart={<View style={{ backgroundColor: 'red', height: 200, width: 500 }} />}
      direction="right"
      SensorName={<MediumText>Sensor Name1</MediumText>}
    />
  ),
};

Object.entries(SensorRowStories).forEach(([key, value]) => {
  storiesOf('SensorRowLayout', module).add(key, value);
});

const MainText = text => <Text>{text}</Text>;
const Subtext = text => <Text>{text}</Text>;
const LeftIcon = () => <View style={{ width: 50, height: 50, backgroundColor: 'red' }} />;
const RightIcon = () => <View style={{ width: 50, height: 50, backgroundColor: 'red' }} />;

const SettingsRowLayoutStories = {
  basic: () => (
    <SettingsRowLayout
      Text={MainText('main text here!')}
      Subtext={Subtext('some sub text here')}
      LeftIcon={LeftIcon()}
      RightIcon={RightIcon()}
    />
  ),
  'with long text': () => (
    <SettingsRowLayout
      Text={MainText(
        'main text here! main text here! main text here! main text here! main text here!'
      )}
      Subtext={Subtext('some sub text here')}
      LeftIcon={LeftIcon()}
      RightIcon={RightIcon()}
    />
  ),
  'with nothing passed': () => <SettingsRowLayout />,
};

Object.entries(SettingsRowLayoutStories).forEach(([key, value]) => {
  storiesOf('SettingsRowLayout', module).add(key, value);
});

const MockTextComponent = <MediumText colour={COLOUR.GREY_ONE}>Hello!</MediumText>;
const MockIcon = <Chevron direction="right" color={COLOUR.GREY_ONE} />;
const MockSubtextComponent = (
  <View style={{}}>
    <NormalText colour={COLOUR.GREY_ONE}>Hello!</NormalText>
  </View>
);
const SettingsItem = (
  <SettingsRowLayout
    Text={MockTextComponent}
    Subtext={MockSubtextComponent}
    RightIcon={MockIcon}
    LeftIcon={MockIcon}
  />
);

const SettingsListStories = {
  basic2: () => (
    <SettingsList>
      {SettingsItem}
      {SettingsItem}
      {SettingsItem}
      {SettingsItem}
      {SettingsItem}
      {SettingsItem}
      {SettingsItem}
      {SettingsItem}
      {SettingsItem}
      {SettingsItem}
      {SettingsItem}
      {SettingsItem}
    </SettingsList>
  ),
};

Object.entries(SettingsListStories).forEach(([key, value]) => {
  storiesOf('SettingsList', module).add(key, value);
});

const MockContent = <LargeText>Loading</LargeText>;
const MockLoadingIndicator = <ActivityIndicator size="large" color={COLOUR.PRIMARY} />;

const LoadingModalLayoutStories = {
  basic: () => {
    return (
      <FullScreenModal isOpen>
        <LoadingModalLayout content={MockContent} LoadingIndicator={MockLoadingIndicator} />
      </FullScreenModal>
    );
  },
};

Object.entries(LoadingModalLayoutStories).forEach(([key, value]) => {
  storiesOf('LoadingModalLayout', module).add(key, value);
});
