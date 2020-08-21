import { useRef, useState } from 'react';
import PinView from 'react-native-pin-view';
import LinearGradient from 'react-native-linear-gradient';

import { COLOUR, FONT } from '~constants';
import { FullScreenModal, Column, Row } from '~layouts';
import { Chevron } from '~presentation/icons';

export const PinEntry = ({ onComplete, onCancel }) => {
  const ref = useRef();

  const [, setInput] = useState([]);
  const onKeyPress = key => {
    if (key === 'custom_left') {
      setInput([]);
      return onCancel();
    }
    return setInput(state => {
      const updatedState = [...state, key];

      if (updatedState.length === 4) {
        onComplete(updatedState);
        // eslint-disable-next-line no-unused-expressions
        ref.current?.clearAll();
        return [];
      }
      return updatedState;
    });
  };

  return (
    <FullScreenModal isOpen style={{ justifyContent: null, alignItems: null }}>
      <LinearGradient
        colors={['#282F46', '#4C68A3']}
        style={{ flex: 1, width: '100%', height: '100%' }}
      >
        <Row flex={1} />
        <Row flex={4}>
          <Column flex={2} />
          <Column flex={3}>
            <PinView
              inputSize={32}
              ref={ref}
              pinLength={4}
              buttonSize={80}
              onValueChange={() => {}}
              buttonAreaStyle={{
                marginTop: 24,
              }}
              inputAreaStyle={{
                marginBottom: 24,
              }}
              inputViewEmptyStyle={{
                backgroundColor: 'transparent',
                borderWidth: 1,
                borderColor: COLOUR.PRIMARY,
              }}
              inputViewFilledStyle={{
                backgroundColor: COLOUR.PRIMARY,
              }}
              buttonViewStyle={{
                borderWidth: 2,
                borderColor: COLOUR.PRIMARY,
                marginVertical: 10,
              }}
              buttonTextStyle={{
                color: COLOUR.WHITE,
                fontSize: FONT.SIZE.M,
                fontFamily: FONT.FAMILY.REGULAR,
              }}
              onButtonPress={onKeyPress}
              customLeftButton={<Chevron direction="left" colour={COLOUR.WHITE} />}
            />
          </Column>
          <Column flex={2} />
        </Row>
      </LinearGradient>
    </FullScreenModal>
  );
};
