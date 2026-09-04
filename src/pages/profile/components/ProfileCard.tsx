import { Mail, Phone, Building, Calendar, Shield, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ProfileFormData } from "./types";

interface ProfileCardProps {
  profileData: ProfileFormData;
}

export const ProfileCard = ({ profileData }: ProfileCardProps) => {
  const getInitials = (name: string) => {
    return (
      name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase() || "U"
    );
  };

  return (
    <Card className="md:col-span-1">
      <CardContent className="pt-6">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="relative">
            <Avatar className="h-24 w-24">
              <AvatarImage src="" />
              <AvatarFallback className="bg-primary/10 text-primary text-2xl font-semibold">
                {getInitials(profileData.fullName)}
              </AvatarFallback>
            </Avatar>
            <Button
              size="icon"
              variant="secondary"
              className="absolute bottom-0 right-0 h-8 w-8 rounded-full"
            >
              <Camera className="h-4 w-4" />
            </Button>
          </div>
          <div>
            <h3 className="font-semibold text-foreground text-lg">
              {profileData.fullName || "User"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {profileData.designation}
            </p>
          </div>
          <Badge variant="secondary" className="bg-primary/10 text-primary">
            <Shield className="h-3 w-3 mr-1" />
            Admin
          </Badge>
          <Separator />
          <div className="w-full space-y-3 text-left">
            <div className="flex items-center gap-3 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-foreground truncate">
                {profileData.email || "Not set"}
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span className="text-foreground">
                {profileData.phone || "Not set"}
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Building className="h-4 w-4 text-muted-foreground" />
              <span className="text-foreground">{profileData.branch}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-foreground">
                {profileData.joinDate
                  ? `Joined ${new Date(profileData.joinDate).toLocaleDateString(
                      "en-US",
                      {
                        month: "long",
                        year: "numeric",
                      }
                    )}`
                  : "Join date unknown"}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
