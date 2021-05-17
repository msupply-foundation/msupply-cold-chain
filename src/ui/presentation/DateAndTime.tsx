import React, { FC } from 'react';
import { Column } from '../layouts';
import { LargeText, SmallText } from './typography';

interface DateAndTimeProps {
  date: string;
  time: string;
}

export const DateAndTime: FC<DateAndTimeProps> = ({ time, date }) => {
  return (
    <Column>
      <LargeText>{time}</LargeText>
      <SmallText style={{ alignSelf: 'flex-end' }}>{date}</SmallText>
    </Column>
  );
};
