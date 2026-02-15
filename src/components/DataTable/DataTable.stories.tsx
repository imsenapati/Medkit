import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { DataTable } from './DataTable';
import type { ColumnDef } from './DataTable.types';

interface Patient {
  id: string;
  name: string;
  age: number;
  mrn: string;
  status: string;
  lastVisit: string;
  [key: string]: unknown;
}

const sampleData: Patient[] = Array.from({ length: 50 }, (_, i) => ({
  id: `pat-${i + 1}`,
  name: `Patient ${i + 1}`,
  age: 25 + (i % 50),
  mrn: `MRN-${String(i + 1).padStart(6, '0')}`,
  status: ['Active', 'Inactive', 'Pending'][i % 3],
  lastVisit: `2025-${String((i % 12) + 1).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}`,
}));

const columns: ColumnDef<Patient>[] = [
  { id: 'name', header: 'Name', accessor: 'name', sortable: true },
  { id: 'age', header: 'Age', accessor: 'age', sortable: true, align: 'center', width: 80 },
  { id: 'mrn', header: 'MRN', accessor: 'mrn' },
  {
    id: 'status',
    header: 'Status',
    accessor: 'status',
    sortable: true,
    cell: (value) => {
      const color = value === 'Active' ? '#10b981' : value === 'Inactive' ? '#94a3b8' : '#f59e0b';
      return (
        <span style={{ color, fontWeight: 500 }}>
          {String(value)}
        </span>
      );
    },
  },
  { id: 'lastVisit', header: 'Last Visit', accessor: 'lastVisit', sortable: true },
];

const meta: Meta<typeof DataTable<Patient>> = {
  title: 'Components/DataTable',
  component: DataTable,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof DataTable<Patient>>;

export const Default: Story = {
  args: {
    data: sampleData.slice(0, 10),
    columns,
  },
};

const PaginatedComponent = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const start = (page - 1) * pageSize;
  const pageData = sampleData.slice(start, start + pageSize);

  return (
    <DataTable<Patient>
      data={pageData}
      columns={columns}
      pagination={{
        page,
        pageSize,
        total: sampleData.length,
        onPageChange: setPage,
        onPageSizeChange: (size) => {
          setPageSize(size);
          setPage(1);
        },
      }}
    />
  );
};

export const WithPagination: Story = {
  render: () => <PaginatedComponent />,
};

const SortableComponent = () => {
  const [sortCol, setSortCol] = useState('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const sorted = [...sampleData].sort((a, b) => {
    const aVal = a[sortCol as keyof Patient];
    const bVal = b[sortCol as keyof Patient];
    const cmp = String(aVal).localeCompare(String(bVal), undefined, { numeric: true });
    return sortDir === 'asc' ? cmp : -cmp;
  });

  return (
    <DataTable<Patient>
      data={sorted.slice(0, 10)}
      columns={columns}
      sorting={{
        column: sortCol,
        direction: sortDir,
        onSort: (col, dir) => {
          setSortCol(col);
          setSortDir(dir);
        },
      }}
    />
  );
};

export const WithSorting: Story = {
  render: () => <SortableComponent />,
};

const SelectableComponent = () => {
  const [selected, setSelected] = useState<string[]>([]);

  return (
    <DataTable<Patient>
      data={sampleData.slice(0, 10)}
      columns={columns}
      selection={{
        selected,
        onSelectionChange: setSelected,
        mode: 'multiple',
      }}
    />
  );
};

export const WithSelection: Story = {
  render: () => <SelectableComponent />,
};

export const Loading: Story = {
  args: {
    data: [],
    columns,
    loading: true,
  },
};

export const Empty: Story = {
  args: {
    data: [],
    columns,
    emptyState: (
      <div>
        <p style={{ fontSize: 16, fontWeight: 500, color: '#475569' }}>No patients found</p>
        <p style={{ color: '#94a3b8' }}>Try adjusting your search filters</p>
      </div>
    ),
  },
};

export const StickyHeader: Story = {
  args: {
    data: sampleData.slice(0, 20),
    columns,
    stickyHeader: true,
  },
  decorators: [
    (Story) => (
      <div style={{ height: 300, overflow: 'auto' }}>
        <Story />
      </div>
    ),
  ],
};

export const RowClick: Story = {
  args: {
    data: sampleData.slice(0, 10),
    columns,
    onRowClick: (row) => console.log('Row clicked:', row),
  },
};

export const Mobile: Story = {
  args: { ...Default.args },
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
  },
};
