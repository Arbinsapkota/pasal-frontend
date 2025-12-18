"use client";
import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from "chart.js";
import ChartAnnotation from "chartjs-plugin-annotation";
import React, { useEffect, useState, useRef } from "react";
import { Line } from "react-chartjs-2";

import { axiosAuthInstance } from "@/components/axiosInstance";
import { buttonVariants } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

// Register chart components
ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  PointElement,
  ChartAnnotation
);

interface ApiData {
  period: string;
  totalOrders: number;
}

// Sparkle plugin
const sparklePlugin = {
  id: "sparklePlugin",
  afterDraw: (chart: any) => {
    const { ctx } = chart;
    chart.data.datasets.forEach((dataset: any, datasetIndex: number) => {
      const meta = chart.getDatasetMeta(datasetIndex);
      meta.data.forEach((point: any, index: number) => {
        const t = (Date.now() / 1000 + index * 0.2) % 1; // animation timing
        const x = point.x + Math.sin(t * Math.PI * 2) * 2; // subtle horizontal movement
        const y = point.y + Math.cos(t * Math.PI * 2) * 2; // subtle vertical movement

        ctx.save();
        ctx.shadowColor = "rgba(79,70,229,0.7)";
        ctx.shadowBlur = 12;
        ctx.fillStyle = "rgba(79,70,229,0.8)";
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, 2 * Math.PI);
        ctx.fill();
        ctx.restore();
      });
    });
  },
};

