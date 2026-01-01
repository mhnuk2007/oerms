'use client';

import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

interface GradeDistributionChartProps {
  data: Record<string, number>;
}

export function GradeDistributionChart({ data }: GradeDistributionChartProps) {
  const chartData = useMemo(() => {
    const grades = ['A+', 'A', 'B', 'C', 'D', 'F'];
    return grades.map(grade => ({
      grade,
      count: data[grade] || 0,
    }));
  }, [data]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Grade Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="grade" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}