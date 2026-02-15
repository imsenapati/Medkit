import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MedicationSearch } from './MedicationSearch';
import type { Medication } from './MedicationSearch.types';

const mockMeds: Medication[] = [
  { id: '1', brandName: 'Lipitor', genericName: 'Atorvastatin', strength: '20mg', form: 'tablet', controlledSubstance: false, requiresPriorAuth: false },
  { id: '2', brandName: 'Adderall', genericName: 'Amphetamine', strength: '10mg', form: 'tablet', controlledSubstance: true, requiresPriorAuth: true },
  { id: '3', brandName: 'Humira', genericName: 'Adalimumab', strength: '40mg', form: 'injection', controlledSubstance: false, requiresPriorAuth: true },
];

const mockSearchFn = vi.fn<(query: string) => Promise<Medication[]>>().mockImplementation(
  (query: string) =>
    Promise.resolve(
      mockMeds.filter(
        (m) =>
          m.brandName.toLowerCase().includes(query.toLowerCase()) ||
          m.genericName.toLowerCase().includes(query.toLowerCase())
      )
    )
);

describe('MedicationSearch', () => {
  beforeEach(() => {
    mockSearchFn.mockClear();
  });

  it('renders input with placeholder', () => {
    render(
      <MedicationSearch
        onSelect={() => {}}
        searchFn={mockSearchFn}
        placeholder="Search medications..."
      />
    );
    expect(screen.getByPlaceholderText('Search medications...')).toBeInTheDocument();
  });

  it('has combobox role with accessible attributes', () => {
    render(<MedicationSearch onSelect={() => {}} searchFn={mockSearchFn} />);
    const input = screen.getByRole('combobox');
    expect(input).toHaveAttribute('aria-autocomplete', 'list');
    expect(input).toHaveAttribute('aria-label', 'Search medications');
  });

  it('shows recent selections on focus when no query', async () => {
    const user = userEvent.setup();
    render(
      <MedicationSearch
        onSelect={() => {}}
        searchFn={mockSearchFn}
        recentSelections={[mockMeds[0]]}
      />
    );

    const input = screen.getByRole('combobox');
    await user.click(input);

    expect(screen.getByText('Recent')).toBeInTheDocument();
    expect(screen.getByText('Lipitor')).toBeInTheDocument();
  });

  it('searches and displays results', async () => {
    const user = userEvent.setup();
    render(
      <MedicationSearch
        onSelect={() => {}}
        searchFn={mockSearchFn}
        debounceMs={0}
      />
    );

    const input = screen.getByRole('combobox');
    await user.type(input, 'Lip');

    await waitFor(() => {
      expect(screen.getByText('Lipitor')).toBeInTheDocument();
    });
    expect(screen.getByText('Atorvastatin')).toBeInTheDocument();
  });

  it('shows no results message', async () => {
    const user = userEvent.setup();
    const emptySearch = vi.fn().mockResolvedValue([]);
    render(
      <MedicationSearch
        onSelect={() => {}}
        searchFn={emptySearch}
        debounceMs={0}
      />
    );

    const input = screen.getByRole('combobox');
    await user.type(input, 'xyz');

    await waitFor(() => {
      expect(screen.getByText(/No medications found/)).toBeInTheDocument();
    });
  });

  it('calls onSelect when clicking a result', async () => {
    const onSelect = vi.fn();
    const user = userEvent.setup();
    render(
      <MedicationSearch
        onSelect={onSelect}
        searchFn={mockSearchFn}
        debounceMs={0}
      />
    );

    const input = screen.getByRole('combobox');
    await user.type(input, 'Lip');

    await waitFor(() => {
      expect(screen.getByText('Lipitor')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Lipitor'));
    expect(onSelect).toHaveBeenCalledWith(mockMeds[0]);
  });

  it('navigates with keyboard arrows and selects with enter', async () => {
    const onSelect = vi.fn();
    const user = userEvent.setup();
    render(
      <MedicationSearch
        onSelect={onSelect}
        searchFn={mockSearchFn}
        recentSelections={mockMeds.slice(0, 2)}
        debounceMs={300}
      />
    );

    const input = screen.getByRole('combobox');
    await user.click(input);

    // Recent selections should appear
    await waitFor(() => {
      expect(screen.getAllByRole('option').length).toBeGreaterThan(0);
    });

    await user.keyboard('{ArrowDown}');
    await user.keyboard('{Enter}');

    expect(onSelect).toHaveBeenCalled();
  });

  it('closes dropdown on Escape', async () => {
    const user = userEvent.setup();
    render(
      <MedicationSearch
        onSelect={() => {}}
        searchFn={mockSearchFn}
        debounceMs={0}
      />
    );

    const input = screen.getByRole('combobox');
    await user.type(input, 'Lip');

    await waitFor(() => {
      expect(screen.getByText('Lipitor')).toBeInTheDocument();
    });

    await user.keyboard('{Escape}');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('shows controlled substance indicator', async () => {
    const user = userEvent.setup();
    render(
      <MedicationSearch
        onSelect={() => {}}
        searchFn={mockSearchFn}
        debounceMs={0}
      />
    );

    await user.type(screen.getByRole('combobox'), 'Adder');

    await waitFor(() => {
      expect(screen.getByText('Controlled')).toBeInTheDocument();
    });
  });

  it('shows prior auth indicator', async () => {
    const user = userEvent.setup();
    render(
      <MedicationSearch
        onSelect={() => {}}
        searchFn={mockSearchFn}
        debounceMs={0}
      />
    );

    await user.type(screen.getByRole('combobox'), 'Adder');

    await waitFor(() => {
      expect(screen.getByText('Prior Auth')).toBeInTheDocument();
    });
  });

  it('shows loading indicator while searching', async () => {
    const slowSearch = vi.fn().mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve([]), 1000))
    );
    const user = userEvent.setup();
    render(
      <MedicationSearch
        onSelect={() => {}}
        searchFn={slowSearch}
        debounceMs={0}
      />
    );

    await user.type(screen.getByRole('combobox'), 'test');

    await waitFor(() => {
      expect(screen.getByRole('status', { name: /Loading/ })).toBeInTheDocument();
    });
  });

  it('clears input after selection', async () => {
    const user = userEvent.setup();
    render(
      <MedicationSearch
        onSelect={() => {}}
        searchFn={mockSearchFn}
        debounceMs={0}
      />
    );

    const input = screen.getByRole('combobox');
    await user.type(input, 'Lip');

    await waitFor(() => {
      expect(screen.getByText('Lipitor')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Lipitor'));
    expect(input).toHaveValue('');
  });

  it('respects maxResults prop', async () => {
    const user = userEvent.setup();
    const manyResults = vi.fn().mockResolvedValue(
      Array.from({ length: 20 }, (_, i) => ({
        id: String(i),
        brandName: `Med ${i}`,
        genericName: `Generic ${i}`,
        strength: '10mg',
        form: 'tablet',
        controlledSubstance: false,
        requiresPriorAuth: false,
      }))
    );

    render(
      <MedicationSearch
        onSelect={() => {}}
        searchFn={manyResults}
        debounceMs={0}
        maxResults={5}
      />
    );

    await user.type(screen.getByRole('combobox'), 'med');

    await waitFor(() => {
      const options = screen.getAllByRole('option');
      expect(options).toHaveLength(5);
    });
  });
});
