import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiSearch,
  FiRefreshCw,
  FiDownload,
  FiUploadCloud,
  FiChevronLeft,
  FiChevronRight,
  FiChevronUp,
  FiChevronDown,
} from "react-icons/fi";
import toast from "react-hot-toast";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import StatusBadge from "../../components/StatusBadge";
import { SkeletonTable } from "../../components/Skeleton";
import EmptyState from "../../components/EmptyState";
import { fetchRegistrations, downloadExport } from "../../services/registrationApi";
import { syncRegistrationForm } from "../../services/syncApi";
import { DEPARTMENTS, YEARS, GENDERS, STATUSES } from "../../constants/registration";
import { formatDateTime } from "../../utils/formatters";

const PAGE_SIZE = 10;

export default function RegistrationListPage() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ department: "", year: "", gender: "", status: "" });
  const [sort, setSort] = useState({ sortBy: "timestamp", sortDir: "desc" });
  const [page, setPage] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const handle = setTimeout(() => setPage(1), 0);
    return () => clearTimeout(handle);
  }, [search, filters]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    const params = {
      search: search || undefined,
      ...filters,
      ...sort,
      page,
      pageSize: PAGE_SIZE,
    };
    Object.keys(params).forEach((k) => params[k] === "" && delete params[k]);

    fetchRegistrations(params)
      .then((res) => {
        if (!active) return;
        setRows(res.data);
        setTotal(res.total);
      })
      .catch(() => toast.error("Failed to load registrations"))
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
    };
  }, [search, filters, sort, page, refreshKey]);

  const columns = useMemo(
    () => [
      { accessorKey: "teamId", header: "Team ID" },
      { accessorKey: "teamName", header: "Team Name" },
      { accessorKey: "leader", header: "Leader" },
      { accessorKey: "department", header: "Department" },
      { accessorKey: "year", header: "Year" },
      {
        accessorKey: "registrationTime",
        header: "Registration Time",
        cell: (info) => formatDateTime(info.getValue()),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: (info) => <StatusBadge status={info.getValue()} />,
      },
    ],
    []
  );

  const table = useReactTable({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const toggleSort = (key) => {
    setSort((prev) =>
      prev.sortBy === key
        ? { sortBy: key, sortDir: prev.sortDir === "asc" ? "desc" : "asc" }
        : { sortBy: key, sortDir: "asc" }
    );
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const result = await syncRegistrationForm();
      if (result.imported > 0) {
        toast.success(`Imported ${result.imported} new registration(s)`);
        setRefreshKey((k) => k + 1);
      } else {
        toast.success("No new form responses to import");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Sync failed");
    } finally {
      setSyncing(false);
    }
  };

  const handleExport = async (format) => {
    setExporting(true);
    try {
      await downloadExport(format, {
        search: search || undefined,
        ...filters,
      });
    } catch {
      toast.error("Export failed");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-heading text-xl font-semibold text-ink">Registration Management</h1>
          <p className="text-sm text-slate-500">{total} teams registered</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button className="btn-secondary" onClick={() => setRefreshKey((k) => k + 1)} disabled={loading}>
            <FiRefreshCw className={loading ? "animate-spin" : ""} size={15} />
            Refresh
          </button>
          <button className="btn-secondary" onClick={handleSync} disabled={syncing}>
            <FiUploadCloud className={syncing ? "animate-pulse" : ""} size={15} />
            {syncing ? "Syncing…" : "Sync from Form"}
          </button>
          <button className="btn-secondary" onClick={() => handleExport("csv")} disabled={exporting}>
            <FiDownload size={15} /> CSV
          </button>
          <button className="btn-secondary" onClick={() => handleExport("xlsx")} disabled={exporting}>
            <FiDownload size={15} /> Excel
          </button>
        </div>
      </div>

      <div className="card p-4 flex flex-col lg:flex-row gap-3 lg:items-center">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            className="input pl-9"
            placeholder="Search by team, leader, roll number, email, phone…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="input lg:w-40"
          value={filters.department}
          onChange={(e) => setFilters((f) => ({ ...f, department: e.target.value }))}
        >
          <option value="">All Departments</option>
          {DEPARTMENTS.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
        <select
          className="input lg:w-36"
          value={filters.year}
          onChange={(e) => setFilters((f) => ({ ...f, year: e.target.value }))}
        >
          <option value="">All Years</option>
          {YEARS.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
        <select
          className="input lg:w-32"
          value={filters.gender}
          onChange={(e) => setFilters((f) => ({ ...f, gender: e.target.value }))}
        >
          <option value="">All Genders</option>
          {GENDERS.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
        <select
          className="input lg:w-32"
          value={filters.status}
          onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
        >
          <option value="">All Status</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <SkeletonTable rows={PAGE_SIZE} cols={7} />
      ) : rows.length === 0 ? (
        <EmptyState title="No teams found" message="Try adjusting your search or filters." />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id} className="border-b border-slate-100 dark:border-slate-800">
                  {hg.headers.map((header) => (
                    <th
                      key={header.id}
                      className="text-left px-4 py-3 font-medium text-slate-500 select-none cursor-pointer whitespace-nowrap"
                      onClick={() => toggleSort(header.column.columnDef.accessorKey)}
                    >
                      <span className="flex items-center gap-1">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {sort.sortBy === header.column.columnDef.accessorKey &&
                          (sort.sortDir === "asc" ? <FiChevronUp size={13} /> : <FiChevronDown size={13} />)}
                      </span>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-slate-50 dark:border-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer"
                  onClick={() => navigate(`/registrations/${row.original.id}`)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3 whitespace-nowrap">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 dark:border-slate-800">
            <p className="text-xs text-slate-500">
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                className="btn-secondary px-2 py-1"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <FiChevronLeft size={15} />
              </button>
              <button
                className="btn-secondary px-2 py-1"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                <FiChevronRight size={15} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
