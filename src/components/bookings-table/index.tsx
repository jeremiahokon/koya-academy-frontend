'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import {
  createColumnHelper,
  tableFeatures,
  useTable,
} from '@tanstack/react-table';

import { formatDate, formatDateTime, formatTime } from '@/lib/format';

import type { Booking, Slot } from '@/services/types';

type Row = Booking & { slot?: Slot };

// Pagination is server-side by cursor (see BookingsLookup), so the table only
// needs the core features: columns and rows.
const features = tableFeatures({});
const column = createColumnHelper<typeof features, Row>();

const columns = column.columns([
  column.display({
    id: 'appointment',
    header: 'Appointment',
    cell: ({ row }) => {
      const { slot, slot_id } = row.original;

      if (!slot) return <span className="muted">{slot_id}</span>;

      return (
        <>
          <span className="cell-strong">
            {formatTime(slot.start)}–{formatTime(slot.end)}
          </span>
          <span className="cell-sub">{formatDate(slot.start)}</span>
        </>
      );
    },
  }),
  column.display({
    id: 'doctor',
    header: 'Doctor',
    cell: ({ row }) => row.original.slot?.provider ?? '—',
  }),
  column.accessor('status', {
    header: 'Status',
    cell: (info) => (
      <span className={`badge ${info.getValue()}`}>{info.getValue()}</span>
    ),
  }),
  column.accessor('created_at', {
    header: 'Booked on',
    cell: (info) => (
      <span className="muted">{formatDateTime(info.getValue())}</span>
    ),
  }),
  column.display({
    id: 'view',
    header: () => <span className="sr-only">Details</span>,
    cell: ({ row }) => (
      <Link href={`/bookings/${row.original.id}`} className="row-link">
        View<span aria-hidden> →</span>
      </Link>
    ),
  }),
]);

export function BookingsTable({
  bookings,
  slots,
}: {
  bookings: Booking[];
  slots: Slot[] | undefined;
}) {
  const router = useRouter();

  const data = useMemo(() => {
    const slotById = new Map(slots?.map((s) => [s.id, s]));

    return bookings.map((b) => ({ ...b, slot: slotById.get(b.slot_id) }));
  }, [bookings, slots]);

  const table = useTable({ features, columns, data });

  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          {table.getHeaderGroups().map((group) => (
            <tr key={group.id}>
              {group.headers.map((header) => (
                <th key={header.id} scope="col">
                  {header.isPlaceholder ? null : (
                    <table.FlexRender header={header} />
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            // The whole row opens the booking; the View link keeps it
            // reachable by keyboard and screen reader.
            <tr
              key={row.id}
              className="clickable"
              onClick={() => router.push(`/bookings/${row.original.id}`)}
            >
              {row.getAllCells().map((cell) => (
                <td key={cell.id}>
                  <table.FlexRender cell={cell} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
