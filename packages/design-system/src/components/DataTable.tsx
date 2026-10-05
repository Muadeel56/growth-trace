import type { ReactNode } from 'react';

import { cn } from '../lib/cn';
import { Panel } from './Panel';

export type DataTableColumn<Row> = {
  key: string;
  header: string;
  /** Cell content. Defaults to the row's `key` field when it is a string or number. */
  cell?: (row: Row) => ReactNode;
  /** Right-align numbers in table mode. */
  numeric?: boolean;
};

export type DataTableProps<Row> = {
  /** Names the table for assistive tech; shown above the table. */
  caption: string;
  columns: DataTableColumn<Row>[];
  rows: Row[];
  /** Stable key per row. */
  rowKey: (row: Row) => string;
  className?: string;
};

function render<Row>(column: DataTableColumn<Row>, row: Row): ReactNode {
  if (column.cell) return column.cell(row);
  const value = (row as Record<string, unknown>)[column.key];
  return typeof value === 'string' || typeof value === 'number' ? value : null;
}

/**
 * Tabular data that fits any width: a semantic <table> from md up, and a list of cards
 * (one <dl> per row) below md. Both are rendered; `hidden` keeps only one in the
 * accessibility tree at a time.
 */
export function DataTable<Row>({ caption, columns, rows, rowKey, className }: DataTableProps<Row>) {
  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <table data-table-mode="table" className="hidden w-full border-collapse md:table">
        <caption className="pb-3 text-left text-body-sm text-muted">{caption}</caption>
        <thead>
          <tr className="border-b border-border">
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={cn(
                  'px-3 py-2 text-caption text-muted',
                  column.numeric ? 'text-right' : 'text-left',
                )}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={rowKey(row)} className="border-b border-border last:border-b-0">
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={cn(
                    'px-3 py-2 align-top text-body-sm break-words text-text',
                    column.numeric ? 'text-right tabular-nums' : 'text-left',
                  )}
                >
                  {render(column, row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <div data-table-mode="cards" className="flex flex-col gap-3 md:hidden">
        <p className="text-body-sm text-muted">{caption}</p>
        <ul aria-label={caption} className="flex flex-col gap-3">
          {rows.map((row) => (
            <li key={rowKey(row)}>
              <Panel tone="raised" padding="sm">
                <dl className="flex flex-col gap-2">
                  {columns.map((column) => (
                    <div key={column.key} className="flex min-w-0 flex-col">
                      <dt className="text-caption text-muted">{column.header}</dt>
                      <dd
                        className={cn(
                          'text-body-sm break-words text-text',
                          column.numeric && 'tabular-nums',
                        )}
                      >
                        {render(column, row)}
                      </dd>
                    </div>
                  ))}
                </dl>
              </Panel>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
