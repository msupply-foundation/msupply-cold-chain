/* eslint-disable react/jsx-wrap-multilines */
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment';
import { ActivityIndicator, FlatList } from 'react-native';

import { SettingsEditButtonGroup, SettingsEditModalLayout, Column, Centered } from '~layouts';

import { t } from '~translations';
import { BreachAction } from '../../features/breach';
import { NormalText } from '../presentation/typography';
import { Divider } from '../presentation';
import { COLOUR } from '../../common/constants';
import { SettingsEditButton } from './buttons';

export const HandleBreachModal = ({ id }) => {
  const dispatch = useDispatch();
  const handlingBreaches = useSelector(state => state.breach.handlingBreaches);
  const fetchingUnhandledBreaches = useSelector(state => state.breach.fetchingUnhandledBreaches);
  const unhandledBreaches = useSelector(state => state.breach.unhandledBreaches);

  return (
    <SettingsEditModalLayout
      isOpen={handlingBreaches}
      onClose={() => dispatch(BreachAction.finishHandlingBreaches())}
      Title={<NormalText colour={COLOUR.GREY_ONE}>ACKNOWLEDGE BREACHES</NormalText>}
      ButtonGroup={
        <SettingsEditButtonGroup>
          <SettingsEditButton
            text="ACKNOWLEDGE"
            onPress={() => dispatch(BreachAction.tryClearBreaches(id))}
          />
          <SettingsEditButton
            text={t('CANCEL')}
            onPress={() => dispatch(BreachAction.finishHandlingBreaches())}
          />
        </SettingsEditButtonGroup>
      }
      Content={
        fetchingUnhandledBreaches ? (
          <ActivityIndicator size="large" color="red" />
        ) : (
          <Column alignItems="center" flex={1} justifyContent="center">
            <FlatList
              flex={1}
              ListEmptyComponent={
                <Centered>
                  <NormalText style={{ textAlign: 'left' }} colour={COLOUR.GREY_ONE}>
                    The current breach is ongoing!
                  </NormalText>
                </Centered>
              }
              data={unhandledBreaches}
              renderItem={({ item }) => {
                return (
                  <Column>
                    <Centered>
                      <NormalText style={{ textAlign: 'left' }} colour={COLOUR.GREY_ONE}>
                        {item.temperatureBreachConfiguration.description}
                      </NormalText>
                    </Centered>

                    <Centered>
                      <NormalText style={{ textAlign: 'left' }} colour={COLOUR.GREY_ONE}>
                        {`started: ${moment(item.startTimestamp * 1000).format(
                          'DD/MM/YYYY HH:mm:ss'
                        )}`}
                      </NormalText>
                    </Centered>
                    <Centered>
                      <NormalText style={{ textAlign: 'left' }} colour={COLOUR.GREY_ONE}>
                        {`ended: ${moment(item.endTimestamp * 1000).format('DD/MM/YYYY HH:mm:ss')}`}
                      </NormalText>
                    </Centered>
                    <Divider />
                  </Column>
                );
              }}
            />
          </Column>
        )
      }
    />
  );
};
