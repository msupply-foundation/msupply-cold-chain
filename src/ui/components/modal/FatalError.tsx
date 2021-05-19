import React, { FC } from 'react';
import { View } from 'react-native';
import RNRestart from 'react-native-restart';
import { COLOUR } from '~constants';
import { LargeText } from '~presentation/typography';
import { Centered } from '~layouts';
import { Button } from '~components/buttons';
import { t } from '~common/translations';

interface FatalErrorProps {
  errorMessage: string;
  subtext?: string;
}

export const FatalError: FC<FatalErrorProps> = ({ errorMessage, subtext = t('ERROR_SUBTEXT') }) => {
  return (
    <Centered style={{ width: '100%', height: '100%', backgroundColor: COLOUR.DANGER }}>
      <LargeText>{errorMessage}</LargeText>
      <LargeText>{subtext}</LargeText>
      <View style={{ height: 50 }} />
      <Button text={t('RESTART')} onPress={() => RNRestart.Restart()} />
    </Centered>
  );
};
