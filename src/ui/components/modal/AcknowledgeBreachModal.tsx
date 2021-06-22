import React, { FC } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ActivityIndicator, FlatList } from 'react-native';

import { SettingsEditButtonGroup, SettingsEditModalLayout, Column, Centered } from '~layouts';
import { t } from '~translations';
import { AcknowledgeBreachAction, AcknowledgeBreachSelector } from '~features';
import { NormalText } from '~presentation/typography';
import { Divider } from '~presentation';
import { COLOUR } from '~common/constants';
import { SettingsEditButton } from '../buttons';
import { useFormatter } from '~hooks';
import { TemperatureBreach } from '~common/services/Database';
import { FormatService } from '~common/services';

interface AcknowledgeBreachRowProps {
  item: TemperatureBreach;
  formatter: FormatService;
}

const AcknowledgeBreachRow: FC<AcknowledgeBreachRowProps> = ({ item, formatter }) => (
  <Column>
    <Centered>
      <NormalText style={{ textAlign: 'left' }} color={COLOUR.GREY_ONE}>
        {item.temperatureBreachConfiguration.description}
      </NormalText>
    </Centered>

    <Centered>
      <NormalText style={{ textAlign: 'left' }} color={COLOUR.GREY_ONE}>
        {`${t('STARTED')}: ${formatter.standardDate(item.startTimestamp)} ${formatter.standardTime(
          item.startTimestamp
        )}`}
      </NormalText>
    </Centered>

    {item.endTimestamp && (
      <Centered>
        <NormalText style={{ textAlign: 'left' }} color={COLOUR.GREY_ONE}>
          {`${t('ENDED')}: ${formatter.standardDate(item.endTimestamp)} ${formatter.standardTime(
            item.endTimestamp
          )}`}
        </NormalText>
      </Centered>
    )}
    <Divider />
  </Column>
);

export const AcknowledgeBreachModal: FC = () => {
  const dispatch = useDispatch();

  const formatter = useFormatter();

  const acknowledgingSensorId = useSelector(AcknowledgeBreachSelector.id);
  const isAcknowledging = useSelector(AcknowledgeBreachSelector.isAcknowledging);
  const fetchingUnhandledBreaches = useSelector(AcknowledgeBreachSelector.isFetching);
  const unacknowledgedBreaches = useSelector(AcknowledgeBreachSelector.unacknowledgedBreaches);

  const acknowledge = () => dispatch(AcknowledgeBreachAction.tryAcknowledge(acknowledgingSensorId));
  const close = () => dispatch(AcknowledgeBreachAction.finishAcknowledging());

  return (
    <SettingsEditModalLayout
      isOpen={isAcknowledging}
      onClose={close}
      Title={<NormalText color={COLOUR.GREY_ONE}>ACKNOWLEDGE BREACHES</NormalText>}
      ButtonGroup={
        <SettingsEditButtonGroup>
          <SettingsEditButton
            text={t('ACKNOWLEDGE')}
            isDisabled={!unacknowledgedBreaches.length}
            onPress={acknowledge}
          />
          <SettingsEditButton text={t('CANCEL')} onPress={close} />
        </SettingsEditButtonGroup>
      }
      Content={
        fetchingUnhandledBreaches ? (
          <ActivityIndicator size="large" color={COLOUR.PRIMARY} />
        ) : (
          <Column alignItems="center" flex={1} justifyContent="center">
            <FlatList
              ListEmptyComponent={
                <Centered>
                  <NormalText style={{ textAlign: 'left' }} color={COLOUR.GREY_ONE}>
                    {t('BREACH_ONGOING')}
                  </NormalText>
                </Centered>
              }
              data={unacknowledgedBreaches}
              renderItem={({ item }) => <AcknowledgeBreachRow item={item} formatter={formatter} />}
            />
          </Column>
        )
      }
    />
  );
};
