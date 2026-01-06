export default function DashboardPage() {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Overview</h1>
          <p className="text-muted-foreground">
            Welcome back! Here is a summary of your current tasks.
          </p>
        </div>
  
        {/* Placeholder for Stat Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <p className="text-sm font-medium text-muted-foreground">Total Tasks</p>
            <p className="text-2xl font-bold text-primary">12</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <p className="text-sm font-medium text-muted-foreground">Pending</p>
            <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-500">8</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <p className="text-sm font-medium text-muted-foreground">Completed</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-500">4</p>
          </div>
        </div>
        
        {/* Placeholder for Recent Tasks List */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h3 className="font-semibold mb-4">Recent Activity</h3>
          <p className="text-sm text-muted-foreground italic">No recent tasks to display.</p>
        </div>
      </div>
    );
  }