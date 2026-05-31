import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  CheckSquare,
  BookOpen,
  Activity,
  Brain,
  GraduationCap,
  Calendar,
  Clock,
  Settings,
  Search,
  MoreHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NotificationBanner } from "@/components/common/NotificationBanner";
import { GlobalSearch } from "@/components/common/GlobalSearch";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/tasks", icon: CheckSquare, label: "Tasks" },
  { to: "/daily-log", icon: BookOpen, label: "Daily Log" },
  { to: "/trackers", icon: Activity, label: "Trackers" },
  { to: "/revision", icon: Brain, label: "Revision" },
  { to: "/exams", icon: GraduationCap, label: "Exams" },
  { to: "/routine", icon: Clock, label: "Routine" },
  { to: "/calendar", icon: Calendar, label: "Calendar" },
  { to: "/settings", icon: Settings, label: "Settings" },
];

const mobileMainNav = navItems.slice(0, 4);
const mobileMoreNav = navItems.slice(4);

export function AppLayout() {
  const [moreOpen, setMoreOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="flex h-screen bg-background">
      {/* Global Search */}
      <GlobalSearch />

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col border-r border-border">
        <div className="flex h-14 items-center justify-between px-4 border-b border-border">
          <h1 className="text-lg font-semibold">Study System</h1>
          <button
            onClick={() => document.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true }))}
            className="p-1.5 rounded-md hover:bg-muted text-muted-foreground"
            title="Search (Cmd+K)"
          >
            <Search className="h-4 w-4" />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto p-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )
              }
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 pb-20 md:pb-4">
          <NotificationBanner />
          <Outlet />
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex md:hidden items-center justify-around border-t border-border bg-background px-2 py-2">
        {mobileMainNav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center gap-1 px-2 py-1 text-xs transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground"
              )
            }
          >
            <item.icon className="h-5 w-5" />
            <span>{item.label}</span>
          </NavLink>
        ))}
        <button
          onClick={() => setMoreOpen(true)}
          className="flex flex-col items-center gap-1 px-2 py-1 text-xs text-muted-foreground transition-colors"
        >
          <MoreHorizontal className="h-5 w-5" />
          <span>More</span>
        </button>
      </nav>

      {/* More menu sheet */}
      <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
        <SheetContent side="bottom" className="pb-safe">
          <SheetHeader>
            <SheetTitle>More Pages</SheetTitle>
          </SheetHeader>
          <nav className="grid grid-cols-3 gap-4 py-4">
            {mobileMoreNav.map((item) => (
              <button
                key={item.to}
                onClick={() => {
                  navigate(item.to);
                  setMoreOpen(false);
                }}
                className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-muted transition-colors"
              >
                <item.icon className="h-6 w-6" />
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            ))}
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  );
}
