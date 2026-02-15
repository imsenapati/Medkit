import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useDebounce } from '../../hooks/useDebounce';
import type { Medication, MedicationSearchProps } from './MedicationSearch.types';
import styles from './MedicationSearch.module.css';

/**
 * MedicationSearch provides an autocomplete search field for finding medications.
 * Features debounced search, keyboard navigation, recent selections, and visual
 * indicators for controlled substances and prior auth requirements.
 */
export const MedicationSearch: React.FC<MedicationSearchProps> = ({
  onSelect,
  searchFn,
  debounceMs = 300,
  placeholder = 'Search medications...',
  recentSelections = [],
  maxResults = 10,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const debouncedQuery = useDebounce(query, debounceMs);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Compute the items to display
  const showRecent = query.length === 0 && recentSelections.length > 0;
  const displayItems = showRecent ? recentSelections : results.slice(0, maxResults);

  // Search when debounced query changes
  useEffect(() => {
    if (debouncedQuery.length === 0) {
      setResults([]);
      setLoading(false);
      return;
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    searchFn(debouncedQuery)
      .then((data) => {
        if (!controller.signal.aborted) {
          setResults(data);
          setLoading(false);
          setHighlightedIndex(-1);
        }
      })
      .catch((err) => {
        if (!controller.signal.aborted) {
          setResults([]);
          setLoading(false);
        }
      });

    return () => {
      controller.abort();
    };
  }, [debouncedQuery, searchFn]);

  const handleSelect = useCallback(
    (med: Medication) => {
      onSelect(med);
      setQuery('');
      setResults([]);
      setIsOpen(false);
      setHighlightedIndex(-1);
      inputRef.current?.focus();
    },
    [onSelect]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        setIsOpen(true);
        return;
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < displayItems.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : displayItems.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < displayItems.length) {
          handleSelect(displayItems[highlightedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;
    }
  };

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const items = listRef.current.querySelectorAll('[role="option"]');
      const item = items[highlightedIndex] as HTMLElement;
      item?.scrollIntoView?.({ block: 'nearest' });
    }
  }, [highlightedIndex]);

  const handleFocus = () => {
    setIsOpen(true);
  };

  const handleBlur = (e: React.FocusEvent) => {
    // Don't close if focus moves within the dropdown
    if (listRef.current?.contains(e.relatedTarget as Node)) return;
    // Delay to allow click to register
    setTimeout(() => setIsOpen(false), 150);
  };

  const listboxId = 'medication-search-listbox';

  return (
    <div className={styles.container}>
      <div className={styles.inputWrapper}>
        <svg className={styles.searchIcon} viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
          <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1ZM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0Z"/>
        </svg>
        <input
          ref={inputRef}
          className={styles.input}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          role="combobox"
          aria-expanded={isOpen}
          aria-controls={listboxId}
          aria-activedescendant={
            highlightedIndex >= 0 ? `med-option-${highlightedIndex}` : undefined
          }
          aria-autocomplete="list"
          aria-label="Search medications"
        />
        {loading && <div className={styles.spinner} role="status" aria-label="Loading results" />}
      </div>

      {isOpen && (
        <div
          ref={listRef}
          className={styles.dropdown}
          role="listbox"
          id={listboxId}
          aria-label="Medication results"
        >
          {showRecent && (
            <>
              <div className={styles.sectionLabel}>Recent</div>
              {recentSelections.map((med, i) => (
                <MedicationItem
                  key={med.id}
                  medication={med}
                  index={i}
                  highlighted={highlightedIndex === i}
                  onSelect={handleSelect}
                />
              ))}
            </>
          )}

          {!showRecent && query.length > 0 && !loading && results.length === 0 && (
            <div className={styles.noResults} role="status">
              No medications found for &ldquo;{query}&rdquo;
            </div>
          )}

          {!showRecent && query.length === 0 && recentSelections.length === 0 && (
            <div className={styles.emptyState}>
              Start typing to search medications
            </div>
          )}

          {!showRecent &&
            displayItems.map((med, i) => (
              <MedicationItem
                key={med.id}
                medication={med}
                index={i}
                highlighted={highlightedIndex === i}
                onSelect={handleSelect}
              />
            ))}
        </div>
      )}
    </div>
  );
};

interface MedicationItemProps {
  medication: Medication;
  index: number;
  highlighted: boolean;
  onSelect: (med: Medication) => void;
}

const MedicationItem: React.FC<MedicationItemProps> = ({
  medication,
  index,
  highlighted,
  onSelect,
}) => (
  <button
    className={`${styles.item} ${highlighted ? styles.itemHighlighted : ''}`}
    role="option"
    id={`med-option-${index}`}
    aria-selected={highlighted}
    onMouseDown={(e) => {
      e.preventDefault();
      onSelect(medication);
    }}
    tabIndex={-1}
  >
    <div className={styles.itemContent}>
      <div className={styles.brandName}>{medication.brandName}</div>
      <div className={styles.genericName}>{medication.genericName}</div>
      <div className={styles.itemMeta}>
        <span className={styles.tagForm}>{medication.form}</span>
        <span className={styles.tagStrength}>{medication.strength}</span>
        {medication.controlledSubstance && (
          <span className={styles.tagControlled}>Controlled</span>
        )}
        {medication.requiresPriorAuth && (
          <span className={styles.tagPriorAuth}>Prior Auth</span>
        )}
      </div>
    </div>
  </button>
);
