export interface Medication {
  id: string;
  brandName: string;
  genericName: string;
  strength: string;
  /** e.g., tablet, capsule, injection */
  form: string;
  controlledSubstance: boolean;
  requiresPriorAuth: boolean;
}

export interface MedicationSearchProps {
  /** Called when a medication is selected */
  onSelect: (medication: Medication) => void;
  /** Search function that returns medications matching the query */
  searchFn: (query: string) => Promise<Medication[]>;
  /** Debounce delay in milliseconds (default: 300) */
  debounceMs?: number;
  /** Input placeholder text */
  placeholder?: string;
  /** Recently selected medications shown before search */
  recentSelections?: Medication[];
  /** Maximum number of results to display (default: 10) */
  maxResults?: number;
}
