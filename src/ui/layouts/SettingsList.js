import { ScrollView } from 'react-native-gesture-handler';

import { COLOUR } from '~constants';

const style = {
  scrollView: {
    backgroundColor: COLOUR.DIVIDER,
  },
};

export const SettingsList = ({ children }) => {
  return (
    <>
      <ScrollView keyboardShouldPersistTaps="always" style={style}>
        {children}
      </ScrollView>
    </>
  );
};
