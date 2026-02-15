import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DataTable } from './DataTable';
import type { ColumnDef } from './DataTable.types';

interface TestRow {
  id: string;
  name: string;
  age: number;
  [key: string]: unknown;
}

const testData: TestRow[] = [
  { id: '1', name: 'Alice', age: 30 },
  { id: '2', name: 'Bob', age: 25 },
  { id: '3', name: 'Charlie', age: 35 },
];

const columns: ColumnDef<TestRow>[] = [
  { id: 'name', header: 'Name', accessor: 'name', sortable: true },
  { id: 'age', header: 'Age', accessor: 'age', sortable: true, align: 'center' },
];

describe('DataTable', () => {
  it('renders column headers', () => {
    render(<DataTable data={testData} columns={columns} />);
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Age')).toBeInTheDocument();
  });

  it('renders data rows', () => {
    render(<DataTable data={testData} columns={columns} />);
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByText('Charlie')).toBeInTheDocument();
  });

  it('has grid role with accessible label', () => {
    render(<DataTable data={testData} columns={columns} />);
    expect(screen.getByRole('grid', { name: 'Data table' })).toBeInTheDocument();
  });

  it('renders empty state when no data', () => {
    render(<DataTable data={[]} columns={columns} />);
    expect(screen.getByText('No data available')).toBeInTheDocument();
  });

  it('renders custom empty state', () => {
    render(
      <DataTable
        data={[]}
        columns={columns}
        emptyState={<span>Custom empty</span>}
      />
    );
    expect(screen.getByText('Custom empty')).toBeInTheDocument();
  });

  it('renders loading skeleton', () => {
    const { container } = render(
      <DataTable data={[]} columns={columns} loading />
    );
    // Should have skeleton rows
    const skeletons = container.querySelectorAll('[class*="skeleton"]');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('calls onSort when clicking sortable column header', async () => {
    const onSort = vi.fn();
    const user = userEvent.setup();

    render(
      <DataTable
        data={testData}
        columns={columns}
        sorting={{ column: 'name', direction: 'asc', onSort }}
      />
    );

    await user.click(screen.getByText('Name'));
    expect(onSort).toHaveBeenCalledWith('name', 'desc');
  });

  it('toggles sort direction correctly', async () => {
    const onSort = vi.fn();
    const user = userEvent.setup();

    render(
      <DataTable
        data={testData}
        columns={columns}
        sorting={{ column: 'age', direction: 'desc', onSort }}
      />
    );

    await user.click(screen.getByText('Age'));
    expect(onSort).toHaveBeenCalledWith('age', 'asc');
  });

  it('shows aria-sort attribute on sorted column', () => {
    render(
      <DataTable
        data={testData}
        columns={columns}
        sorting={{ column: 'name', direction: 'asc', onSort: vi.fn() }}
      />
    );

    const nameHeader = screen.getByText('Name').closest('th');
    expect(nameHeader).toHaveAttribute('aria-sort', 'ascending');
  });

  it('renders checkboxes for multi-select mode', () => {
    render(
      <DataTable
        data={testData}
        columns={columns}
        selection={{ selected: [], onSelectionChange: vi.fn(), mode: 'multiple' }}
      />
    );

    // select-all + one per row
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes).toHaveLength(testData.length + 1);
  });

  it('calls onSelectionChange when checkbox is clicked', async () => {
    const onSelectionChange = vi.fn();
    const user = userEvent.setup();

    render(
      <DataTable
        data={testData}
        columns={columns}
        selection={{ selected: [], onSelectionChange, mode: 'multiple' }}
      />
    );

    const checkboxes = screen.getAllByRole('checkbox');
    // Click first data row checkbox (index 1, index 0 is select-all)
    await user.click(checkboxes[1]);
    expect(onSelectionChange).toHaveBeenCalledWith(['1']);
  });

  it('selects all rows when select-all is clicked', async () => {
    const onSelectionChange = vi.fn();
    const user = userEvent.setup();

    render(
      <DataTable
        data={testData}
        columns={columns}
        selection={{ selected: [], onSelectionChange, mode: 'multiple' }}
      />
    );

    const selectAll = screen.getByLabelText('Select all rows');
    await user.click(selectAll);
    expect(onSelectionChange).toHaveBeenCalledWith(['1', '2', '3']);
  });

  it('deselects all when all are selected and select-all is clicked', async () => {
    const onSelectionChange = vi.fn();
    const user = userEvent.setup();

    render(
      <DataTable
        data={testData}
        columns={columns}
        selection={{ selected: ['1', '2', '3'], onSelectionChange, mode: 'multiple' }}
      />
    );

    const selectAll = screen.getByLabelText('Select all rows');
    await user.click(selectAll);
    expect(onSelectionChange).toHaveBeenCalledWith([]);
  });

  it('uses radio buttons for single-select mode', () => {
    render(
      <DataTable
        data={testData}
        columns={columns}
        selection={{ selected: [], onSelectionChange: vi.fn(), mode: 'single' }}
      />
    );

    const radios = screen.getAllByRole('radio');
    expect(radios).toHaveLength(testData.length);
  });

  it('calls onRowClick when a row is clicked', async () => {
    const onRowClick = vi.fn();
    const user = userEvent.setup();

    render(
      <DataTable data={testData} columns={columns} onRowClick={onRowClick} />
    );

    await user.click(screen.getByText('Alice'));
    expect(onRowClick).toHaveBeenCalledWith(testData[0]);
  });

  it('supports keyboard navigation for clickable rows', async () => {
    const onRowClick = vi.fn();
    const user = userEvent.setup();

    render(
      <DataTable data={testData} columns={columns} onRowClick={onRowClick} />
    );

    const row = screen.getByText('Alice').closest('tr')!;
    row.focus();
    await user.keyboard('{Enter}');
    expect(onRowClick).toHaveBeenCalledWith(testData[0]);
  });

  it('renders custom cell renderer', () => {
    const customColumns: ColumnDef<TestRow>[] = [
      {
        id: 'name',
        header: 'Name',
        accessor: 'name',
        cell: (value) => <strong data-testid="custom-cell">{String(value)}</strong>,
      },
    ];

    render(<DataTable data={testData} columns={customColumns} />);
    expect(screen.getAllByTestId('custom-cell')).toHaveLength(testData.length);
  });

  it('renders pagination controls', () => {
    render(
      <DataTable
        data={testData}
        columns={columns}
        pagination={{
          page: 1,
          pageSize: 10,
          total: 50,
          onPageChange: vi.fn(),
          onPageSizeChange: vi.fn(),
        }}
      />
    );

    expect(screen.getByText('1-10 of 50')).toBeInTheDocument();
    expect(screen.getByText('Page 1 of 5')).toBeInTheDocument();
  });

  it('calls onPageChange when next page is clicked', async () => {
    const onPageChange = vi.fn();
    const user = userEvent.setup();

    render(
      <DataTable
        data={testData}
        columns={columns}
        pagination={{
          page: 1,
          pageSize: 10,
          total: 50,
          onPageChange,
          onPageSizeChange: vi.fn(),
        }}
      />
    );

    await user.click(screen.getByLabelText('Next page'));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it('disables previous page button on first page', () => {
    render(
      <DataTable
        data={testData}
        columns={columns}
        pagination={{
          page: 1,
          pageSize: 10,
          total: 50,
          onPageChange: vi.fn(),
          onPageSizeChange: vi.fn(),
        }}
      />
    );

    expect(screen.getByLabelText('Previous page')).toBeDisabled();
    expect(screen.getByLabelText('First page')).toBeDisabled();
  });

  it('disables next page button on last page', () => {
    render(
      <DataTable
        data={testData}
        columns={columns}
        pagination={{
          page: 5,
          pageSize: 10,
          total: 50,
          onPageChange: vi.fn(),
          onPageSizeChange: vi.fn(),
        }}
      />
    );

    expect(screen.getByLabelText('Next page')).toBeDisabled();
    expect(screen.getByLabelText('Last page')).toBeDisabled();
  });

  it('calls onPageSizeChange when page size is changed', async () => {
    const onPageSizeChange = vi.fn();
    const user = userEvent.setup();

    render(
      <DataTable
        data={testData}
        columns={columns}
        pagination={{
          page: 1,
          pageSize: 10,
          total: 50,
          onPageChange: vi.fn(),
          onPageSizeChange,
        }}
      />
    );

    await user.selectOptions(screen.getByLabelText('Rows per page'), '25');
    expect(onPageSizeChange).toHaveBeenCalledWith(25);
  });

  it('uses function accessor correctly', () => {
    const fnColumns: ColumnDef<TestRow>[] = [
      { id: 'greeting', header: 'Greeting', accessor: (row) => `Hello ${row.name}` },
    ];

    render(<DataTable data={testData} columns={fnColumns} />);
    expect(screen.getByText('Hello Alice')).toBeInTheDocument();
  });

  it('marks selected rows with aria-selected', () => {
    render(
      <DataTable
        data={testData}
        columns={columns}
        selection={{ selected: ['1'], onSelectionChange: vi.fn(), mode: 'multiple' }}
      />
    );

    const row = screen.getByText('Alice').closest('tr');
    expect(row).toHaveAttribute('aria-selected', 'true');
  });
});
