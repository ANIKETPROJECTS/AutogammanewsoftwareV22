import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/layout/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";
import {
  TrendingUp,
  Wrench,
  ShieldCheck,
  Package,
  IndianRupee,
  ClipboardList,
  CheckCircle2,
  Receipt,
  Users,
} from "lucide-react";

const COLORS = ["#e53e3e", "#3182ce", "#38a169", "#d69e2e", "#805ad5", "#dd6b20", "#319795", "#e53e3e"];

function formatCurrency(val: number) {
  if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
  if (val >= 1000) return `₹${(val / 1000).toFixed(1)}K`;
  return `₹${val.toFixed(0)}`;
}

function StatCard({
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
            <p className="text-2xl font-bold mt-1" data-testid={`stat-value-${label}`}>{value}</p>
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

function TopItemsTable({
  title,
  items,
  icon: Icon,
}: {
  title: string;
  items: { name: string; count: number; revenue: number; category?: string }[];
  icon: React.ElementType;
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Icon className="h-4 w-4 text-primary" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground px-6 pb-4">No data available</p>
        ) : (
          <div className="divide-y divide-border">
            {items.map((item, i) => (
              <div
                key={item.name}
                className="flex items-center justify-between px-6 py-3 hover:bg-muted/40 transition-colors"
                data-testid={`top-item-row-${i}`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-xs font-bold text-muted-foreground w-5 shrink-0">
                    #{i + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{item.name}</p>
                    {item.category && (
                      <p className="text-xs text-muted-foreground">{item.category}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4 shrink-0 ml-4">
                  <Badge variant="secondary" className="text-xs">
                    {item.count} sold
                  </Badge>
                  <span className="text-sm font-semibold text-green-600 w-20 text-right">
                    {formatCurrency(item.revenue)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-border rounded-lg shadow-md px-3 py-2 text-sm">
        <p className="font-medium mb-1">{label}</p>
        {payload.map((p: any) => (
          <p key={p.name} style={{ color: p.color }}>
            {p.name === "revenue" ? formatCurrency(p.value) : p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function AnalyticsPage() {
  const { data, isLoading } = useQuery<any>({
    queryKey: ["/api/analytics"],
  });

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Business insights — services, PPF, accessories & revenue
          </p>
        </div>

        {/* Summary Stats */}
        {isLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={IndianRupee}
              label="Total Revenue"
              value={formatCurrency(data?.summary?.totalRevenue || 0)}
              sub="from all invoices"
              color="bg-green-600"
            />
            <StatCard
              icon={ClipboardList}
              label="Total Job Cards"
              value={String(data?.summary?.totalJobs || 0)}
              sub={`${data?.summary?.completedJobs || 0} completed`}
              color="bg-blue-600"
            />
            <StatCard
              icon={Receipt}
              label="Total Invoices"
              value={String(data?.summary?.totalInvoices || 0)}
              sub={`${data?.summary?.paidInvoices || 0} paid`}
              color="bg-primary"
            />
            <StatCard
              icon={CheckCircle2}
              label="Completion Rate"
              value={
                data?.summary?.totalJobs
                  ? `${Math.round((data.summary.completedJobs / data.summary.totalJobs) * 100)}%`
                  : "0%"
              }
              sub="jobs completed"
              color="bg-purple-600"
            />
          </div>
        )}

        {/* Monthly Revenue Trend */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4 text-primary" />
              Monthly Revenue Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-52 w-full" />
            ) : data?.monthlyRevenue?.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={data.monthlyRevenue} margin={{ top: 5, right: 10, bottom: 5, left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tickFormatter={formatCurrency} tick={{ fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="value"
                    name="revenue"
                    stroke="#e53e3e"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: "#e53e3e" }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground py-8 text-center">No revenue data yet</p>
            )}
          </CardContent>
        </Card>

        {/* Revenue & Job Status Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Revenue by Category */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Revenue by Category</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-52 w-full" />
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={data?.revenueByCategory?.filter((d: any) => d.value > 0)}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      dataKey="value"
                      nameKey="name"
                      paddingAngle={3}
                    >
                      {(data?.revenueByCategory || []).map((_: any, index: number) => (
                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(val: number) => formatCurrency(val)} />
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "12px" }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Job Status Distribution */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Job Status Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-52 w-full" />
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart
                    data={data?.jobStatusDistribution || []}
                    margin={{ top: 5, right: 10, bottom: 5, left: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="value" name="Jobs" radius={[4, 4, 0, 0]}>
                      {(data?.jobStatusDistribution || []).map((_: any, index: number) => (
                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Revenue by Business */}
        {!isLoading && data?.revenueByBusiness?.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Revenue by Business</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart
                  data={data.revenueByBusiness}
                  layout="vertical"
                  margin={{ top: 5, right: 30, bottom: 5, left: 60 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                  <XAxis type="number" tickFormatter={formatCurrency} tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={80} />
                  <Tooltip formatter={(val: number) => formatCurrency(val)} />
                  <Bar dataKey="value" name="Revenue" fill="#e53e3e" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Top Services & PPF */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {isLoading ? (
            <>
              <Skeleton className="h-72 rounded-xl" />
              <Skeleton className="h-72 rounded-xl" />
            </>
          ) : (
            <>
              <TopItemsTable
                title="Most Sold Services"
                items={data?.topServices || []}
                icon={Wrench}
              />
              <TopItemsTable
                title="Most Sold PPF"
                items={data?.topPPFs || []}
                icon={ShieldCheck}
              />
            </>
          )}
        </div>

        {/* Top Accessories */}
        {isLoading ? (
          <Skeleton className="h-72 rounded-xl" />
        ) : (
          <TopItemsTable
            title="Most Sold Accessories"
            items={data?.topAccessories || []}
            icon={Package}
          />
        )}

        {/* Top Technicians */}
        {!isLoading && data?.topTechnicians?.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Users className="h-4 w-4 text-primary" />
                Top Technicians by Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart
                  data={data.topTechnicians}
                  margin={{ top: 5, right: 10, bottom: 30, left: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11 }}
                    angle={-25}
                    textAnchor="end"
                    interval={0}
                  />
                  <YAxis tickFormatter={formatCurrency} tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(val: number, name: string) =>
                      name === "revenue" ? [formatCurrency(val), "Revenue"] : [val, "Jobs"]
                    }
                  />
                  <Bar dataKey="revenue" name="revenue" fill="#3182ce" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
