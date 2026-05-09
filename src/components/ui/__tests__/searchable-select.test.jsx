import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import SearchableSelect from '../../common/SearchableSelect';

jest.useFakeTimers();

// jsdom does not implement scrollIntoView; mock it for components that call it
beforeAll(() => {
  window.HTMLElement.prototype.scrollIntoView = function() {};
});

test('local filtering prevents backend call', async () => {
  const fetcher = jest.fn().mockResolvedValue({ data: [] });
  render(
    <SearchableSelect
      value=""
      onChange={() => {}}
      initialData={[{ id: '2', name: 'Bob' }]}
      fetcher={fetcher}
      renderItem={(it) => it.name}
      getItemKey={(it) => it.id}
    />
  );

  // open the select to render the search input
  await act(async () => {
    fireEvent.click(screen.getByRole('combobox'));
  });
  const input = screen.getByPlaceholderText(/search/i);
  await act(async () => {
    fireEvent.change(input, { target: { value: 'Bob' } });
  });

  // input should reflect typed value
  expect(input.value).toBe('Bob');
});

test('calls backend when no local match and length>=minChars', async () => {
  const fetcher = jest.fn().mockResolvedValue({ data: [{ id: '3', name: 'Charlie' }] });
  render(
    <SearchableSelect
      value=""
      onChange={() => {}}
      initialData={[]}
      fetcher={fetcher}
      renderItem={(it) => it.name}
      getItemKey={(it) => it.id}
    />
  );

  // open and type a query that triggers fetch
  await act(async () => {
    fireEvent.click(screen.getByRole('combobox'));
  });
  const input = screen.getByPlaceholderText(/search/i);
  await act(async () => {
    fireEvent.change(input, { target: { value: 'Charlie' } });
  });

  // debounce delay in component is 800ms
  await act(async () => {
    jest.advanceTimersByTime(800);
    // allow promises to resolve
    await Promise.resolve();
  });

  await waitFor(() => expect(fetcher).toHaveBeenCalled());
  // input should reflect typed value while backend result loads
  expect(input.value).toBe('Charlie');
});
