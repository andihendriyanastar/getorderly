import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const salesData = [
  { name: 'Januari', value: 4500000, color: '#0a192f' },
  { name: 'Februari', value: 3200000, color: '#1e3a5f' },
  { name: 'Maret', value: 5800000, color: '#2d5a87' },
  { name: 'April', value: 4100000, color: '#3c7aaf' },
  { name: 'Mei', value: 6200000, color: '#4b9ad7' },
  { name: 'Juni', value: 7100000, color: '#ffd700' },
];

export function SalesChart() {
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-card p-3 rounded-lg shadow-elevated border">
          <p className="font-medium">{data.name}</p>
          <p className="text-accent font-semibold">
            Rp {data.value.toLocaleString('id-ID')}
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomLegend = (props: any) => {
    const { payload } = props;
    return (
      <div className="flex flex-col space-y-2 mt-4">
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center text-sm">
            <div 
              className="w-3 h-3 rounded-full mr-2"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-muted-foreground">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Penjualan 6 Bulan Terakhir</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80 flex">
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={salesData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {salesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="w-40 pl-4">
            <CustomLegend payload={salesData.map(item => ({ 
              value: item.name, 
              color: item.color 
            }))} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}