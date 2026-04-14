import { useDashboard } from "@/hooks/use-dashboard";
import { Layout } from "@/components/layout/layout";
import { StatCard } from "@/components/ui/stat-card";
import {
  IndianRupee,
  MessageCircle,
  Activity,
  History,
  Calendar,
  Search,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Phone,
  FileText,
  Building2,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Invoice } from "@shared/schema";
import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";

const COLORS = ['#3B82F6', '#F59E0B', '#10B981', '#EF4444'];

type BalanceInvoice = Invoice & { paidAmount: number; balanceAmount: number };

function formatINR(n: number) {
  return `₹${n.toLocaleString("en-IN")}`;
}

function safeFmt(dateStr?: string) {
  if (!dateStr) return "—";
  try { return format(new Date(dateStr), "dd MMM yyyy"); } catch { return dateStr; }
}

// ─── Per-customer collapsible row ────────────────────────────────────────────
function CustomerBalanceRow({ name, phone, invoices }: { name: string; phone: string; invoices: BalanceInvoice[] }) {
  const [open, setOpen] = useState(false);
  const totalBalance = invoices.reduce((s, i) => s + i.balanceAmount, 0);
  const [, navigate] = useLocation();

  return (
    <div className="border border-border/60 rounded-lg overflow-hidden">
      {/* Customer header row */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-4 px-4 py-3 bg-background hover:bg-muted/40 transition-colors text-left"
      >
        <div className="h-9 w-9 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
          <span className="text-sm font-bold text-red-600">
            {name.charAt(0).toUpperCase()}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-foreground truncate">{name}</p>
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
            <Phone className="h-3 w-3" />
            <span>{phone || "—"}</span>
          </div>
        </div>
        <div className="text-right mr-3">
          <p className="text-xs text-muted-foreground mb-0.5">
            {invoices.length} invoice{invoices.length !== 1 ? "s" : ""}
          </p>
          <p className="text-base font-bold text-red-600">{formatINR(totalBalance)}</p>
        </div>
        {open
          ? <ChevronUp className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          : <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        }
      </button>

      {/* Invoices detail panel */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="invoices"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="border-t border-border/60 bg-muted/20">
              {/* Desktop table */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/40 bg-muted/40">
                      <th className="px-4 py-2 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Invoice #</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Business</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Date</th>
                      <th className="px-4 py-2 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide">Total</th>
                      <th className="px-4 py-2 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide">Paid</th>
                      <th className="px-4 py-2 text-right text-xs font-semibold text-red-500 uppercase tracking-wide">Balance</th>
                      <th className="px-4 py-2 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wide">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {invoices.map(inv => (
                      <tr key={inv.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 font-mono text-xs font-medium text-foreground">{inv.invoiceNo}</td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className="text-xs font-medium">
                            {inv.business}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">{safeFmt(inv.date)}</td>
                        <td className="px-4 py-3 text-right text-xs font-medium">{formatINR(inv.totalAmount)}</td>
                        <td className="px-4 py-3 text-right text-xs text-emerald-600 font-medium">{formatINR(inv.paidAmount)}</td>
                        <td className="px-4 py-3 text-right text-sm font-bold text-red-600">{formatINR(inv.balanceAmount)}</td>
                        <td className="px-4 py-3 text-center">
                          <button
                            type="button"
                            onClick={e => { e.stopPropagation(); navigate(`/invoice/${inv.id}`); }}
                            className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary/80 font-medium transition-colors"
                            data-testid={`link-invoice-${inv.id}`}
                          >
                            <ExternalLink className="h-3 w-3" />
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="sm:hidden divide-y divide-border/40">
                {invoices.map(inv => (
                  <div key={inv.id} className="px-4 py-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-semibold text-foreground">{inv.invoiceNo}</span>
                      <Badge variant="outline" className="text-xs">{inv.business}</Badge>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{safeFmt(inv.date)}</span>
                      <span>Total: {formatINR(inv.totalAmount)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-3 text-xs">
                        <span className="text-emerald-600">Paid: {formatINR(inv.paidAmount)}</span>
                        <span className="text-red-600 font-bold">Due: {formatINR(inv.balanceAmount)}</span>
                      </div>
                      <button
                        type="button"
                        onClick={e => { e.stopPropagation(); navigate(`/invoice/${inv.id}`); }}
                        className="inline-flex items-center gap-1 text-xs text-primary font-medium"
                      >
                        <ExternalLink className="h-3 w-3" />
                        View
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Balance Accounts Panel ───────────────────────────────────────────────────
function BalanceAccountsPanel() {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"balance" | "name">("balance");

  const { data: balanceInvoices = [], isLoading } = useQuery<BalanceInvoice[]>({
    queryKey: ["/api/dashboard/balance-invoices"],
    refetchInterval: 30000,
  });

  // Group invoices by customer name + phone
  const grouped = useMemo(() => {
    const map = new Map<string, { name: string; phone: string; invoices: BalanceInvoice[] }>();
    for (const inv of balanceInvoices) {
      const key = `${inv.customerName}||${inv.phoneNumber}`;
      if (!map.has(key)) map.set(key, { name: inv.customerName, phone: inv.phoneNumber, invoices: [] });
      map.get(key)!.invoices.push(inv);
    }
    return Array.from(map.values());
  }, [balanceInvoices]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let result = q
      ? grouped.filter(g =>
          g.name.toLowerCase().includes(q) ||
          g.phone.includes(q) ||
          g.invoices.some(i => i.invoiceNo.toLowerCase().includes(q))
        )
      : grouped;
    if (sortBy === "balance") {
      result = [...result].sort((a, b) =>
        b.invoices.reduce((s, i) => s + i.balanceAmount, 0) -
        a.invoices.reduce((s, i) => s + i.balanceAmount, 0)
      );
    } else {
      result = [...result].sort((a, b) => a.name.localeCompare(b.name));
    }
    return result;
  }, [grouped, search, sortBy]);

  const grandTotal = useMemo(() =>
    balanceInvoices.reduce((s, i) => s + i.balanceAmount, 0),
    [balanceInvoices]
  );

  if (isLoading) {
    return (
      <div className="space-y-2 p-4">
        {[1, 2, 3].map(i => <Skeleton key={i} className="h-14 w-full rounded-lg" />)}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Summary bar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-1">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              data-testid="input-balance-search"
              placeholder="Search customer, phone, invoice…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="h-8 pl-8 text-xs"
            />
          </div>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as "balance" | "name")}
            className="h-8 text-xs border border-input rounded-md bg-background px-2 focus:outline-none focus:ring-1 focus:ring-ring"
            data-testid="select-balance-sort"
          >
            <option value="balance">Sort: Highest balance</option>
            <option value="name">Sort: Customer name</option>
          </select>
        </div>
        <div className="flex items-center gap-2 text-sm shrink-0">
          <span className="text-muted-foreground">{filtered.length} customer{filtered.length !== 1 ? "s" : ""}</span>
          <span className="text-muted-foreground">•</span>
          <span className="font-bold text-red-600">{formatINR(grandTotal)} total due</span>
        </div>
      </div>

      {/* Customer list */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-14 text-center text-muted-foreground">
          <AlertCircle className="h-10 w-10 mb-3 opacity-25" />
          <p className="font-medium text-sm">
            {search ? "No results match your search" : "All clear — no outstanding balances"}
          </p>
          {!search && (
            <p className="text-xs mt-1 opacity-70">Every invoice is fully paid.</p>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(g => (
            <CustomerBalanceRow
              key={`${g.name}||${g.phone}`}
              name={g.name}
              phone={g.phone}
              invoices={g.invoices}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { data, isLoading } = useDashboard();

  if (isLoading) return <DashboardSkeleton />;

  const getIcon = (key: string) => {
    switch (key) {
      case "Balance Amount": return <IndianRupee className="h-6 w-6" />;
      case "Inquiries Today": return <MessageCircle className="h-6 w-6" />;
      default: return <Activity className="h-6 w-6" />;
    }
  };

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold text-gray-900">Dashboard Overview</h1>
            <p className="text-muted-foreground mt-1">Welcome back, here's what's happening at Auto Gamma today.</p>
          </div>
          <div className="hidden sm:block text-sm text-muted-foreground font-medium bg-white px-4 py-2 rounded-lg border border-border">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {data?.stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <StatCard
                label={stat.label}
                value={stat.label.includes("Amount") ? `₹${stat.value}` : stat.value}
                subtext={stat.subtext}
                icon={getIcon(stat.label)}
              />
            </motion.div>
          ))}
        </div>

        {/* Balance Accounts — full-width detailed section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="border-none shadow-sm overflow-hidden">
            <CardHeader className="bg-red-50/60 border-b py-3 px-6 flex flex-row items-center gap-2">
              <IndianRupee className="h-4 w-4 text-red-600" />
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-500 flex-1">
                Balance Accounts
              </CardTitle>
              <Link href="/invoice">
                <button
                  type="button"
                  className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 font-medium transition-colors"
                  data-testid="link-all-invoices"
                >
                  <FileText className="h-3.5 w-3.5" />
                  All Invoices
                </button>
              </Link>
            </CardHeader>
            <CardContent className="p-4">
              <BalanceAccountsPanel />
            </CardContent>
          </Card>
        </motion.div>

        {/* Tickets + Appointments */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-none shadow-sm overflow-hidden">
            <Link href="/tickets">
              <CardHeader className="bg-slate-50/50 border-b py-3 px-6 flex flex-row items-center gap-2 cursor-pointer hover:bg-slate-100 transition-colors">
                <History className="h-4 w-4 text-red-600" />
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-500">Tickets</CardTitle>
              </CardHeader>
            </Link>
            <CardContent className="p-0">
              <div className="divide-y">
                {data?.activeJobs && data.activeJobs.length > 0 ? (
                  data.activeJobs.map((job) => (
                    <Link key={job.id} href={`/tickets?id=${job.id}`}>
                      <div className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between cursor-pointer">
                        <div>
                          <p className="font-bold text-slate-900">{job.customerName}</p>
                          <p className="text-sm text-slate-500">{job.vehicleInfo}</p>
                        </div>
                        <Badge variant="outline" className="bg-red-50 text-red-600 border-red-100 font-bold">
                          {job.status}
                        </Badge>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="p-8 text-center text-muted-foreground">
                    No tickets currently.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm overflow-hidden">
            <Link href="/appointments">
              <CardHeader className="bg-slate-50/50 border-b py-3 px-6 flex flex-row items-center gap-2 cursor-pointer hover:bg-slate-100 transition-colors">
                <Calendar className="h-4 w-4 text-blue-600" />
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-500">Upcoming Appointments</CardTitle>
              </CardHeader>
            </Link>
            <CardContent className="p-0">
              <div className="divide-y">
                {data?.upcomingAppointments && data.upcomingAppointments.length > 0 ? (
                  data.upcomingAppointments.map((appt) => (
                    <Link key={appt.id} href="/appointments">
                      <div className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between cursor-pointer">
                        <div>
                          <p className="font-bold text-slate-900">{appt.customerName}</p>
                          <p className="text-sm text-slate-500">{appt.vehicleInfo} • {appt.serviceType}</p>
                          <p className="text-xs text-slate-400 font-medium mt-0.5">{appt.date} at {appt.time}</p>
                        </div>
                        <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-100 font-bold">
                          Scheduled
                        </Badge>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="p-8 text-center text-muted-foreground">
                    No upcoming appointments.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}

function DashboardSkeleton() {
  return (
    <Layout>
      <div className="p-6 space-y-8">
        <div className="flex justify-between mb-8">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-48" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {[1, 2].map(i => <Skeleton key={i} className="h-32 rounded-xl" />)}
        </div>
        <Skeleton className="h-64 rounded-xl" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    </Layout>
  );
}
