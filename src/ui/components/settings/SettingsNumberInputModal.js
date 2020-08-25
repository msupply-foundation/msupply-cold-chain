/* eslint-disable react/jsx-wrap-multilines */
import { useState } from 'react';
import { useWindowDimensions } from 'react-native';

import { SettingsEditModal } from './SettingsEditModal';

import { Slider } from '~presentation';
import { Column, Row } from '~layouts';
import { LargeText } from '~presentation/typography';
import { COLOUR } from '~constants';
import { useCombinedCallback } from '../../hooks';

export const SettingsNumberInputModal = ({
  title,
  onConfirm,
  initialValue,
  maximumValue,
  minimumValue,
  step,
  metric,
  onClose,
  isOpen,
}) => {
  const [value, setValue] = useState(initialValue);

  const { width } = useWindowDimensions();

  const wrappedOnConfirm = useCombinedCallback(() => onConfirm({ value }), onClose);

  return (
    <SettingsEditModal
      title={title}
      onConfirm={wrappedOnConfirm}
      onClose={onClose}
      isOpen={isOpen}
      Content={
        <Column alignItems="center" justifyContent="center">
          <Row justifyContent="space-between" alignItems="center">
            <LargeText colour={COLOUR.SECONDARY}>
              {`${value} ${metric ? `(${metric})` : ''}`}
            </LargeText>
          </Row>

          <Slider
            onSlidingComplete={setValue}
            value={value}
            maximumValue={maximumValue}
            minimumValue={minimumValue}
            step={step}
            style={{ width: width * 0.5, marginVertical: 20 }}
          />
        </Column>
      }
    />
  );
};
