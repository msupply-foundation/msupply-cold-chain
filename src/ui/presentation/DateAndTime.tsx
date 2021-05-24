import React, { FC } from 'react';
import { COLOUR } from '~constants';
import { Column } from '../layouts';
import { LargeText, MediumText, SmallText } from './typography';

interface DateAndTimeProps {
  date: string;
  time: string;
}

export const DateAndTime: FC<DateAndTimeProps> = ({ time, date }) => {
  return (
    <Column>
      <Column style={{ height: 12 }} />
      <MediumText color={COLOUR.WHITE}>{time}</MediumText>
      <SmallText style={{ alignSelf: 'flex-end' }}>{date}</SmallText>
    </Column>
  );
};
