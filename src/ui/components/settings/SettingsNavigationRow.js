import { Chevron } from '~presentation/icons';
import { SettingsItem } from './SettingsItem';
import { COLOUR } from '../../../shared/constants';

export const SettingsNavigationRow = ({ label, subtext, Icon, onPress }) => {
  return (
    <SettingsItem
      LeftIcon={Icon}
      label={label}
      subtext={subtext}
      RightComponent={<Chevron colour={COLOUR.GREY_ONE} direction="right" />}
      onPress={onPress}
    />
  );
};
