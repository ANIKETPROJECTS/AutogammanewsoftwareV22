import { useQuery } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { Layout } from "@/components/layout/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Wrench,
  ShieldCheck,
  Package,
  Users,
  TrendingUp,
  Building2,
  Calendar,
  ClipboardList,
} from "lucide-react";

function formatCurrency(val: number) {
  if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
  if (val >= 100000) return `₹${(val / 100000).toFixed(2)} L`;
  if (val >= 1000) return `₹${(val / 1000).toFixed(1)}K`;
  return `₹${val.toLocaleString("en-IN")}`;
}

const sectionMeta: Record<string, { title: string; description: string; icon: React.ElementType }> = {
  services:    { title: "Services — Full Report",       description: "All services ranked by job count and revenue", icon: Wrench },
  ppf:         { title: "PPF — Full Report",            description: "All PPF products ranked by job count and revenue", icon: ShieldCheck },
  accessories: { title: "Accessories — Full Report",    description: "All accessories ranked by quantity sold and revenue", icon: Package },
  technicians: { title: "Technicians — Full Report",    description: "All technicians ranked by revenue generated", icon: Users },
  revenue:     { title: "Revenue Breakdown",            description: "Detailed revenue split by category and business", icon: TrendingUp },
  business:    { title: "Revenue by Business",          description: "Full breakdown of revenue per business entity", icon: Building2 },
  monthly:     { title: "Monthly Revenue — All Time",   description: "Complete month-by-month revenue history", icon: Calendar },
  jobs:        { title: "Job Status — Full Report",     description: "Distribution of all job cards by status", icon: ClipboardList },
};

function DataTable({
  columns,
  rows,
  emptyMsg,
}: {
  columns: { key: string; label: string; align?: "left" | "right" | "center" }[];
  rows: Record<string, any>[];
  emptyMsg?: string;
}) {
  if (rows.length === 0) {
    return <p className="text-sm text-muted-foreground px-2 py-8 text-center">{emptyMsg || "No data available"}</p>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/30">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`px-4 py-3 font-semibold text-muted-foreground text-${col.align || "left"} whitespace-nowrap`}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((row, i) => (
            <tr key={i} className="hover:bg-muted/30 transition-colors" data-testid={`detail-row-${i}`}>
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
  );
}

