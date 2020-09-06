import React, { useEffect } from 'react';
import { Animated } from 'react-native';

import { Row, Centered, LargeRectangle } from '~layouts';
import { Header, LargeText , SmallText } from '~presentation/typography';
import { LowBattery, HotBreach, ColdBreach } from '~presentation/icons';
import { MILLISECONDS, COLOUR } from '~constants';
import { Battery } from '../presentation/icons/Battery';


const styles = {
  icon: { position: 'absolute', left: 40 },
};

export const SensorStatus = ({
  isInHotBreach = false,
  isInColdBreach = false,
  isLowBattery = false,
  batteryLevel = 100,
  temperature,
}) => {
  const fadeAnim1 = React.useRef(new Animated.Value(0)).current;
  const fadeAnim2 = React.useRef(new Animated.Value(0)).current;
  const fadeAnim3 = React.useRef(new Animated.Value(0)).current;

  const conditions = [isInHotBreach, isInColdBreach, isLowBattery, !!temperature != null];
  const animationValues = [fadeAnim1, fadeAnim2, fadeAnim3].filter((_, i) => conditions[i]);
  const isInDanger = isInHotBreach || isInColdBreach || isLowBattery;

  const animations = () => {
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
    ).start();
  };

  useEffect(() => {
    if (isInDanger) animations();
  }, [isInDanger]);

  return !isInDanger ? (
    <Centered>
      <Row alignItems="center" style={{ alignSelf: 'flex-start' }}>
        <Battery size={10} />
        <SmallText>{batteryLevel}</SmallText>
      </Row>
      <Header>{temperature}</Header>
    </Centered>
  ) : (
    <LargeRectangle colour={isInHotBreach ? COLOUR.DANGER : COLOUR.PRIMARY}>
      <Row flex={1}>
        <Centered style={{ left: 10 }}>
          <LargeText colour={COLOUR.WHITE}>{temperature}</LargeText>
        </Centered>

        <Centered>
          <Animated.View style={styles.icon} opacity={fadeAnim1}>
            <HotBreach />
          </Animated.View>

          <Animated.View style={styles.icon} opacity={fadeAnim2}>
            <ColdBreach />
          </Animated.View>

          <Animated.View style={styles.icon} opacity={fadeAnim3}>
            <LowBattery />
          </Animated.View>
        </Centered>
      </Row>
    </LargeRectangle>
  );
};
