import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Layout } from "@/components/layout/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  IndianRupee,
  ClipboardList,
  CheckCircle2,
  Receipt,
  Wrench,
  ShieldCheck,
  Package,
  Users,
  TrendingUp,
  Building2,
  Calendar,
  ArrowRight,
} from "lucide-react";

const PREVIEW_ROWS = 5;

function formatCurrency(val: number) {
  if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
  if (val >= 100000) return `₹${(val / 100000).toFixed(2)} L`;
  if (val >= 1000) return `₹${(val / 1000).toFixed(1)}K`;
  return `₹${val.toLocaleString("en-IN")}`;
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub?: string;
  color: string;
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground font-medium">{label}</p>
            <p className="text-2xl font-bold mt-1" data-testid={`stat-${label}`}>{value}</p>
            {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
          </div>
          <div className={`p-2.5 rounded-lg ${color}`}>
            <Icon className="h-5 w-5 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SectionTable({
  title,
  icon: Icon,
  columns,
  rows,
  totalRows,
  section,
  emptyMsg,
}: {
  title: string;
  icon: React.ElementType;
  columns: { key: string; label: string; align?: "left" | "right" | "center" }[];
  rows: Record<string, any>[];
  totalRows: number;
  section: string;
  emptyMsg?: string;
}) {
  const [, setLocation] = useLocation();
  const hasMore = totalRows > PREVIEW_ROWS;

  return (
    <Card>
      <CardHeader className="pb-3 border-b border-border">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Icon className="h-4 w-4 text-primary" />
            {title}
            <Badge variant="secondary" className="text-xs font-normal">{totalRows}</Badge>
          </CardTitle>
          {hasMore && (
            <Button
              variant="ghost"
              size="sm"
              className="text-primary hover:text-primary gap-1 h-7 px-2"
              onClick={() => setLocation(`/analytics/${section}`)}
              data-testid={`btn-view-all-${section}`}
            >
              View All
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {rows.length === 0 ? (
          <p className="text-sm text-muted-foreground px-6 py-5">{emptyMsg || "No data available"}</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    {columns.map((col) => (
                      <th
                        key={col.key}
                        className={`px-4 py-2.5 font-medium text-muted-foreground text-${col.align || "left"} whitespace-nowrap`}
                      >
                        {col.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {rows.map((row, i) => (
                    <tr key={i} className="hover:bg-muted/30 transition-colors" data-testid={`table-row-${section}-${i}`}>
                      {columns.map((col) => (
                        <td key={col.key} className={`px-4 py-3 text-${col.align || "left"} align-middle`}>
                          {row[col.key]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {hasMore && (
              <div className="px-4 py-3 border-t border-border bg-muted/20">
                <button
                  className="text-xs text-primary font-medium flex items-center gap-1 hover:underline"
                  onClick={() => setLocation(`/analytics/${section}`)}
                  data-testid={`btn-view-all-bottom-${section}`}
                >
                  View all {totalRows} entries
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

function TableSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-3 border-b border-border">
        <Skeleton className="h-5 w-48" />
      </CardHeader>
      <CardContent className="p-4 space-y-2">
        {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-9 w-full" />)}
      </CardContent>
    </Card>
  );
}

export default function AnalyticsPage() {
  const { data, isLoading } = useQuery<any>({ queryKey: ["/api/analytics"] });

  const summary = data?.summary || {};
  const completionRate = summary.totalJobs
    ? Math.round((summary.completedJobs / summary.totalJobs) * 100) : 0;
  const paidRate = summary.totalInvoices
    ? Math.round((summary.paidInvoices / summary.totalInvoices) * 100) : 0;

  const totalCatRevenue = (data?.revenueByCategory || []).reduce((s: number, c: any) => s + c.value, 0);
  const totalBizRevenue = (data?.revenueByBusiness || []).reduce((s: number, b: any) => s + b.value, 0);
  const totalJobs = (data?.jobStatusDistribution || []).reduce((s: number, j: any) => s + j.value, 0);

  const statusColorMap: Record<string, string> = {
    Completed:    "bg-green-100 text-green-700",
    "In Progress":"bg-blue-100 text-blue-700",
    Pending:      "bg-yellow-100 text-yellow-700",
    Cancelled:    "bg-red-100 text-red-700",
  };

  // --- Row builders (preview only) ---
  const serviceRows = (data?.topServices || []).slice(0, PREVIEW_ROWS).map((s: any, i: number) => ({
    rank:    <span className="font-bold text-muted-foreground">#{i + 1}</span>,
    name:    <span className="font-medium">{s.name}</span>,
    count:   <Badge variant="secondary">{s.count} job{s.count !== 1 ? "s" : ""}</Badge>,
    revenue: <span className="font-semibold text-green-600">{formatCurrency(s.revenue)}</span>,
    avg:     <span className="text-muted-foreground">{formatCurrency(s.count > 0 ? s.revenue / s.count : 0)}</span>,
  }));

  const ppfRows = (data?.topPPFs || []).slice(0, PREVIEW_ROWS).map((p: any, i: number) => ({
    rank:    <span className="font-bold text-muted-foreground">#{i + 1}</span>,
    name:    <span className="font-medium">{p.name}</span>,
    count:   <Badge variant="secondary">{p.count} job{p.count !== 1 ? "s" : ""}</Badge>,
    revenue: <span className="font-semibold text-green-600">{formatCurrency(p.revenue)}</span>,
    avg:     <span className="text-muted-foreground">{formatCurrency(p.count > 0 ? p.revenue / p.count : 0)}</span>,
  }));

  const accessoryRows = (data?.topAccessories || []).slice(0, PREVIEW_ROWS).map((a: any, i: number) => ({
    rank:     <span className="font-bold text-muted-foreground">#{i + 1}</span>,
    name:     <span className="font-medium">{a.name}</span>,
    category: <span className="text-muted-foreground text-xs">{a.category || "—"}</span>,
    qty:      <Badge variant="secondary">{a.count} unit{a.count !== 1 ? "s" : ""}</Badge>,
    revenue:  <span className="font-semibold text-green-600">{formatCurrency(a.revenue)}</span>,
  }));

  const categoryRows = (data?.revenueByCategory || [])
    .filter((c: any) => c.value > 0)
    .sort((a: any, b: any) => b.value - a.value)
    .slice(0, PREVIEW_ROWS)
    .map((c: any) => ({
      category: <span className="font-medium">{c.name}</span>,
      revenue:  <span className="font-semibold text-green-600">{formatCurrency(c.value)}</span>,
      share: (
        <div className="flex items-center gap-2">
          <div className="w-24 bg-muted rounded-full h-1.5 overflow-hidden">
            <div className="h-full bg-primary rounded-full" style={{ width: `${totalCatRevenue > 0 ? (c.value / totalCatRevenue) * 100 : 0}%` }} />
          </div>
          <span className="text-xs text-muted-foreground">{totalCatRevenue > 0 ? ((c.value / totalCatRevenue) * 100).toFixed(1) : 0}%</span>
        </div>
      ),
    }));

  const businessRows = (data?.revenueByBusiness || [])
    .sort((a: any, b: any) => b.value - a.value)
    .slice(0, PREVIEW_ROWS)
    .map((b: any) => ({
      business: <span className="font-medium">{b.name}</span>,
      revenue:  <span className="font-semibold text-green-600">{formatCurrency(b.value)}</span>,
      share: (
        <div className="flex items-center gap-2">
          <div className="w-24 bg-muted rounded-full h-1.5 overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${totalBizRevenue > 0 ? (b.value / totalBizRevenue) * 100 : 0}%` }} />
          </div>
          <span className="text-xs text-muted-foreground">{totalBizRevenue > 0 ? ((b.value / totalBizRevenue) * 100).toFixed(1) : 0}%</span>
        </div>
      ),
    }));

  const jobStatusRows = (data?.jobStatusDistribution || [])
    .sort((a: any, b: any) => b.value - a.value)
    .slice(0, PREVIEW_ROWS)
    .map((j: any) => ({
      status: (
        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${statusColorMap[j.name] || "bg-muted text-muted-foreground"}`}>
          {j.name}
        </span>
      ),
      count: <span className="font-semibold">{j.value}</span>,
      share: (
        <div className="flex items-center gap-2">
          <div className="w-24 bg-muted rounded-full h-1.5 overflow-hidden">
            <div className="h-full bg-primary rounded-full" style={{ width: `${totalJobs > 0 ? (j.value / totalJobs) * 100 : 0}%` }} />
          </div>
          <span className="text-xs text-muted-foreground">{totalJobs > 0 ? ((j.value / totalJobs) * 100).toFixed(1) : 0}%</span>
        </div>
      ),
    }));

  const techRows = (data?.topTechnicians || []).slice(0, PREVIEW_ROWS).map((t: any, i: number) => ({
    rank:    <span className="font-bold text-muted-foreground">#{i + 1}</span>,
    name:    <span className="font-medium">{t.name}</span>,
    jobs:    <Badge variant="secondary">{t.jobCount} item{t.jobCount !== 1 ? "s" : ""}</Badge>,
    revenue: <span className="font-semibold text-green-600">{formatCurrency(t.revenue)}</span>,
    avg:     <span className="text-muted-foreground">{formatCurrency(t.jobCount > 0 ? t.revenue / t.jobCount : 0)}</span>,
  }));

  const monthlyRows = (data?.monthlyRevenue || []).slice(-PREVIEW_ROWS).reverse().map((m: any) => ({
    month:   <span className="font-medium">{m.name}</span>,
    revenue: <span className="font-semibold text-green-600">{formatCurrency(m.value)}</span>,
  }));

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Business insights — services, PPF, accessories &amp; revenue
          </p>
        </div>

        {/* Summary Cards */}
        {isLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <SummaryCard icon={IndianRupee}   label="Total Revenue"    value={formatCurrency(summary.totalRevenue || 0)} sub="from all invoices"                              color="bg-green-600" />
            <SummaryCard icon={ClipboardList} label="Total Job Cards"  value={String(summary.totalJobs || 0)}             sub={`${summary.completedJobs || 0} completed (${completionRate}%)`} color="bg-blue-600" />
            <SummaryCard icon={Receipt}       label="Total Invoices"   value={String(summary.totalInvoices || 0)}         sub={`${summary.paidInvoices || 0} paid (${paidRate}%)`}             color="bg-primary" />
            <SummaryCard icon={CheckCircle2}  label="Completion Rate"  value={`${completionRate}%`}                       sub={`${summary.completedJobs || 0} of ${summary.totalJobs || 0} jobs`} color="bg-purple-600" />
          </div>
        )}

        {/* Revenue + Business + Jobs — 3 columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {isLoading ? (
            <><TableSkeleton /><TableSkeleton /><TableSkeleton /></>
          ) : (
            <>
              <SectionTable
                title="Revenue by Category" icon={TrendingUp} section="revenue"
                columns={[
                  { key: "category", label: "Category" },
                  { key: "revenue",  label: "Revenue",      align: "right" },
                  { key: "share",    label: "Share",        align: "right" },
                ]}
                rows={categoryRows}
                totalRows={(data?.revenueByCategory || []).filter((c: any) => c.value > 0).length}
              />
              <SectionTable
                title="Revenue by Business" icon={Building2} section="business"
                columns={[
                  { key: "business", label: "Business" },
                  { key: "revenue",  label: "Revenue",      align: "right" },
                  { key: "share",    label: "Share",        align: "right" },
                ]}
                rows={businessRows}
                totalRows={(data?.revenueByBusiness || []).length}
              />
              <SectionTable
                title="Job Status Breakdown" icon={ClipboardList} section="jobs"
                columns={[
                  { key: "status", label: "Status" },
                  { key: "count",  label: "Count",          align: "right" },
                  { key: "share",  label: "Share",          align: "right" },
                ]}
                rows={jobStatusRows}
                totalRows={(data?.jobStatusDistribution || []).length}
              />
            </>
          )}
        </div>

        {/* Services + PPF — 2 columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {isLoading ? (
            <><TableSkeleton /><TableSkeleton /></>
          ) : (
            <>
              <SectionTable
                title="Most Sold Services" icon={Wrench} section="services"
                columns={[
                  { key: "rank",    label: "#",             align: "center" },
                  { key: "name",    label: "Service Name" },
                  { key: "count",   label: "Jobs",          align: "center" },
                  { key: "revenue", label: "Revenue",       align: "right" },
                  { key: "avg",     label: "Avg / Job",     align: "right" },
                ]}
                rows={serviceRows}
                totalRows={(data?.topServices || []).length}
                emptyMsg="No services recorded yet"
              />
              <SectionTable
                title="Most Sold PPF" icon={ShieldCheck} section="ppf"
                columns={[
                  { key: "rank",    label: "#",             align: "center" },
                  { key: "name",    label: "PPF Name" },
                  { key: "count",   label: "Jobs",          align: "center" },
                  { key: "revenue", label: "Revenue",       align: "right" },
                  { key: "avg",     label: "Avg / Job",     align: "right" },
                ]}
                rows={ppfRows}
                totalRows={(data?.topPPFs || []).length}
                emptyMsg="No PPF recorded yet"
              />
            </>
          )}
        </div>

        {/* Accessories */}
        {isLoading ? <TableSkeleton /> : (
          <SectionTable
            title="Most Sold Accessories" icon={Package} section="accessories"
            columns={[
              { key: "rank",     label: "#",             align: "center" },
              { key: "name",     label: "Accessory Name" },
              { key: "category", label: "Category" },
              { key: "qty",      label: "Qty Sold",      align: "center" },
              { key: "revenue",  label: "Revenue",       align: "right" },
            ]}
            rows={accessoryRows}
            totalRows={(data?.topAccessories || []).length}
            emptyMsg="No accessories recorded yet"
          />
        )}

        {/* Technicians + Monthly — 2 columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {isLoading ? (
            <><TableSkeleton /><TableSkeleton /></>
          ) : (
            <>
              <SectionTable
                title="Top Technicians" icon={Users} section="technicians"
                columns={[
                  { key: "rank",    label: "#",             align: "center" },
                  { key: "name",    label: "Technician" },
                  { key: "jobs",    label: "Items",         align: "center" },
                  { key: "revenue", label: "Revenue",       align: "right" },
                  { key: "avg",     label: "Avg / Item",    align: "right" },
                ]}
                rows={techRows}
                totalRows={(data?.topTechnicians || []).length}
                emptyMsg="No technician data available"
              />
              <SectionTable
                title="Monthly Revenue" icon={Calendar} section="monthly"
                columns={[
                  { key: "month",   label: "Month" },
                  { key: "revenue", label: "Revenue", align: "right" },
                ]}
                rows={monthlyRows}
                totalRows={(data?.monthlyRevenue || []).length}
                emptyMsg="No monthly revenue data yet"
              />
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
