'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { PerformanceTrend } from '@/lib/types/result.types';
import { format } from 'date-fns';

interface PerformanceTrendChartProps {
  data: PerformanceTrend;
}

export function PerformanceTrendChart({ data }: PerformanceTrendChartProps) {
  const chartData = data.dataPoints.map(point => ({
    name: format(new Date(point.submittedAt), 'MMM dd'),
    percentage: point.percentage,
    examTitle: point.examTitle,
  }));

  const getTrendIcon = () => {
    switch (data.trend) {
      case 'IMPROVING': return <TrendingUp className="w-4 h-4" />;
      case 'DECLINING': return <TrendingDown className="w-4 h-4" />;
      default: return <Minus className="w-4 h-4" />;
    }
  };

  const getTrendColor = () => {
    switch (data.trend) {
      case 'IMPROVING': return 'bg-green-500';
      case 'DECLINING': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Performance Trend</CardTitle>
          <Badge className={getTrendColor()}>
            <div className="flex items-center gap-1">
              {getTrendIcon()}
              <span>{data.trend}</span>
            </div>
          </Badge>
        </div>
        <div className="text-sm text-gray-500">
          Average: {data.overallAveragePercentage.toFixed(1)}% across {data.totalExams} exams
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis domain={[0, 100]} />
            <Tooltip />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="percentage" 
              stroke="#3b82f6" 
              strokeWidth={2}
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}