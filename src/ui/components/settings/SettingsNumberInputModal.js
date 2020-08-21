/* eslint-disable react/jsx-wrap-multilines */
import { useState } from 'react';
import { useWindowDimensions } from 'react-native';
import { Picker } from '@react-native-community/picker';
import { SettingsEditModal } from './SettingsEditModal';

import { Slider } from '~presentation';
import { Column, Row } from '~layouts';
import { LargeText } from '~presentation/typography';
import { COLOUR, STYLE } from '~constants';
import { useCombinedCallback } from '../../hooks';

export const SettingsNumberInputModal = ({
  title,
  onConfirm,
  initialSliderValue,
  initialPickerValue,
  pickerOptions,
  maximumValue,
  minimumValue,
  step,
  metric,
  onClose,
  isOpen,
}) => {
  const [sliderValue, setSliderValue] = useState(initialSliderValue);
  const [pickerValue, setPickerValue] = useState(initialPickerValue);

  const usingPicker = pickerOptions?.length && initialPickerValue;

  const { width } = useWindowDimensions();

  const wrappedOnConfirm = useCombinedCallback(
    () => onConfirm({ sliderValue, pickerValue }),
    onClose,
    [sliderValue, pickerValue]
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
            <LargeText colour={COLOUR.SECONDARY}>
              {`${sliderValue} ${metric ? `(${metric})` : ''}`}
            </LargeText>
            {usingPicker && (
              <Picker
                selectedValue={pickerValue}
                style={{ height: STYLE.HEIGHT.PICKER, width: width * 0.15, marginTop: 10 }}
                onValueChange={setPickerValue}
                mode="dropdown"
              >
                {pickerOptions.map(({ label, value }) => (
                  <Picker.Item label={label} value={value} />
                ))}
              </Picker>
            )}
          </Row>

          <Slider
            onValueChange={setSliderValue}
            value={sliderValue}
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
