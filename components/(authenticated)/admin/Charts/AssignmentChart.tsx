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
import React, { useEffect, useState } from "react";
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
  ChartAnnotation // Register the annotation plugin
);

interface ApiData {
  period: string;
  totalOrders: number;
}

const AssignmentChart: React.FC = () => {
  const [time, setTime] = useState<string>("daily");
  const [apiData, setApiData] = useState<ApiData[]>([]);

  const newDate = new Date();
  const lastMonth = new Date(newDate);
  lastMonth.setMonth(lastMonth.getMonth() - 1);
  const [startDate, setStartDate] = useState<Date>(lastMonth);
  const [endDate, setEndDate] = useState<Date>(newDate);

  // Fetch the data from the API based on time and selected date range
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
        // Sort the data based on the period (daily, weekly, etc.)
        const sortedData: ApiData[] = res.data.sort(
          (a: ApiData, b: ApiData) =>
            new Date(a.period).getTime() - new Date(b.period).getTime()
        );

        // Format the data according to the selected time range
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

          return {
            period: label,
            totalOrders: item.totalOrders,
          };
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
    labels: apiData.map((item) => item.period), // x-axis: Formatted periods (daily, weekly, monthly, yearly)
    datasets: [
      {
        label: "Total Orders",
        data: apiData.map((item) => item.totalOrders), // y-axis: Total orders
        borderColor: "rgba(75,192,192,1)",
        backgroundColor: "rgba(75,192,192,0.2)",
        pointBackgroundColor: "rgba(75,192,192,1)",
        pointBorderColor: "#fff",
        tension: 0.4, // Smooth curve
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: `Orders Overview (${
          time.charAt(0).toUpperCase() + time.slice(1)
        }) from ${format(startDate, "PPP")} to ${format(endDate, "PPP")}`,
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Time Period",
        },
      },
      y: {
        title: {
          display: true,
          text: "Total Orders",
        },
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="p-6  bg-white shadow-lg rounded-lg space-y-6">
      <h2 className="text-3xl font-bold text-center">Sales Overview</h2>
      <div className="flex flex-wrap gap-6">
        <div className="space-y-2">
          <p className="text-sm font-medium">Start Date</p>
          <Popover>
            <PopoverTrigger asChild>
              <div
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "w-full md:w-[240px] pl-3 text-left font-normal"
                )}
              >
                {startDate ? (
                  format(startDate, "PPP")
                ) : (
                  <span>Pick a date</span>
                )}
                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
              </div>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={(value) => {
                  if (value) setStartDate(value);
                }}
                disabled={(date) =>
                  date > new Date() || date < new Date("1900-01-01")
                }
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium">End Date</p>
          <Popover>
            <PopoverTrigger asChild>
              <div
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "w-full md:w-[240px] pl-3 text-left font-normal"
                )}
              >
                {endDate ? format(endDate, "PPP") : <span>Pick a date</span>}
                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
              </div>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={(value) => {
                  if (value) setEndDate(value);
                }}
                disabled={(date) =>
                  date > new Date() || date < new Date("1900-01-01")
                }
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        <div className="space-y-2 max-w-60 w-full">
          <p className="text-sm font-medium">Interval</p>
          <Select value={time} onValueChange={setTime}>
            <SelectTrigger>
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
      <Line data={data} options={options} />
    </div>
  );
};

export default AssignmentChart;
