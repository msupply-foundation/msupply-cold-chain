import React, { FC } from 'react';
import { useToggle } from '~hooks';
import { SettingsButtonRow } from './SettingsButtonRow';
import { ConfirmModal } from '../modal';

interface SettingsConfirmRow {
  label: string;
  subtext: string;
  onPress: () => void;
  confirmText: string;
}

export const SettingsConfirmRow: FC<SettingsConfirmRow> = ({
  label,
  subtext,
  onPress,
  confirmText,
}) => {
  const [isToggled, toggle] = useToggle(false);

  return (
    <>
      <SettingsButtonRow label={label} subtext={subtext} onPress={toggle} />
      <ConfirmModal
        isOpen={isToggled}
        onConfirm={onPress}
        onClose={toggle}
        confirmText={confirmText}
      />
    </>
  );
};
