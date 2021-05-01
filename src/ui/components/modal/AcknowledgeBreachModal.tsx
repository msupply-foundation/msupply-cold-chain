import React, { FC } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment';
import { ActivityIndicator, FlatList } from 'react-native';

import { SettingsEditButtonGroup, SettingsEditModalLayout, Column, Centered } from '../../layouts';

import { t } from '../../../common/translations';
import { AcknowledgeBreachAction } from '../../../features';
import { NormalText } from '../../presentation/typography';
import { Divider } from '../../presentation';
import { COLOUR } from '../../../common/constants';
import { SettingsEditButton } from '../buttons';
import { RootState } from '../../../common/store/store';

interface AcknowledgeBreachModalProps {
  id: string;
}

export const AcknowledgeBreachModal: FC<AcknowledgeBreachModalProps> = ({ id }) => {
  const dispatch = useDispatch();
  const handlingBreaches = useSelector(
    (state: RootState) => state.breach.acknowledgeBreach.acknowledging
  );
  const fetchingUnhandledBreaches = useSelector(
    (state: RootState) => state.breach.acknowledgeBreach.fetching
  );
  const unhandledBreaches = useSelector(
    (state: RootState) => state.breach.acknowledgeBreach.unacknowledged
  );

  return (
    <SettingsEditModalLayout
      isOpen={handlingBreaches}
      onClose={() => dispatch(AcknowledgeBreachAction.finishAcknowledging())}
      Title={<NormalText color={COLOUR.GREY_ONE}>ACKNOWLEDGE BREACHES</NormalText>}
      ButtonGroup={
        <SettingsEditButtonGroup>
          <SettingsEditButton
            text="ACKNOWLEDGE"
            onPress={() => dispatch(AcknowledgeBreachAction.tryAcknowledge(id))}
          />
          <SettingsEditButton
            text={t('CANCEL')}
            onPress={() => dispatch(AcknowledgeBreachAction.finishAcknowledging())}
          />
        </SettingsEditButtonGroup>
      }
      Content={
        fetchingUnhandledBreaches ? (
          <ActivityIndicator size="large" color="red" />
        ) : (
          <Column alignItems="center" flex={1} justifyContent="center">
            <FlatList
              ListEmptyComponent={
                <Centered>
                  <NormalText style={{ textAlign: 'left' }} color={COLOUR.GREY_ONE}>
                    The current breach is ongoing!
                  </NormalText>
                </Centered>
              }
              data={unhandledBreaches}
              renderItem={({ item }) => {
                return (
                  <Column>
                    <Centered>
                      <NormalText style={{ textAlign: 'left' }} color={COLOUR.GREY_ONE}>
                        {item.temperatureBreachConfiguration.description}
                      </NormalText>
                    </Centered>

                    <Centered>
                      <NormalText style={{ textAlign: 'left' }} color={COLOUR.GREY_ONE}>
                        {`started: ${moment(item.startTimestamp * 1000).format(
                          'DD/MM/YYYY HH:mm:ss'
                        )}`}
                      </NormalText>
                    </Centered>
                    <Centered>
                      <NormalText style={{ textAlign: 'left' }} color={COLOUR.GREY_ONE}>
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
