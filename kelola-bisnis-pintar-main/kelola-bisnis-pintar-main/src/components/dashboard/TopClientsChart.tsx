import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const topClientsData = [
  { name: 'PT Teknologi Maju', value: 125000000, color: '#0a192f' },
  { name: 'CV Digital Solutions', value: 98000000, color: '#1e3a5f' },
  { name: 'PT Inovasi Kreatif', value: 87000000, color: '#2d5a87' },
  { name: 'UD Sukses Bersama', value: 76000000, color: '#3c7aaf' },
  { name: 'PT Media Global', value: 65000000, color: '#4b9ad7' },
  { name: 'CV Mitra Terpercaya', value: 54000000, color: '#5abaff' },
  { name: 'PT Solusi Bisnis', value: 43000000, color: '#69caff' },
  { name: 'UD Berkah Mandiri', value: 32000000, color: '#78daff' },
  { name: 'CV Harapan Jaya', value: 28000000, color: '#87eaff' },
  { name: 'PT Prima Utama', value: 21000000, color: '#ffd700' },
];

export function TopClientsChart() {
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

  const CustomLegend = () => {
    return (
      <div className="flex flex-col space-y-1 mt-2">
        {topClientsData.slice(0, 6).map((entry, index) => (
          <div key={index} className="flex items-center justify-between text-xs">
            <div className="flex items-center">
              <div 
                className="w-2 h-2 rounded-full mr-2"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-muted-foreground truncate">
                {entry.name.length > 15 ? entry.name.substring(0, 15) + '...' : entry.name}
              </span>
            </div>
            <span className="text-foreground font-medium text-xs">
              {(entry.value / 1000000).toFixed(0)}M
            </span>
          </div>
        ))}
        {topClientsData.length > 6 && (
          <div className="text-xs text-muted-foreground text-center pt-1">
            +{topClientsData.length - 6} klien lainnya
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">10 Klien Terbaik</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80 flex flex-col">
          <div className="flex-1 flex">
            <div className="flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={topClientsData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={1}
                    dataKey="value"
                  >
                    {topClientsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-40 pl-2">
              <CustomLegend />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}