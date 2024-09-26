import React, { FC, useState } from 'react';
import { TextInput, useWindowDimensions } from 'react-native';
import { SettingsEditModal } from './SettingsEditModal';
import { Slider } from '../../presentation';
import { Column, Row } from '../../layouts';
import { LargeText } from '../../presentation/typography';
import { COLOUR, FONT } from '../../../common/constants';
import { useCombinedCallback } from '../../hooks';

interface SettingsNumberInputModalProps {
  title: string;
  onConfirm: (newValue: { value: number }) => void;
  initialValue: number;
  maximumValue: number;
  minimumValue: number;
  step: number;
  metric: string;
  onClose: () => void;
  isOpen: boolean;
}

const isInRange = (input: number, min: number, max: number) => {
  return input >= min && input <= max;
};

export const SettingsNumberInputModal: FC<SettingsNumberInputModalProps> = ({
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
            <TextInput
              underlineColorAndroid={COLOUR.SECONDARY}
              style={{
                fontSize: FONT.SIZE.L,
                fontFamily: FONT.FAMILY.REGULAR,
                color: COLOUR.SECONDARY,
              }}
              defaultValue={String(value)}
              keyboardType="numeric"
              onChangeText={(newInput: string) => {
                const asNumber = Number(newInput);
                if (!isNaN(asNumber) && isInRange(asNumber, minimumValue, maximumValue)) {
                  setValue(asNumber);
                }
              }}
            />
            <LargeText color={COLOUR.SECONDARY}>{`${metric ? `(${metric})` : ''}`}</LargeText>
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
