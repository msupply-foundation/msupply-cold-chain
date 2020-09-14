import React, { useEffect } from 'react';
import { ActivityIndicator } from 'react-native';
import { shallowEqual, useSelector, useDispatch } from 'react-redux';
import { TouchableNativeFeedback } from 'react-native-gesture-handler';
import moment from 'moment';
import { SensorRowLayout, Row, Column } from '~layouts';
import { Divider, Chart } from '~presentation';
import { STYLE, COLOUR } from '~constants';
import { NormalText, BoldText, MediumText } from '~presentation/typography';
import { SensorStatus } from './SensorStatus';
import { ChartAction } from '../../features/Chart';
import { CumulativeBreachAction } from '../../features/Breach';
import { SensorStatusAction, SensorStatusSelector } from '../../features/SensorStatus';

export const SensorChartRow = React.memo(({ id, direction = 'right', onPress, onLongPress }) => {
  const isLoading = useSelector(state => state.chart.listLoading[id]) ?? true;
  const logs = useSelector(state => state.chart.listDataPoints[id], shallowEqual);
  const { coldCumulative, hotCumulative } =
    useSelector(state => state.breach.cumulative.listById[id], shallowEqual) ?? {};

  const { [id]: status = {} } = useSelector(SensorStatusSelector.byId, shallowEqual) ?? {};

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(SensorStatusAction.fetch(id));
  }, []);

  const { batteryLevel, numberOfLogs } = status;

  useEffect(() => {
    dispatch(ChartAction.getListChartData(id));
    dispatch(CumulativeBreachAction.fetchListForSensor(id));
  }, []);

  return (
    <TouchableNativeFeedback onPress={numberOfLogs ? onPress : null} onLongPress={onLongPress}>
      <SensorRowLayout
        Chart={
          isLoading ? (
            <Row
              alignItems="center"
              justifyContent="center"
              style={{ width: STYLE.WIDTH.NORMAL_CHART }}
            >
              <ActivityIndicator size="large" color={COLOUR.PRIMARY} />
            </Row>
          ) : (
            (logs?.length && <Chart data={logs} />) || (
              <Row
                alignItems="center"
                justifyContent="center"
                style={{ width: STYLE.WIDTH.NORMAL_CHART }}
              >
                <MediumText>No data</MediumText>
              </Row>
            )
          )
        }
        SensorName={null}
        direction={direction}
        SensorStatus={
          // eslint-disable-next-line react/jsx-wrap-multilines
          numberOfLogs ? (
            <SensorStatus
              batteryLevel={batteryLevel}
              temperature={String(status.currentTemperature)}
              isInHotBreach={!!status.isInHotBreach}
              isInColdBreach={!!status.isInColdBreach}
            />
          ) : null
        }
        Extra={
          // eslint-disable-next-line react/jsx-wrap-multilines
          <Column>
            <BoldText colour={COLOUR.WHITE}>{status.name ?? status.macAddress}</BoldText>
            {numberOfLogs ? (
              <>
                <NormalText>
                  {`${moment
                    .duration(moment.unix(moment().unix() - status.mostRecentLogTimestamp))
                    .humanize()} ago`}
                </NormalText>
                {coldCumulative && (
                  <NormalText>
                    {`${moment.duration(coldCumulative.duration, 'seconds').humanize()} between ${
                      coldCumulative.minimumTemperature
                    }${String.fromCharCode(176)}C - ${
                      coldCumulative.maximumTemperature
                    }${String.fromCharCode(176)}C`}
                  </NormalText>
                )}
                {hotCumulative && (
                  <NormalText>
                    {`${moment.duration(hotCumulative.duration, 'seconds').humanize()} between ${
                      hotCumulative.minimumTemperature
                    }${String.fromCharCode(176)}C - ${
                      hotCumulative.maximumTemperature
                    }${String.fromCharCode(176)}C`}
                  </NormalText>
                )}
              </>
            ) : null}
          </Column>
        }
      />
      <Divider width={STYLE.WIDTH.DIVIDER_NEARLY_FULL} backgroundColor={COLOUR.DIVIDER} />
    </TouchableNativeFeedback>
  );
});
