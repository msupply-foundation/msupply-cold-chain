import moment from 'moment';

import { useState, useEffect } from 'react';
import { InteractionManager, ActivityIndicator, Pressable } from 'react-native';
import { useSelector, shallowEqual, useDispatch } from 'react-redux';
import { TouchableNativeFeedback } from 'react-native-gesture-handler';

import { DateRangePicker } from '~components/DateRangePicker';
import { COLOUR } from '~constants';
import { Row, Column, FullScreenModal, Gradient, Centered } from '~layouts';
import { useRouteProps, useToggle } from '~hooks';
import { SensorLogsTable } from '../../layouts/SensorLogsTable';

import { SensorSelector } from '~sensor';
import { NormalText, LargeText } from '../../presentation/typography';
import { Chart } from '~presentation';

import { Download } from '../../presentation/icons/Download';
import { DeviceAction } from '../../../services/device';
import { Calendar } from '../../presentation/icons';
import { LogTableAction } from '../../../features/logTable';
import { ChartSelector, ChartAction } from '../../../features/chart';
import { BreachAction } from '../../../features/breach';
import { WritingLogsModal } from '../../components/WritingLogsModal';

const getDateRange = (firstLogTimestamp, mostRecentLogTimestamp) => {
  const to = moment.min(moment(), moment(mostRecentLogTimestamp * 1000));
  const from = moment.max(moment(to).subtract(3, 'days'), moment(firstLogTimestamp * 1000));

  return [from, to];
};

export const SensorDetailScreen = ({ navigation }) => {
  const { id } = useRouteProps();
  const { [id]: sensor } = useSelector(SensorSelector.sensors);

  const { mostRecentLogTimestamp, minChartTimestamp } = sensor;
  const [load, setLoad] = useState(false);
  const dispatch = useDispatch();

  const [[minimumDate, maximumDate]] = useState(
    getDateRange(minChartTimestamp, mostRecentLogTimestamp)
  );

  const [dateRange, setDateRange] = useState(
    moment(minimumDate).twix(maximumDate, { allDay: true })
  );
  const [dateRangeIsOpen, toggleDateRange] = useToggle();

  useEffect(() => {
    return () => {
      dispatch(BreachAction.reset());
    };
  }, []);

  useEffect(() => {
    const parent = navigation.dangerouslyGetParent();
    parent.setOptions({ tabBarVisible: false });
    InteractionManager.runAfterInteractions(() => setLoad(true));
  }, []);

  useEffect(() => {
    dispatch(ChartAction.getDetailChartData(dateRange.start().unix(), dateRange.end().unix(), id));
  }, []);

  useEffect(() => {
    dispatch(LogTableAction.updateLogs(dateRange.start().unix(), dateRange.end().unix(), id));
  }, []);

  useEffect(() => {
    dispatch(
      BreachAction.getDetailCumulativeForSensor(
        dateRange.start().unix(),
        dateRange.end().unix(),
        id
      )
    );
  }, []);

  const { coldCumulative, hotCumulative } =
    useSelector(state => state.breach.detailCumulative[id], shallowEqual) ?? {};

  const data = useSelector(ChartSelector.detailDataPoints);

  return (
    <Gradient>
      <FullScreenModal isOpen={dateRangeIsOpen}>
        <DateRangePicker
          minimumDate={minimumDate}
          maximumDate={maximumDate}
          initialStart={dateRange.start()}
          initialEnd={dateRange.end()}
          onConfirm={(from, to) => {
            const fromMoment = moment(from);
            const toMoment = moment(to);
            const fromUnix = fromMoment.unix();
            const toUnix = toMoment.unix();

            toggleDateRange();
            setDateRange(fromMoment.twix(toMoment, { allDay: true }));
            dispatch(LogTableAction.updateLogs(fromUnix, toUnix, id));
            dispatch(ChartAction.getDetailChartData(fromUnix, toUnix, id));
          }}
          onCancel={toggleDateRange}
        />
      </FullScreenModal>

      {!load ? (
        <Centered style={{ width: '100%', height: '100%' }}>
          <ActivityIndicator size="large" color={COLOUR.PRIMARY} />
        </Centered>
      ) : (
        <>
          <TouchableNativeFeedback style={{ paddingBottom: 20 }} onPress={() => {}}>
            <Column>
              <LargeText>{sensor.name ?? sensor.macAddress}</LargeText>
              <Row>
                {coldCumulative && (
                  <NormalText>
                    {`${moment.duration(coldCumulative.duration, 'seconds').humanize()} between ${
                      coldCumulative.minimumTemperature
                    }${String.fromCharCode(176)}C - ${
                      coldCumulative.maximumTemperature
                    }${String.fromCharCode(176)}C`}
                  </NormalText>
                )}
                {hotCumulative && coldCumulative ? <NormalText> -- </NormalText> : null}
                {hotCumulative && (
                  <NormalText>
                    {`${moment.duration(hotCumulative.duration, 'seconds').humanize()} between ${
                      hotCumulative.minimumTemperature
                    }${String.fromCharCode(176)}C - ${
                      hotCumulative.maximumTemperature
                    }${String.fromCharCode(176)}C`}
                  </NormalText>
                )}
              </Row>
            </Column>
            <Chart data={data} width={750} />
          </TouchableNativeFeedback>

          <Row
            justifyContent="center"
            alignItems="center"
            style={{ backgroundColor: '#dddddd', padding: 20 }}
          >
            <Column flex={1}>
              <TouchableNativeFeedback onPress={toggleDateRange}>
                <Calendar />
                <NormalText colour={COLOUR.GREY_ONE}>{dateRange.format()}</NormalText>
              </TouchableNativeFeedback>
            </Column>

            <Column flex={4} alignItems="flex-end" justifyContent="center">
              <Pressable
                onPress={() => {
                  dispatch(DeviceAction.tryWriteLogFile(id));
                }}
                style={{
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Download />
              </Pressable>
            </Column>
          </Row>

          <SensorLogsTable id={id} />
        </>
      )}
      <WritingLogsModal />
    </Gradient>
  );
};
