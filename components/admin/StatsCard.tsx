import { Card, CardContent } from "@/components/ui/card";

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: string;
  subtitle?: string;
  className?: string;
}

export function StatsCard({
  title,
  value,
  icon,
  subtitle,
  className,
}: StatsCardProps) {
  return (
    <Card className={className}>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold mt-1">{value}</p>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
            )}
          </div>
          <span className="text-2xl">{icon}</span>
        </div>
      </CardContent>
    </Card>
  );
}
