import { Settings2, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { ModuleDB } from "./types";

interface ModulesTabProps {
  modules: ModuleDB[];
  isLoading: boolean;
}

export const ModulesTab = ({ modules, isLoading }: ModulesTabProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Modules Overview</CardTitle>
        <CardDescription>
          View all available modules and their enabled status based on feature
          config
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-2">
            {modules?.map((module) => (
              <div
                key={module.id}
                className="flex items-center justify-between p-3 rounded-lg border"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-md bg-muted p-2">
                    <Settings2 className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">{module.module_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {module.module_code}
                      {module.route_prefix && ` • ${module.route_prefix}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {module.is_active ? (
                    <Badge variant="default" className="gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      Active
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="gap-1">
                      <XCircle className="h-3 w-3" />
                      Inactive
                    </Badge>
                  )}
                </div>
              </div>
            ))}

            {(!modules || modules.length === 0) && (
              <div className="text-center py-8 text-muted-foreground">
                No modules found. Modules are created via database seeding.
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
