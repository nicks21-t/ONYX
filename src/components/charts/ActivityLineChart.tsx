import React, { useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { DailyActivityMetric } from '../../types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler
);

interface ActivityLineChartProps {
  data: DailyActivityMetric[];
  metric: 'work' | 'sport' | 'recovery';
}

export const ActivityLineChart: React.FC<ActivityLineChartProps> = ({ data, metric }) => {
  const chartRef = useRef<ChartJS<'line'>>(null);

  const labels = data.map(d => d.day);

  // Primary wave values
  let primaryValues: number[] = [];
  let secondaryValues: number[] = [];
  let unit = 'h';
  let primaryLabel = 'Carico Lavoro';
  let secondaryLabel = 'Target Ottimale';

  if (metric === 'work') {
    primaryValues = data.map(d => d.workHours);
    secondaryValues = [6.5, 7.0, 7.5, 8.0, 5.0, 3.0, 4.0];
    unit = ' ore';
    primaryLabel = 'Ore Effettive';
    secondaryLabel = 'Baseline';
  } else if (metric === 'sport') {
    primaryValues = data.map(d => d.sportMinutes);
    secondaryValues = [35, 40, 45, 30, 50, 75, 40];
    unit = ' min';
    primaryLabel = 'Minuti Attivi';
    secondaryLabel = 'Obiettivo';
  } else {
    primaryValues = data.map(d => d.recoveryScore);
    secondaryValues = [80, 82, 85, 75, 88, 90, 84];
    unit = '%';
    primaryLabel = 'Wellness Score';
    secondaryLabel = 'Target Riposo';
  }

  const chartData = {
    labels,
    datasets: [
      {
        label: primaryLabel,
        data: primaryValues,
        borderColor: '#ff5e1e', // Fluorescent Orange / Coral
        borderWidth: 2.5,
        backgroundColor: (context: any) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 190);
          gradient.addColorStop(0, 'rgba(255, 94, 30, 0.35)');
          gradient.addColorStop(0.6, 'rgba(255, 94, 30, 0.08)');
          gradient.addColorStop(1, 'rgba(255, 94, 30, 0)');
          return gradient;
        },
        fill: true,
        tension: 0.45, // Soft sinusoidal waves
        pointBackgroundColor: '#0e0e14',
        pointBorderColor: '#ff5e1e',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 7,
        pointHoverBackgroundColor: '#ff5e1e',
        pointHoverBorderColor: '#ffffff',
        pointHoverBorderWidth: 2,
      },
      {
        label: secondaryLabel,
        data: secondaryValues,
        borderColor: '#a3e635', // Acid / Neon lime green
        borderWidth: 1.8,
        borderDash: [5, 5],
        backgroundColor: 'rgba(163, 230, 53, 0.05)',
        fill: true,
        tension: 0.45, // Soft wave
        pointRadius: 0,
        pointHoverRadius: 4,
        pointHoverBackgroundColor: '#a3e635',
      },
    ],
  };

  const options: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(18, 18, 26, 0.95)',
        borderColor: 'rgba(255, 255, 255, 0.12)',
        borderWidth: 1,
        titleColor: '#a1a1aa',
        bodyColor: '#ffffff',
        bodyFont: {
          family: 'JetBrains Mono',
          weight: 'bold',
          size: 13,
        },
        padding: 10,
        cornerRadius: 14,
        displayColors: true,
        callbacks: {
          label: (context: any) => ` ${context.dataset.label}: ${context.parsed.y}${unit}`,
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
          drawBorder: false,
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.45)',
          font: {
            size: 11,
            weight: '500',
          },
        },
      },
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.04)',
          drawBorder: false,
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.35)',
          font: {
            family: 'JetBrains Mono',
            size: 10,
          },
          padding: 8,
        },
      },
    },
  };

  return (
    <div className="h-56 w-full pt-2">
      <Line ref={chartRef} data={chartData} options={options} />
    </div>
  );
};
