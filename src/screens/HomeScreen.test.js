import React from 'react';
import { render } from '@testing-library/react-native';
import HomeScreen from './HomeScreen';

test('renders correctly', () => {
  const { getByText } = render(<HomeScreen />);
  expect(getByText('Electricity ON')).toBeTruthy();
});
