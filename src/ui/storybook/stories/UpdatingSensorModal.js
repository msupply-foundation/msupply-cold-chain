import { Provider } from 'react-redux';
import { storiesOf } from '@storybook/react-native';
import { UpdatingSensorModal } from '../../components';
import { store } from '~store';

const UpdatingSensorModalStories = {
  basic: () => (
    <Provider store={store}>
      <UpdatingSensorModal isOpen />
    </Provider>
  ),
};

Object.entries(UpdatingSensorModalStories).forEach(([key, value]) => {
  storiesOf('UpdatingSensor', module).add(key, value);
});
