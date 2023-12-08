import React, { FC } from 'react';
import { COLOUR } from '../../../common/constants';
import { useToggle } from '../../hooks';
import { Row } from '../../layouts';
import { NormalText } from '../../presentation/typography';
import { SettingsItem } from './SettingsItem';
import { Icon } from '../../presentation/icons';
import { SettingsGenerateLogsInputModal } from './SettingsGenerateLogsInputModal';

interface SettingsGenerateLogsInputRowProps {
  label: string;
  subtext: string;
  onConfirm: (newValue: { min: number; max: number; numLogs: number }) => void;
  editDescription: string;
  maximumValue: number;
  minimumValue: number;
  step: number;
  metric: string;
}

export const SettingsGenerateLogsInputRow: FC<SettingsGenerateLogsInputRowProps> = ({
  label,
  subtext,
  onConfirm,
  editDescription,
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
              Create some logs
            </NormalText>
            <Icon.Chevron direction="right" color={COLOUR.GREY_ONE} />
          </Row>
        }
      />
      {isModalOpen && (
        <SettingsGenerateLogsInputModal
          title={editDescription}
          onConfirm={onConfirm}
          onClose={toggleModal}
          isOpen={isModalOpen}
        />
      )}
    </>
  );
};
