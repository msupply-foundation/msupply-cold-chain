import { connect } from 'react-redux';

import { useOnMount, useHideTabBar } from '~hooks';
import { SensorSelector, DetailAction } from '~features';

import {
  SensorDetailChart,
  SensorDetailActionBar,
  SensorDetailCumulativeBreachStatus,
} from '~components';
import { SensorLogsTable, SensorDetailScreenLayout } from '~layouts';
import { LargeText } from '~presentation/typography';

const stateToProps = (state, props) => {
  const {
    route: {
      params: { id },
    },
  } = props;

  const name = SensorSelector.getName(state, { id });

  return { name };
};

const dispatchToProps = (dispatch, props) => {
  const {
    route: {
      params: { id },
    },
  } = props;

  const fetch = () => dispatch(DetailAction.fetch(id));
  const flush = () => dispatch(DetailAction.flush(id));

  return { fetch, flush };
};

export const SensorDetailScreenComponent = ({ name, id, fetch, flush }) => {
  useOnMount(fetch, flush);
  useHideTabBar();

  return (
    <SensorDetailScreenLayout
      ActionBar={<SensorDetailActionBar id={id} />}
      Name={<LargeText>{name}</LargeText>}
      CumulativeBreach={<SensorDetailCumulativeBreachStatus id={id} />}
      Chart={<SensorDetailChart id={id} />}
      Table={<SensorLogsTable id={id} />}
    />
  );
};

export const SensorDetailScreen = connect(
  stateToProps,
  dispatchToProps
)(SensorDetailScreenComponent);
