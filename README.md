# MedKit

A production-ready React component library for healthcare applications. Built with TypeScript, tested with Vitest, and documented with Storybook.

## Installation

```bash
npm install medkit
```

### Peer Dependencies

MedKit requires React 18 or 19:

```bash
npm install react react-dom
```

## Quick Start

```tsx
import { AppointmentCard, VitalSignsInput } from 'medkit';
import 'medkit/styles.css';
```

> **Note:** You must import `medkit/styles.css` once in your app for components to render correctly.

## Components

### AppointmentCard

Displays appointment info with patient details, scheduling, status badge, and action controls.

```tsx
import { AppointmentCard } from 'medkit';

<AppointmentCard
  patient={{
    name: 'Sarah Johnson',
    dateOfBirth: new Date('1990-05-15'),
    mrn: 'MRN-001234',
  }}
  appointment={{
    id: 'appt-001',
    scheduledTime: new Date('2025-03-15T10:30:00'),
    duration: 30,
    type: 'in-person',
    status: 'scheduled',
    reason: 'Annual physical exam',
  }}
  provider={{ name: 'Dr. Emily Chen', specialty: 'Internal Medicine' }}
  onStatusChange={(status) => console.log(status)}
  onReschedule={() => {}}
  onCancel={() => {}}
/>
```

### VitalSignsInput

Medical-grade vital signs input with validation, unit conversion, abnormal value highlighting, and BMI auto-calculation.

```tsx
import { VitalSignsInput } from 'medkit';

<VitalSignsInput
  onChange={(vitals) => console.log(vitals)}
  requiredFields={['bloodPressureSystolic', 'bloodPressureDiastolic', 'heartRate']}
  onValidationError={(errors) => console.log(errors)}
/>
```

### MedicationSearch

Autocomplete search with debouncing, keyboard navigation, and visual indicators for controlled substances.

```tsx
import { MedicationSearch } from 'medkit';

<MedicationSearch
  onSelect={(medication) => console.log(medication)}
  searchFn={async (query) => {
    const res = await fetch(`/api/medications?q=${query}`);
    return res.json();
  }}
  debounceMs={300}
  recentSelections={[]}
/>
```

### TimeSlotPicker

Visual time grid organized by morning/afternoon/evening with timezone support.

```tsx
import { TimeSlotPicker } from 'medkit';

<TimeSlotPicker
  date={new Date()}
  availableSlots={slots}
  onSelect={(slot) => console.log(slot)}
  timezone="America/New_York"
  slotDuration={30}
/>
```

### DataTable

Feature-rich table with server-side pagination, sorting, row selection, loading skeletons, and row virtualization.

```tsx
import { DataTable } from 'medkit';

<DataTable
  data={patients}
  columns={[
    { id: 'name', header: 'Name', accessor: 'name', sortable: true },
    { id: 'age', header: 'Age', accessor: 'age', align: 'center' },
  ]}
  pagination={{ page, pageSize, total, onPageChange, onPageSizeChange }}
  sorting={{ column, direction, onSort }}
  selection={{ selected, onSelectionChange, mode: 'multiple' }}
  stickyHeader
/>
```

## Utilities

MedKit exports helper functions for common healthcare data tasks:

| Function | Description |
|---|---|
| `calculateAge(dob)` | Calculate age from a date of birth |
| `formatTime(date)` | Format a date as a time string |
| `formatDate(date)` | Format a date as a date string |
| `formatDuration(minutes)` | Format a duration in minutes to a readable string |
| `convertTemperature(value, unit)` | Convert between Fahrenheit and Celsius |
| `convertWeight(value, unit)` | Convert between lbs and kg |
| `convertHeight(value, unit)` | Convert between inches and cm |
| `calculateBMI(weight, height)` | Calculate BMI from weight and height |
| `getBMICategory(bmi)` | Get the BMI category label |
| `isValueNormal(type, value)` | Check if a vital sign value is within normal range |
| `validateVitalValue(type, value)` | Validate a vital sign input value |

### Hooks

- **`useDebounce(value, delay)`** — Debounce a value by a given delay in milliseconds.

## Development

```bash
npm install            # Install dependencies
npm run dev            # Watch mode build
npm test               # Run tests
npm run test:watch     # Watch mode tests
npm run test:coverage  # Coverage report
npm run storybook      # Start Storybook on port 6006
npm run build          # Production build
npm run lint           # Type check
```

## Project Structure

```
src/
├── components/
│   ├── AppointmentCard/
│   ├── DataTable/
│   ├── MedicationSearch/
│   ├── TimeSlotPicker/
│   └── VitalSignsInput/
├── hooks/
│   └── useDebounce.ts
├── utils/
│   ├── date.ts
│   └── vitals.ts
└── index.ts
```

Each component directory contains the component, its types, CSS module, tests, and Storybook stories.

## Accessibility

All components are built to WCAG 2.1 AA standards:

- Proper ARIA labels and roles on all interactive elements
- Full keyboard navigation support
- Focus management for dropdowns and modals
- Color contrast compliant styling
- Screen reader friendly with semantic HTML

## License

MIT