export default function AnalyticsDetailPage() {
  const { section } = useParams<{ section: string }>();
  const [, setLocation] = useLocation();

  const { data, isLoading } = useQuery<any>({ queryKey: ["/api/analytics"] });

  const meta = sectionMeta[section || ""] || { title: "Analytics Detail", description: "", icon: TrendingUp };
  const Icon = meta.icon;

  const totalCatRevenue = (data?.revenueByCategory || []).reduce((s: number, c: any) => s + c.value, 0);
  const totalBizRevenue = (data?.revenueByBusiness || []).reduce((s: number, b: any) => s + b.value, 0);
  const totalJobs = (data?.jobStatusDistribution || []).reduce((s: number, j: any) => s + j.value, 0);

  const statusColorMap: Record<string, string> = {
    Completed:    "bg-green-100 text-green-700",
    "In Progress":"bg-blue-100 text-blue-700",
    Pending:      "bg-yellow-100 text-yellow-700",
    Cancelled:    "bg-red-100 text-red-700",
  };

  function renderSection() {
    if (isLoading) {
      return (
        <div className="space-y-2 p-4">
          {[...Array(10)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
        </div>
      );
    }

    switch (section) {
      case "services": {
        const rows = (data?.topServices || []).map((s: any, i: number) => ({
          rank:    <span className="font-bold text-muted-foreground">#{i + 1}</span>,
          name:    <span className="font-medium">{s.name}</span>,
          count:   <Badge variant="secondary">{s.count} job{s.count !== 1 ? "s" : ""}</Badge>,
          revenue: <span className="font-semibold text-green-600">{formatCurrency(s.revenue)}</span>,
          avg:     <span className="text-muted-foreground">{formatCurrency(s.count > 0 ? s.revenue / s.count : 0)}</span>,
        }));
        return (
          <DataTable
            columns={[
              { key: "rank",    label: "#",             align: "center" },
              { key: "name",    label: "Service Name" },
              { key: "count",   label: "Jobs Done",     align: "center" },
              { key: "revenue", label: "Total Revenue", align: "right" },
              { key: "avg",     label: "Avg / Job",     align: "right" },
            ]}
            rows={rows}
            emptyMsg="No services recorded yet"
          />
        );
      }

      case "ppf": {
        const rows = (data?.topPPFs || []).map((p: any, i: number) => ({
          rank:    <span className="font-bold text-muted-foreground">#{i + 1}</span>,
          name:    <span className="font-medium">{p.name}</span>,
          count:   <Badge variant="secondary">{p.count} job{p.count !== 1 ? "s" : ""}</Badge>,
          revenue: <span className="font-semibold text-green-600">{formatCurrency(p.revenue)}</span>,
          avg:     <span className="text-muted-foreground">{formatCurrency(p.count > 0 ? p.revenue / p.count : 0)}</span>,
        }));
        return (
          <DataTable
            columns={[
              { key: "rank",    label: "#",             align: "center" },
              { key: "name",    label: "PPF Name" },
              { key: "count",   label: "Jobs Done",     align: "center" },
              { key: "revenue", label: "Total Revenue", align: "right" },
              { key: "avg",     label: "Avg / Job",     align: "right" },
            ]}
            rows={rows}
            emptyMsg="No PPF recorded yet"
          />
        );
      }

      case "accessories": {
        const rows = (data?.topAccessories || []).map((a: any, i: number) => ({
          rank:     <span className="font-bold text-muted-foreground">#{i + 1}</span>,
          name:     <span className="font-medium">{a.name}</span>,
          category: <span className="text-muted-foreground text-xs">{a.category || "—"}</span>,
          qty:      <Badge variant="secondary">{a.count} unit{a.count !== 1 ? "s" : ""}</Badge>,
          revenue:  <span className="font-semibold text-green-600">{formatCurrency(a.revenue)}</span>,
          avg:      <span className="text-muted-foreground">{formatCurrency(a.count > 0 ? a.revenue / a.count : 0)}</span>,
        }));
        return (
          <DataTable
            columns={[
              { key: "rank",     label: "#",             align: "center" },
              { key: "name",     label: "Accessory Name" },
              { key: "category", label: "Category" },
              { key: "qty",      label: "Qty Sold",      align: "center" },
              { key: "revenue",  label: "Total Revenue", align: "right" },
              { key: "avg",      label: "Avg / Unit",    align: "right" },
            ]}
            rows={rows}
            emptyMsg="No accessories recorded yet"
          />
        );
      }

      case "technicians": {
        const rows = (data?.topTechnicians || []).map((t: any, i: number) => ({
          rank:    <span className="font-bold text-muted-foreground">#{i + 1}</span>,
          name:    <span className="font-medium">{t.name}</span>,
          jobs:    <Badge variant="secondary">{t.jobCount} item{t.jobCount !== 1 ? "s" : ""}</Badge>,
          revenue: <span className="font-semibold text-green-600">{formatCurrency(t.revenue)}</span>,
          avg:     <span className="text-muted-foreground">{formatCurrency(t.jobCount > 0 ? t.revenue / t.jobCount : 0)}</span>,
        }));
        return (
          <DataTable
            columns={[
              { key: "rank",    label: "#",             align: "center" },
              { key: "name",    label: "Technician" },
              { key: "jobs",    label: "Items Done",    align: "center" },
              { key: "revenue", label: "Total Revenue", align: "right" },
              { key: "avg",     label: "Avg / Item",    align: "right" },
            ]}
            rows={rows}
            emptyMsg="No technician data available"
          />
        );
      }

      case "revenue": {
        const rows = (data?.revenueByCategory || [])
          .filter((c: any) => c.value > 0)
          .sort((a: any, b: any) => b.value - a.value)
          .map((c: any) => ({
            category: <span className="font-medium">{c.name}</span>,
            revenue:  <span className="font-semibold text-green-600">{formatCurrency(c.value)}</span>,
            share: (
              <div className="flex items-center gap-3">
                <div className="w-32 bg-muted rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full"
                    style={{ width: `${totalCatRevenue > 0 ? (c.value / totalCatRevenue) * 100 : 0}%` }}
                  />
                </div>
                <span className="text-sm text-muted-foreground font-medium">
                  {totalCatRevenue > 0 ? ((c.value / totalCatRevenue) * 100).toFixed(1) : 0}%
                </span>
              </div>
            ),
          }));
        return (
          <DataTable
            columns={[
              { key: "category", label: "Category" },
              { key: "revenue",  label: "Revenue", align: "right" },
              { key: "share",    label: "Share of Total" },
            ]}
            rows={rows}
          />
        );
      }

      case "business": {
        const rows = (data?.revenueByBusiness || [])
          .sort((a: any, b: any) => b.value - a.value)
          .map((b: any) => ({
            business: <span className="font-medium">{b.name}</span>,
            revenue:  <span className="font-semibold text-green-600">{formatCurrency(b.value)}</span>,
            share: (
              <div className="flex items-center gap-3">
                <div className="w-32 bg-muted rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${totalBizRevenue > 0 ? (b.value / totalBizRevenue) * 100 : 0}%` }}
                  />
                </div>
                <span className="text-sm text-muted-foreground font-medium">
                  {totalBizRevenue > 0 ? ((b.value / totalBizRevenue) * 100).toFixed(1) : 0}%
                </span>
              </div>
            ),
          }));
        return (
          <DataTable
            columns={[
              { key: "business", label: "Business" },
              { key: "revenue",  label: "Revenue", align: "right" },
              { key: "share",    label: "Share of Total" },
            ]}
            rows={rows}
          />
        );
      }

      case "monthly": {
        const allMonths = (data?.monthlyRevenue || []);
        const rows = [...allMonths].reverse().map((m: any, i: number) => ({
          rank:    <span className="text-muted-foreground text-xs">#{i + 1}</span>,
          month:   <span className="font-medium">{m.name}</span>,
          revenue: <span className="font-semibold text-green-600">{formatCurrency(m.value)}</span>,
        }));
        return (
          <DataTable
            columns={[
              { key: "rank",    label: "#",       align: "center" },
              { key: "month",   label: "Month" },
              { key: "revenue", label: "Revenue", align: "right" },
            ]}
            rows={rows}
            emptyMsg="No monthly revenue data yet"
          />
        );
      }

      case "jobs": {
        const rows = (data?.jobStatusDistribution || [])
          .sort((a: any, b: any) => b.value - a.value)
          .map((j: any) => ({
            status: (
              <span className={`px-2 py-0.5 rounded text-xs font-semibold ${statusColorMap[j.name] || "bg-muted text-muted-foreground"}`}>
                {j.name}
              </span>
            ),
            count: <span className="font-semibold">{j.value}</span>,
            share: (
              <div className="flex items-center gap-3">
                <div className="w-32 bg-muted rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full"
                    style={{ width: `${totalJobs > 0 ? (j.value / totalJobs) * 100 : 0}%` }}
                  />
                </div>
                <span className="text-sm text-muted-foreground font-medium">
                  {totalJobs > 0 ? ((j.value / totalJobs) * 100).toFixed(1) : 0}%
                </span>
              </div>
            ),
          }));
        return (
          <DataTable
            columns={[
              { key: "status", label: "Status" },
              { key: "count",  label: "Count",        align: "right" },
              { key: "share",  label: "Share of Total" },
            ]}
            rows={rows}
          />
        );
      }

      default:
        return <p className="text-sm text-muted-foreground p-6">Unknown section.</p>;
    }
  }

  const rowCount = (() => {
    if (!data) return null;
    switch (section) {
      case "services":     return data.topServices?.length;
      case "ppf":          return data.topPPFs?.length;
      case "accessories":  return data.topAccessories?.length;
      case "technicians":  return data.topTechnicians?.length;
      case "revenue":      return data.revenueByCategory?.filter((c: any) => c.value > 0).length;
      case "business":     return data.revenueByBusiness?.length;
      case "monthly":      return data.monthlyRevenue?.length;
      case "jobs":         return data.jobStatusDistribution?.length;
      default:             return null;
    }
  })();

  return (
    <Layout>
      <div className="p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setLocation("/analytics")}
            data-testid="btn-back-analytics"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <Icon className="h-5 w-5 text-primary" />
              <h1 className="text-xl font-bold text-foreground">{meta.title}</h1>
              {rowCount != null && (
                <Badge variant="secondary" className="text-xs">{rowCount} entries</Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">{meta.description}</p>
          </div>
        </div>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            {renderSection()}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
