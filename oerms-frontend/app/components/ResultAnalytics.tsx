"use client";

import { useMemo } from "react";
import type { ResultAnalytics } from "../types/result";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
  ScatterChart,
  Scatter,
  ComposedChart,
} from "recharts";

const COLORS = {
  primary: '#0ea5e9',
  success: '#22c55e',
  warning: '#f59e0b',
  error: '#ef4444',
  purple: '#8b5cf6',
  pink: '#ec4899',
  indigo: '#6366f1',
  teal: '#14b8a6',
};

const DIFFICULTY_COLORS = {
  EASY: COLORS.success,
  MEDIUM: COLORS.warning,
  HARD: COLORS.error,
};

interface Props {
  analytics: ResultAnalytics;
}

export default function ResultAnalytics({ analytics }: Props) {
  const difficultyData = useMemo(() => {
    const data = analytics.questionAnalytics.reduce((acc: Record<string, number>, qa: any) => {
      acc[qa.difficultyLevel] = (acc[qa.difficultyLevel] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(data).map(([level, count]) => ({
      name: level,
      value: count,
      color: DIFFICULTY_COLORS[level as keyof typeof DIFFICULTY_COLORS] || COLORS.primary,
    }));
  }, [analytics]);

  const performanceData = useMemo(() => {
    return analytics.questionAnalytics.map((qa: any, index: number) => ({
      question: `Q${index + 1}`,
      correctPercentage: qa.correctPercentage,
      averageScore: qa.averageScore,
      averageTime: Math.round(qa.averageTimeSpent / 60),
      difficulty: qa.difficultyLevel,
    }));
  }, [analytics]);

  const scoreRanges = useMemo(() => {
    return analytics.scoreDistribution.map((range: any, index: number) => ({
      ...range,
      color: index < 2 ? COLORS.error : index < 4 ? COLORS.warning : COLORS.success,
    }));
  }, [analytics]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-neutral-200 rounded-lg shadow-lg">
          <p className="font-medium text-neutral-900">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">Exam Analytics Dashboard</h1>
        <p className="text-neutral-600">Comprehensive insights into exam performance and student engagement</p>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card card-elevated">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600">Total Attempts</p>
              <p className="text-3xl font-bold text-primary-600">{analytics.totalAttempts}</p>
            </div>
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-success-600 font-medium">+12%</span>
            <span className="text-neutral-500 ml-2">vs last exam</span>
          </div>
        </div>

        <div className="card card-elevated">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600">Average Score</p>
              <p className="text-3xl font-bold text-success-600">{analytics.averageScore.toFixed(1)}</p>
            </div>
            <div className="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-success-600 font-medium">+5.2%</span>
            <span className="text-neutral-500 ml-2">vs last exam</span>
          </div>
        </div>

        <div className="card card-elevated">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600">Pass Rate</p>
              <p className="text-3xl font-bold text-warning-600">{analytics.passPercentage}%</p>
            </div>
            <div className="w-12 h-12 bg-warning-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-success-600 font-medium">+3.1%</span>
            <span className="text-neutral-500 ml-2">vs last exam</span>
          </div>
        </div>

        <div className="card card-elevated">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600">Avg. Time Spent</p>
              <p className="text-3xl font-bold text-purple-600">{Math.round(analytics.averageTimeSpent / 60)}m</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-error-600 font-medium">-2.3m</span>
            <span className="text-neutral-500 ml-2">vs last exam</span>
          </div>
        </div>
      </div>

      {/* Score Distribution */}
      <div className="card card-elevated">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-neutral-900">Score Distribution</h2>
          <div className="flex items-center gap-4 text-sm text-neutral-600">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-success-500 rounded"></div>
              <span>High (80-100%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-warning-500 rounded"></div>
              <span>Medium (60-79%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-error-500 rounded"></div>
              <span>Low (0-59%)</span>
            </div>
          </div>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={scoreRanges} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="range" 
                tick={{ fontSize: 12 }}
                tickLine={{ stroke: '#e5e5e5' }}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickLine={{ stroke: '#e5e5e5' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {scoreRanges.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Time vs Performance Analysis */}
      <div className="card card-elevated">
        <h2 className="text-xl font-semibold text-neutral-900 mb-6">Time vs Performance Analysis</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart data={performanceData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="averageTime" 
                name="Time (minutes)"
                tick={{ fontSize: 12 }}
                tickLine={{ stroke: '#e5e5e5' }}
              />
              <YAxis 
                dataKey="correctPercentage" 
                name="Correct %"
                tick={{ fontSize: 12 }}
                tickLine={{ stroke: '#e5e5e5' }}
              />
              <Tooltip 
                content={<CustomTooltip />}
                cursor={{ strokeDasharray: '3 3' }}
              />
              <Scatter 
                dataKey="correctPercentage" 
                fill={COLORS.primary}
                r={6}
              />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Question Difficulty Distribution */}
        <div className="card card-elevated">
          <h2 className="text-xl font-semibold text-neutral-900 mb-6">Question Difficulty Distribution</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={difficultyData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  innerRadius={40}
                  paddingAngle={5}
                  label={({ name, percent }: any) => `${name} ${((percent as number) * 100).toFixed(0)}%`}
                >
                  {difficultyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Question Performance Overview */}
        <div className="card card-elevated">
          <h2 className="text-xl font-semibold text-neutral-900 mb-6">Question Performance Overview</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={performanceData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="question" 
                  tick={{ fontSize: 12 }}
                  tickLine={{ stroke: '#e5e5e5' }}
                />
                <YAxis 
                  yAxisId="left"
                  tick={{ fontSize: 12 }}
                  tickLine={{ stroke: '#e5e5e5' }}
                />
                <YAxis 
                  yAxisId="right" 
                  orientation="right"
                  tick={{ fontSize: 12 }}
                  tickLine={{ stroke: '#e5e5e5' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  yAxisId="left"
                  dataKey="correctPercentage" 
                  fill={COLORS.success}
                  name="Correct %"
                  radius={[2, 2, 0, 0]}
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="averageTime" 
                  stroke={COLORS.warning}
                  strokeWidth={3}
                  name="Avg Time (min)"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Time Distribution */}
      <div className="card card-elevated">
        <h2 className="text-xl font-semibold text-neutral-900 mb-6">Time Distribution</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={analytics.timeDistribution} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <defs>
                <linearGradient id="timeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="range" 
                tick={{ fontSize: 12 }}
                tickLine={{ stroke: '#e5e5e5' }}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickLine={{ stroke: '#e5e5e5' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="count"
                stroke={COLORS.primary}
                strokeWidth={2}
                fill="url(#timeGradient)"
                name="Students"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Question Analysis */}
      <div className="card card-elevated">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-neutral-900">Detailed Question Analysis</h2>
          <div className="flex items-center gap-2 text-sm text-neutral-600">
            <span>Sort by:</span>
            <select className="form-select w-32">
              <option>Difficulty</option>
              <option>Performance</option>
              <option>Time</option>
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-neutral-200">
                <th className="text-left py-3 px-4 font-semibold text-neutral-700">Question</th>
                <th className="text-left py-3 px-4 font-semibold text-neutral-700">Avg. Score</th>
                <th className="text-left py-3 px-4 font-semibold text-neutral-700">Correct %</th>
                <th className="text-left py-3 px-4 font-semibold text-neutral-700">Avg. Time</th>
                <th className="text-left py-3 px-4 font-semibold text-neutral-700">Difficulty</th>
                <th className="text-left py-3 px-4 font-semibold text-neutral-700">Performance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {performanceData.map((qa: any, index: number) => (
                <tr key={qa.question} className="hover:bg-neutral-50 transition-colors">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                        <span className="text-sm font-semibold text-primary-600">{index + 1}</span>
                      </div>
                      <span className="font-medium text-neutral-900">{qa.question}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{qa.averageScore.toFixed(1)}</span>
                      <div className="w-16 bg-neutral-200 rounded-full h-2">
                        <div 
                          className="bg-primary-600 h-2 rounded-full" 
                          style={{ width: `${(qa.averageScore / 10) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{qa.correctPercentage}%</span>
                      <div className="w-16 bg-neutral-200 rounded-full h-2">
                        <div 
                          className="bg-success-600 h-2 rounded-full" 
                          style={{ width: `${qa.correctPercentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="font-medium">{qa.averageTime}m</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`status-badge ${
                      qa.difficulty === 'EASY' ? 'status-published' :
                      qa.difficulty === 'MEDIUM' ? 'status-pending' : 'status-ended'
                    }`}>
                      {qa.difficulty}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-1">
                      {qa.correctPercentage >= 80 ? (
                        <svg className="w-5 h-5 text-success-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      ) : qa.correctPercentage >= 60 ? (
                        <svg className="w-5 h-5 text-warning-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-error-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      )}
                      <span className="text-sm text-neutral-600">
                        {qa.correctPercentage >= 80 ? 'Excellent' : 
                         qa.correctPercentage >= 60 ? 'Good' : 'Needs Review'}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}