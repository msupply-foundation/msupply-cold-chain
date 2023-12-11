import React, { FC, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Animated, TouchableOpacity, ViewStyle } from 'react-native';
import { MILLISECONDS, COLOUR, STYLE, FONT } from '../../common/constants';
import { SensorStatusSelector, AcknowledgeBreachAction } from '../../features';
import { Row, Centered, LargeRectangle } from '../layouts';
import { BoldText, Header, LargeText, MediumText } from '../presentation/typography';
import { Icon, ICON_SIZE } from '../presentation/icons';
import { RootState } from '../../common/store/store';

const styles: { icon: ViewStyle } = {
  icon: { position: 'absolute', left: 20, top: 0 },
};

const getAnimations = (animationValues: Animated.Value[]) => {
  return Animated.loop(
    Animated.sequence(
      animationValues.map(value => {
        return Animated.sequence([
          Animated.delay(MILLISECONDS.ONE_SECOND / 4),
          Animated.timing(value, {
            toValue: 1,
            duration: MILLISECONDS.ONE_SECOND,
            useNativeDriver: true,
          }),

          Animated.timing(value, {
            toValue: 0,
            duration: MILLISECONDS.ONE_SECOND,
            useNativeDriver: true,
          }),
        ]);
      })
    )
  );
};

interface SensorTemperatureStatusProps {
  id: string;
}

const parseTemperature = (temperature: string) => {
  const numericTemp = Number(temperature);
  if (Number.isNaN(numericTemp)) return { major: temperature };

  const major = Math.trunc(numericTemp);
  const minor = Math.trunc((numericTemp - major) * 10);

  return {
    major: String(major),
    minor: `.${minor}`,
  };
};

const Temperature: FC<{ temperature: { major: string; minor?: string } }> = ({ temperature }) => {
  if (!temperature.minor) {
    return (
      <Centered>
        <Header>{temperature}</Header>
      </Centered>
    );
  }

  return (
    <Row alignItems="flex-end" justifyContent="center">
      <Header>{temperature.major}</Header>
      <BoldText colour={COLOUR.PRIMARY} fontSize={FONT.SIZE.M} style={{ paddingBottom: 15 }}>
        {temperature.minor}
      </BoldText>
    </Row>
  );
};

export const SensorTemperatureStatusComponent: FC<SensorTemperatureStatusProps> = ({ id }) => {
  const dispatch = useDispatch();
  const startAcknowledging = () => dispatch(AcknowledgeBreachAction.startAcknowledging(id));

  const hasHotBreach = useSelector((state: RootState) =>
    SensorStatusSelector.hasHotBreach(state, { id })
  );
  const hasColdBreach = useSelector((state: RootState) =>
    SensorStatusSelector.hasColdBreach(state, { id })
  );
  const isLowBattery = useSelector((state: RootState) =>
    SensorStatusSelector.isLowBattery(state, { id })
  );
  const isInDanger = useSelector((state: RootState) =>
    SensorStatusSelector.isInDanger(state, { id })
  );
  const temperature = useSelector((state: RootState) =>
    SensorStatusSelector.currentTemperature(state, { id })
  );
  const hasData = useSelector((state: RootState) => SensorStatusSelector.hasData(state, { id }));

  const fadeAnim1 = React.useRef(new Animated.Value(0)).current;
  const fadeAnim2 = React.useRef(new Animated.Value(0)).current;
  const fadeAnim3 = React.useRef(new Animated.Value(0)).current;

  const conditions = [hasHotBreach, hasColdBreach, isLowBattery, !!temperature != null];
  const animationValues = [fadeAnim1, fadeAnim2, fadeAnim3].filter((_, i) => conditions[i]);

  useEffect(() => {
    if (isInDanger) getAnimations(animationValues).start();
  }, [isInDanger, animationValues]);

  if (!hasData) return null;

  const parsed = parseTemperature(temperature);

  return !isInDanger ? (
    <Temperature temperature={parsed} />
  ) : (
    <TouchableOpacity onLongPress={startAcknowledging}>
      <LargeRectangle color={hasColdBreach ? COLOUR.PRIMARY : COLOUR.DANGER}>
        <Row>
          <Row justifyContent="flex-end" flex={3} alignItems="flex-end">
            <LargeText color={COLOUR.WHITE}>{parsed.major}</LargeText>
            {parsed.minor && (
              <MediumText color={COLOUR.WHITE} paddingBottom={5}>
                {parsed.minor}
              </MediumText>
            )}
          </Row>
          <Row style={{ flex: 2 }}>
            {!!hasHotBreach && (
              <Animated.View style={{ ...styles.icon, opacity: fadeAnim1 }}>
                <Icon.HotBreach />
              </Animated.View>
            )}

            {!!hasColdBreach && (
              <Animated.View style={{ ...styles.icon, left: 10, opacity: fadeAnim2 }}>
                <Icon.ColdBreach />
              </Animated.View>
            )}

            {!!isLowBattery && (
              <Animated.View
                style={{
                  ...styles.icon,
                  top: (STYLE.HEIGHT.LARGE_RECTANGLE - ICON_SIZE.MS) / 2,
                  opacity: fadeAnim3,
                }}
              >
                <Icon.LowBattery />
              </Animated.View>
            )}
          </Row>
        </Row>
      </LargeRectangle>
    </TouchableOpacity>
  );
};

export const SensorTemperatureStatus = SensorTemperatureStatusComponent;
