import { useState, useEffect, useRef, useCallback } from 'react';
import { DataTable, DataTablePageEvent, DataTableSelectionMultipleChangeEvent } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { OverlayPanel } from 'primereact/overlaypanel';
import { Button } from 'primereact/button';
import { InputNumber } from 'primereact/inputnumber';
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

interface Artwork {
  id: number;
  title: string | null;
  place_of_origin: string | null;
  artist_display: string | null;
  inscriptions: string | null;
  date_start: number | null;
  date_end: number | null;
}

interface Pagination {
  total: number;
  limit: number;
  total_pages: number;
  current_page: number;
}

interface ApiResponse {
  data: Artwork[];
  pagination: Pagination;
}

function App() {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(12);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [deselectedIds, setDeselectedIds] = useState<Set<number>>(new Set());
  const [autoSelectCount, setAutoSelectCount] = useState(0);

  const overlayRef = useRef<OverlayPanel>(null);
  const [selectInput, setSelectInput] = useState<number | null>(null);

  const fetchArtworks = useCallback(async (page: number) => {
    setLoading(true);
    try {
      const res = await fetch(`https://api.artic.edu/api/v1/artworks?page=${page}`);
      const data: ApiResponse = await res.json();
      setArtworks(data.data);
      setTotalRecords(data.pagination.total);
      setRowsPerPage(data.pagination.limit);
    } catch (err) {
      console.error('Failed to fetch artworks:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchArtworks(currentPage);
  }, [currentPage, fetchArtworks]);

  const getSelectedRows = (): Artwork[] => {
    const globalStartIndex = (currentPage - 1) * rowsPerPage;
    return artworks.filter((artwork, localIndex) => {
      const globalIndex = globalStartIndex + localIndex;
      if (selectedIds.has(artwork.id)) return true;
      if (globalIndex < autoSelectCount && !deselectedIds.has(artwork.id)) return true;
      return false;
    });
  };

  const handleSelectionChange = (e: DataTableSelectionMultipleChangeEvent<Artwork[]>) => {
    const newSelected = e.value as Artwork[];
    const newSelectedSet = new Set(newSelected.map((r) => r.id));
    const globalStartIndex = (currentPage - 1) * rowsPerPage;

    setSelectedIds((prev) => {
      const updated = new Set(prev);
      artworks.forEach((artwork) => {
        if (newSelectedSet.has(artwork.id)) {
          updated.add(artwork.id);
        } else {
          updated.delete(artwork.id);
        }
      });
      return updated;
    });

    setDeselectedIds((prev) => {
      const updated = new Set(prev);
      artworks.forEach((artwork, localIndex) => {
        const globalIndex = globalStartIndex + localIndex;
        if (globalIndex < autoSelectCount) {
          if (newSelectedSet.has(artwork.id)) {
            updated.delete(artwork.id);
          } else {
            updated.add(artwork.id);
          }
        }
      });
      return updated;
    });
  };

  const handlePageChange = (e: DataTablePageEvent) => {
    const newPage = (e.page ?? 0) + 1;
    setCurrentPage(newPage);
  };

  const handleCustomSelect = () => {
    if (!selectInput || selectInput <= 0) return;

    setAutoSelectCount(selectInput);
    setSelectedIds(new Set());
    setDeselectedIds(new Set());

    overlayRef.current?.hide();
    setSelectInput(null);
  };

  const selectedRows = getSelectedRows();
  const totalSelected =
    autoSelectCount > 0
      ? Math.min(autoSelectCount, totalRecords) - deselectedIds.size + selectedIds.size
      : selectedIds.size;

  const selectionColumnHeader = (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
      <button
        onClick={(e) => overlayRef.current?.toggle(e)}
        title="Custom row selection"
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '2px 4px',
          color: '#f5f0e8',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <i className="pi pi-chevron-down" style={{ fontSize: '0.75rem' }} />
      </button>
    </div>
  );

  const textOrDash = (val: string | number | null | undefined) =>
    val !== null && val !== undefined && val !== '' ? String(val) : '—';

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)' }}>
      {/* Header */}
      <header
        style={{
          borderBottom: '3px solid var(--ink)',
          padding: '2rem 2.5rem 1.5rem',
          background: 'var(--ink)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem', flexWrap: 'wrap' }}>
          <h1
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: '2rem',
              fontWeight: 700,
              color: 'var(--cream)',
              letterSpacing: '-0.01em',
              lineHeight: 1,
            }}
          >
            Art Institute of Chicago
          </h1>
          <span
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: '0.7rem',
              letterSpacing: '0.15em',
              color: 'var(--gold)',
              textTransform: 'uppercase',
            }}
          >
            Collection Browser
          </span>
        </div>
        {totalSelected > 0 && (
          <div
            style={{
              marginTop: '0.75rem',
              fontFamily: "'DM Mono', monospace",
              fontSize: '0.72rem',
              color: 'var(--gold)',
              letterSpacing: '0.1em',
            }}
          >
            {totalSelected.toLocaleString()} artwork{totalSelected !== 1 ? 's' : ''} selected
          </div>
        )}
      </header>

      {/* Overlay Panel */}
      <OverlayPanel ref={overlayRef} style={{ width: '240px' }}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            padding: '4px',
          }}
        >
          <p
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: '0.72rem',
              letterSpacing: '0.08em',
              color: 'var(--muted)',
              textTransform: 'uppercase',
            }}
          >
            Select first N rows
          </p>
          <InputNumber
            value={selectInput}
            onValueChange={(e) => setSelectInput(e.value ?? null)}
            placeholder="Number of rows"
            min={1}
            max={totalRecords}
            style={{ width: '100%' }}
          />
          <Button
            label="Apply"
            onClick={handleCustomSelect}
            style={{
              background: 'var(--rust)',
              border: 'none',
              borderRadius: '2px',
              fontFamily: "'DM Mono', monospace",
              fontSize: '0.75rem',
              letterSpacing: '0.08em',
              padding: '0.6rem 1rem',
            }}
          />
        </div>
      </OverlayPanel>

      {/* Table */}
      <main style={{ padding: '2rem 2.5rem' }}>
        <DataTable
          value={artworks}
          lazy
          paginator
          rows={rowsPerPage}
          totalRecords={totalRecords}
          first={(currentPage - 1) * rowsPerPage}
          onPage={handlePageChange}
          loading={loading}
          selection={selectedRows}
          onSelectionChange={handleSelectionChange}
          selectionMode="multiple"
          dataKey="id"
          tableStyle={{ minWidth: '50rem' }}
          style={{
            border: '2px solid var(--ink)',
            borderRadius: '4px',
            overflow: 'hidden',
          }}
        >
          <Column
            selectionMode="multiple"
            headerStyle={{ width: '3.5rem' }}
            header={selectionColumnHeader}
          />
          <Column
            field="title"
            header="Title"
            style={{ maxWidth: '220px' }}
            body={(row: Artwork) => (
              <span style={{ fontWeight: 400 }}>{textOrDash(row.title)}</span>
            )}
          />
          <Column
            field="place_of_origin"
            header="Place of Origin"
            style={{ maxWidth: '160px' }}
            body={(row: Artwork) => textOrDash(row.place_of_origin)}
          />
          <Column
            field="artist_display"
            header="Artist"
            style={{ maxWidth: '200px' }}
            body={(row: Artwork) => (
              <span style={{ whiteSpace: 'pre-line', lineHeight: 1.4 }}>
                {textOrDash(row.artist_display)}
              </span>
            )}
          />
          <Column
            field="inscriptions"
            header="Inscriptions"
            style={{ maxWidth: '200px' }}
            body={(row: Artwork) => (
              <span
                style={{
                  color: row.inscriptions ? 'var(--ink)' : 'var(--muted)',
                  fontStyle: row.inscriptions ? 'normal' : 'italic',
                }}
              >
                {textOrDash(row.inscriptions)}
              </span>
            )}
          />
          <Column
            field="date_start"
            header="Date Start"
            style={{ width: '110px' }}
            body={(row: Artwork) => textOrDash(row.date_start)}
          />
          <Column
            field="date_end"
            header="Date End"
            style={{ width: '110px' }}
            body={(row: Artwork) => textOrDash(row.date_end)}
          />
        </DataTable>
      </main>
    </div>
  );
}

export default App;
