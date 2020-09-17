import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { Animated, TouchableOpacity } from 'react-native';

import { MILLISECONDS, COLOUR } from '~constants';
import { SensorStatusSelector, AcknowledgeBreachAction } from '~features';

import { Row, Centered, LargeRectangle } from '~layouts';
import { Header, LargeText } from '~presentation/typography';
import { LowBattery, HotBreach, ColdBreach } from '~presentation/icons';

const stateToProps = (state, ownProps) => {
  const hasHotBreach = SensorStatusSelector.hasHotBreach(state, ownProps);
  const hasColdBreach = SensorStatusSelector.hasColdBreach(state, ownProps);
  const isLowBattery = SensorStatusSelector.isLowBattery(state, ownProps);
  const isInDanger = SensorStatusSelector.isInDanger(state, ownProps);
  const temperature = SensorStatusSelector.currentTemperature(state, ownProps);
  const hasData = SensorStatusSelector.hasData(state, ownProps);

  return { hasData, hasHotBreach, hasColdBreach, isLowBattery, isInDanger, temperature };
};

const dispatchToProps = (dispatch, { id }) => {
  return { startAcknowledging: () => dispatch(AcknowledgeBreachAction.startAcknowledging(id)) };
};

const styles = {
  icon: { position: 'absolute', left: 40 },
};

const getAnimations = animationValues => {
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

export const SensorTemperatureStatusComponent = ({
  temperature,
  hasHotBreach,
  hasColdBreach,
  isLowBattery,
  isInDanger,
  startAcknowledging,
  hasData,
}) => {
  if (!hasData) return null;

  const fadeAnim1 = React.useRef(new Animated.Value(0)).current;
  const fadeAnim2 = React.useRef(new Animated.Value(0)).current;
  const fadeAnim3 = React.useRef(new Animated.Value(0)).current;

  const conditions = [hasHotBreach, hasColdBreach, isLowBattery, !!temperature != null];
  const animationValues = [fadeAnim1, fadeAnim2, fadeAnim3].filter((_, i) => conditions[i]);

  useEffect(() => {
    if (isInDanger) getAnimations(animationValues).start();
  }, [isInDanger, animationValues]);

  return !isInDanger ? (
    <Centered>
      <Header>{temperature}</Header>
    </Centered>
  ) : (
    <TouchableOpacity onLongPress={startAcknowledging}>
      <LargeRectangle colour={hasHotBreach ? COLOUR.DANGER : COLOUR.PRIMARY}>
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
    </TouchableOpacity>
  );
};

export const SensorTemperatureStatus = connect(
  stateToProps,
  dispatchToProps
)(SensorTemperatureStatusComponent);
