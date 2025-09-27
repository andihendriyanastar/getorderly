import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const topProductsData = [
  { name: 'Laptop Dell XPS', value: 45, color: '#0a192f' },
  { name: 'Monitor Samsung', value: 32, color: '#1e3a5f' },
  { name: 'Keyboard Mechanical', value: 28, color: '#2d5a87' },
  { name: 'Mouse Wireless', value: 25, color: '#3c7aaf' },
  { name: 'Webcam HD', value: 22, color: '#4b9ad7' },
  { name: 'Headset Gaming', value: 18, color: '#5abaff' },
  { name: 'SSD External', value: 15, color: '#69caff' },
  { name: 'Printer Inkjet', value: 12, color: '#78daff' },
  { name: 'Speaker Bluetooth', value: 10, color: '#87eaff' },
  { name: 'Power Bank', value: 8, color: '#ffd700' },
];

export function TopProductsChart() {
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-card p-3 rounded-lg shadow-elevated border">
          <p className="font-medium">{data.name}</p>
          <p className="text-accent font-semibold">
            {data.value} unit terjual
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomLegend = () => {
    return (
      <div className="flex flex-col space-y-1 mt-2">
        {topProductsData.slice(0, 6).map((entry, index) => (
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
            <span className="text-foreground font-medium">{entry.value}</span>
          </div>
        ))}
        {topProductsData.length > 6 && (
          <div className="text-xs text-muted-foreground text-center pt-1">
            +{topProductsData.length - 6} produk lainnya
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">10 Produk Terlaris</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80 flex flex-col">
          <div className="flex-1 flex">
            <div className="flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={topProductsData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={1}
                    dataKey="value"
                  >
                    {topProductsData.map((entry, index) => (
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