import React from 'react';
import { render, act } from '@testing-library/react';
import { useWindowSize } from '../useWindowSize';

function TestComp() {
  const size = useWindowSize();
  return <div data-testid="size">{String(size.width)}</div>;
}

test('updates on window resize', () => {
  const { getByTestId } = render(<TestComp />);
  const el = getByTestId('size');
  expect(el.textContent).toBe(String(window.innerWidth));
  act(() => {
    window.innerWidth = 500;
    window.dispatchEvent(new Event('resize'));
  });
  expect(el.textContent).toBe('500');
});
