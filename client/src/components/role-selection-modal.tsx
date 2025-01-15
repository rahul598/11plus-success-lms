import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

type Role = "student" | "parent" | "tutor";

interface RoleSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: number;
}

export function RoleSelectionModal({ isOpen, onClose, userId }: RoleSelectionModalProps) {
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const roles: { value: Role; label: string; description: string }[] = [
    {
      value: "student",
      label: "Student",
      description: "Access study materials, take tests, and track your progress",
    },
    {
      value: "parent",
      label: "Parent",
      description: "Monitor your child's progress and communicate with tutors",
    },
    {
      value: "tutor",
      label: "Teacher",
      description: "Create content, manage classes, and help students learn",
    },
  ];

  const handleRoleSelect = async () => {
    if (!selectedRole) {
      toast({
        title: "Error",
        description: "Please select a role to continue",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch("/api/user/role", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role: selectedRole, userId }),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      toast({
        title: "Success",
        description: "Role selected successfully!",
      });

      // Redirect to the appropriate dashboard based on role
      setLocation(`/dashboard/${selectedRole}`);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to set role",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Choose Your Role</DialogTitle>
          <DialogDescription>
            Select how you'll be using our platform. You can't change this later.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {roles.map((role) => (
            <div
              key={role.value}
              className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                selectedRole === role.value
                  ? "border-primary bg-primary/5"
                  : "hover:border-primary/50"
              }`}
              onClick={() => setSelectedRole(role.value)}
            >
              <h3 className="font-semibold mb-1">{role.label}</h3>
              <p className="text-sm text-muted-foreground">{role.description}</p>
            </div>
          ))}
        </div>
        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleRoleSelect}
            disabled={!selectedRole || isLoading}
          >
            {isLoading ? "Setting role..." : "Continue"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
