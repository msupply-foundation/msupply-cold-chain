/* eslint-disable react/jsx-wrap-multilines */
import React, { FC } from 'react';
import { COLOUR } from '../../../common/constants';
import { useToggle } from '../../hooks';
import { Row } from '../../layouts';
import { NormalText } from '../../presentation/typography';
import { SettingsItem } from './SettingsItem';
import { SettingsNumberInputModal } from './SettingsNumberInputModal';
import { Icon } from '../../presentation/icons';

interface SettingsNumberInputRowProps {
  label: string;
  subtext: string;
  onConfirm: () => void;
  initialValue: number;
  editDescription: string;
  maximumValue: number;
  minimumValue: number;
  step: number;
  metric: string;
}

export const SettingsNumberInputRow: FC<SettingsNumberInputRowProps> = ({
  label,
  subtext,
  onConfirm,
  initialValue,
  editDescription,
  maximumValue,
  minimumValue,
  step,
  metric,
}) => {
  const [isModalOpen, toggleModal] = useToggle(false);

  return (
    <>
      <SettingsItem
        label={label}
        subtext={subtext}
        onPress={toggleModal}
        LeftIcon={<Icon.Pencil />}
        RightComponent={
          <Row justifyContent="space-between" alignItems="center">
            <NormalText marginRight={30} color={COLOUR.GREY_ONE}>
              {initialValue}
            </NormalText>
            <Icon.Chevron direction="right" color={COLOUR.GREY_ONE} />
          </Row>
        }
      />
      {isModalOpen && (
        <SettingsNumberInputModal
          title={editDescription}
          onConfirm={onConfirm}
          onClose={toggleModal}
          isOpen={isModalOpen}
          initialValue={initialValue}
          maximumValue={maximumValue}
          minimumValue={minimumValue}
          step={step}
          metric={metric}
        />
      )}
    </>
  );
};