const AssignmentChart: React.FC = () => {
  const [time, setTime] = useState<string>("daily");
  const [apiData, setApiData] = useState<ApiData[]>([]);
  const chartRef = useRef<any>(null);

  const newDate = new Date();
  const lastMonth = new Date(newDate);
  lastMonth.setMonth(lastMonth.getMonth() - 1);
  const [startDate, setStartDate] = useState<Date>(lastMonth);
  const [endDate, setEndDate] = useState<Date>(newDate);

  useEffect(() => {
    axiosAuthInstance()
      .get("/api/order/orders-graph", {
        params: {
          interval: time,
          startDate: formatDateToYYYYMMDD(startDate),
          endDate: formatDateToYYYYMMDD(endDate),
        },
      })
      .then((res) => {
        const sortedData: ApiData[] = res.data.sort(
          (a: ApiData, b: ApiData) =>
            new Date(a.period).getTime() - new Date(b.period).getTime()
        );

        const formattedData = sortedData.map((item) => {
          let label = item.period;
          if (time === "weekly") {
            const weekNumber = label.split("-")[1];
            label = `Week ${weekNumber} - ${label.split("-")[0]}`;
          } else if (time === "monthly") {
            const [year, month] = label.split("-");
            const monthName = new Date(`${year}-${month}-01`).toLocaleString(
              "default",
              { month: "long" }
            );
            label = `${monthName} ${year}`;
          } else if (time === "yearly") {
            label = `${label}`;
          }
          return { period: label, totalOrders: item.totalOrders };
        });

        setApiData(formattedData);
      })
      .catch((err) => console.error("Error fetching data", err));
  }, [time, startDate, endDate]);

  function formatDateToYYYYMMDD(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  const data = {
    labels: apiData.map((item) => item.period),
    datasets: [
      {
        label: "Total Orders",
        data: apiData.map((item) => item.totalOrders),
        borderColor: "#4f46e5",
        backgroundColor: (ctx: any) => {
          const gradient = ctx.chart.ctx.createLinearGradient(0, 0, 0, 400);
          gradient.addColorStop(0, "rgba(79,70,229,0.5)");
          gradient.addColorStop(1, "rgba(79,70,229,0.05)");
          return gradient;
        },
        pointBackgroundColor: "#fff",
        pointBorderColor: "#4f46e5",
        pointHoverBackgroundColor: "#4f46e5",
        pointHoverBorderColor: "#fff",
        pointHoverRadius: 10,
        pointRadius: 6,
        borderWidth: 3,
        tension: 0.4,
        fill: "start",
      },
    ],
  };

  const options = {
    responsive: true,
    animation: {
      duration: 1800,
      easing: "easeOutQuart",
    },
    interaction: {
      mode: "nearest" as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          font: { size: 14, weight: "600" },
          color: "#1e293b",
        },
      },
      title: {
        display: true,
        text: `Orders Overview (${
          time.charAt(0).toUpperCase() + time.slice(1)
        }) from ${format(startDate, "PPP")} to ${format(endDate, "PPP")}`,
        font: { size: 22, weight: "700" },
        color: "#1e293b",
        padding: { top: 10, bottom: 25 },
      },
      tooltip: {
        enabled: true,
        backgroundColor: "#4f46e5",
        titleColor: "#fff",
        bodyColor: "#f9fafb",
        padding: 12,
        cornerRadius: 10,
        bodyFont: { size: 14, weight: "500" },
        displayColors: false,
        intersect: false,
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Time Period",
          font: { size: 14, weight: "600" },
          color: "#1e293b",
        },
        ticks: { color: "#334155", font: { size: 12 } },
        grid: { color: "#e2e8f0", drawBorder: false },
      },
      y: {
        title: {
          display: true,
          text: "Total Orders",
          font: { size: 14, weight: "600" },
          color: "#1e293b",
        },
        ticks: { color: "#334155", font: { size: 12 } },
        grid: { color: "#e2e8f0", borderDash: [4, 6], drawBorder: false },
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="p-10 bg-gradient-to-br from-gray-50 via-white to-gray-50 rounded-3xl shadow-2xl space-y-10">
      <h2 className="text-4xl font-extrabold text-center text-gray-900 tracking-tight">
        Sales Overview
      </h2>

      <div className="flex flex-wrap gap-6 justify-center">
        {/* Start Date Picker */}
        <div className="space-y-2">
          <p className="text-sm font-semibold text-gray-700">Start Date</p>
          <Popover>
            <PopoverTrigger asChild>
              <div
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "w-full md:w-64 pl-4 text-left font-medium border-gray-300 shadow-md hover:shadow-lg transition-all duration-300 rounded-xl bg-white"
                )}
              >
                {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
                <CalendarIcon className="ml-auto h-5 w-5 opacity-70" />
              </div>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={(value) => value && setStartDate(value)}
                disabled={(date) =>
                  date > new Date() || date < new Date("1900-01-01")
                }
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* End Date Picker */}
        <div className="space-y-2">
          <p className="text-sm font-semibold text-gray-700">End Date</p>
          <Popover>
            <PopoverTrigger asChild>
              <div
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "w-full md:w-64 pl-4 text-left font-medium border-gray-300 shadow-md hover:shadow-lg transition-all duration-300 rounded-xl bg-white"
                )}
              >
                {endDate ? format(endDate, "PPP") : <span>Pick a date</span>}
                <CalendarIcon className="ml-auto h-5 w-5 opacity-70" />
              </div>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={(value) => value && setEndDate(value)}
                disabled={(date) =>
                  date > new Date() || date < new Date("1900-01-01")
                }
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Interval Selector */}
        <div className="space-y-2 max-w-60 w-full">
          <p className="text-sm font-semibold text-gray-700">Interval</p>
          <Select value={time} onValueChange={setTime}>
            <SelectTrigger className="border-gray-300 shadow-md hover:shadow-lg transition-all duration-300 rounded-xl bg-white">
              <SelectValue placeholder="Select Interval" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Time</SelectLabel>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Chart Container */}
      <div className="bg-white p-8 rounded-3xl shadow-2xl hover:shadow-3xl transition-shadow duration-500 border border-gray-100">
        <Line ref={chartRef} data={data} options={options} plugins={[sparklePlugin]} />
      </div>
    </div>
  );
};

export default AssignmentChart;
