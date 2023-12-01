import React, { FC, useState } from 'react';
import { TextInput } from 'react-native';
import { SettingsEditModal } from './SettingsEditModal';
import { Column, Row } from '../../layouts';
import { LargeText } from '../../presentation/typography';
import { COLOUR, FONT } from '../../../common/constants';
import { useCombinedCallback } from '../../hooks';

interface SettingsGenerateLogsInputModalProps {
  title: string;
  onConfirm: (newValue: { min: number; max: number; numLogs: number }) => void;
  onClose: () => void;
  isOpen: boolean;
}

export const SettingsGenerateLogsInputModal: FC<SettingsGenerateLogsInputModalProps> = ({
  title,
  onConfirm,
  onClose,
  isOpen,
}) => {
  const [minValue, setMinValue] = useState(2);
  const [maxValue, setMaxValue] = useState(8);
  const [numLogs, setNumLogs] = useState(10);

  const wrappedOnConfirm = useCombinedCallback(
    () => onConfirm({ min: minValue, max: maxValue, numLogs }),
    onClose
  );

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
              value={String(minValue)}
              keyboardType="numeric"
              onChangeText={(newInput: string) => {
                const asNumber = Number(newInput);
                if (!isNaN(asNumber)) {
                  setMinValue(asNumber);
                }
              }}
            />
            <LargeText color={COLOUR.SECONDARY}>Min</LargeText>
          </Row>
          <Row justifyContent="space-between" alignItems="center">
            <TextInput
              underlineColorAndroid={COLOUR.SECONDARY}
              style={{
                fontSize: FONT.SIZE.L,
                fontFamily: FONT.FAMILY.REGULAR,
                color: COLOUR.SECONDARY,
              }}
              value={String(maxValue)}
              keyboardType="numeric"
              onChangeText={(newInput: string) => {
                const asNumber = Number(newInput);
                if (!isNaN(asNumber)) {
                  setMaxValue(asNumber);
                }
              }}
            />
            <LargeText color={COLOUR.SECONDARY}>Max</LargeText>
          </Row>
          <Row justifyContent="space-between" alignItems="center">
            <TextInput
              underlineColorAndroid={COLOUR.SECONDARY}
              style={{
                fontSize: FONT.SIZE.L,
                fontFamily: FONT.FAMILY.REGULAR,
                color: COLOUR.SECONDARY,
              }}
              value={String(numLogs)}
              keyboardType="numeric"
              onChangeText={(newInput: string) => {
                const asNumber = Number(newInput);
                if (!isNaN(asNumber)) {
                  setNumLogs(asNumber);
                }
              }}
            />
            <LargeText color={COLOUR.SECONDARY}>Num Logs</LargeText>
          </Row>
        </Column>
      }
    />
  );
};
