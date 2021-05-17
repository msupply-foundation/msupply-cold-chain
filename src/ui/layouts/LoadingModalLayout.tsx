import React, { FC, ReactNode } from 'react';
import { ViewStyle } from 'react-native';
import { COLOUR } from '../../common/constants';
import { Row } from './Row';
import { Column } from './Column';
import { FlexPaddingView } from './FlexPaddingView';

const styles: { container: ViewStyle; contentContainer: ViewStyle } = {
  container: { backgroundColor: COLOUR.SECONDARY, height: '33%', minWidth: '100%' },
  contentContainer: { height: '100%' },
};

interface LoadingModalLayoutProps {
  Content: ReactNode;
  LoadingIndicator: ReactNode;
}

export const LoadingModalLayout: FC<LoadingModalLayoutProps> = ({ Content, LoadingIndicator }) => (
  <>
    <FlexPaddingView height="33%" />
    <Row style={styles.container} justifyContent="center" alignItems="center">
      <Column
        style={styles.contentContainer}
        flex={1}
        alignItems="center"
        justifyContent="space-evenly"
      >
        {Content}
        {LoadingIndicator}
      </Column>
    </Row>
    <FlexPaddingView height="33%" />
  </>
);
