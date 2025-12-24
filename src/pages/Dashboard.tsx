import {
  Users,
  UserPlus,
  BarChart3,
  GraduationCap,
  Calendar,
  CheckSquare,
  XSquare,
  UserCheck,
  IndianRupee,
  FileX,
  Receipt,
  HelpCircle,
  Ticket,
  CalendarDays,
  CalendarCheck,
  ArrowLeftRight,
  AlertTriangle,
} from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { AnnouncementItem } from "@/components/dashboard/AnnouncementItem";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const stats = [
  { title: "Active Students", value: 6, icon: Users, colorScheme: "blue" as const },
  { title: "New Admissions (30d)", value: 3, icon: UserPlus, colorScheme: "green" as const },
  { title: "Total Batches", value: 28, icon: BarChart3, colorScheme: "purple" as const },
  { title: "Total Admissions", value: 13, icon: GraduationCap, colorScheme: "teal" as const },
  { title: "Sessions This Week", value: 103, icon: Calendar, colorScheme: "blue" as const },
  { title: "Present Today", value: 0, icon: CheckSquare, colorScheme: "green" as const },
  { title: "Absent Today", value: 0, icon: XSquare, colorScheme: "red" as const },
  { title: "Teachers Available Today", value: 0, icon: UserCheck, colorScheme: "teal" as const },
  { title: "Installments Due (Week)", value: 1, icon: IndianRupee, colorScheme: "yellow" as const },
  { title: "Staff on Leave", value: 10, icon: FileX, colorScheme: "orange" as const },
  { title: "Payslips (Last Month)", value: 3, icon: Receipt, colorScheme: "purple" as const },
  { title: "Open Doubts", value: 8, icon: HelpCircle, colorScheme: "orange" as const },
  { title: "Open Support Tickets", value: 3, icon: Ticket, colorScheme: "orange" as const },
  { title: "Pending PTM Requests", value: 3, icon: CalendarDays, colorScheme: "yellow" as const },
  { title: "PTMs Today", value: 0, icon: CalendarCheck, colorScheme: "purple" as const },
  { title: "Pending Transfers", value: 0, icon: ArrowLeftRight, colorScheme: "teal" as const },
  { title: "Open Grievances", value: 3, icon: AlertTriangle, colorScheme: "red" as const },
];

const announcements = [
  { title: "Batch Transfer", date: "December 10, 2025", source: "System Trigger" },
  { title: "Batch Transfer", date: "December 10, 2025", source: "System Trigger" },
  { title: "Test", date: "December 10, 2025", source: "{}" },
];

const Dashboard = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground sm:text-2xl md:text-3xl">
            Welcome back, Super Admin!
          </h1>
          <p className="text-sm text-muted-foreground sm:text-base">Here's a quick overview of your portal.</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <span className="text-sm text-muted-foreground">Viewing Stats For</span>
          <Select defaultValue="global">
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Select branch" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="global">Global (All Branches)</SelectItem>
              <SelectItem value="branch1">Branch 1</SelectItem>
              <SelectItem value="branch2">Branch 2</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {stats.map((stat, index) => (
          <StatCard
            key={index}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            colorScheme={stat.colorScheme}
          />
        ))}
      </div>

      {/* Announcements */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <span>📢</span>
            Recent Announcements
          </CardTitle>
          <Button variant="link" className="text-primary p-0 h-auto">
            View All
          </Button>
        </CardHeader>
        <CardContent className="space-y-2">
          {announcements.map((announcement, index) => (
            <AnnouncementItem
              key={index}
              title={announcement.title}
              date={announcement.date}
              source={announcement.source}
            />
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
