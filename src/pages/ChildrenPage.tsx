import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Edit2, Baby, Calendar } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useChildren, Child } from "@/hooks/useChildren";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const calculateAge = (dateOfBirth: string | null) => {
  if (!dateOfBirth) return null;
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

const formatDate = (dateString: string | null) => {
  if (!dateString) return "Not set";
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

const ChildrenPage = () => {
  const { children, loading, addChild, updateChild } = useChildren();
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [newChildName, setNewChildName] = useState("");
  const [newChildDob, setNewChildDob] = useState("");
  const [editName, setEditName] = useState("");
  const [editDob, setEditDob] = useState("");

  const handleAddChild = async () => {
    if (newChildName.trim()) {
      const child = await addChild(newChildName.trim(), newChildDob || undefined);
      if (child) {
        setNewChildName("");
        setNewChildDob("");
        setIsAddDialogOpen(false);
        setSelectedChild(child);
      }
    }
  };

  const handleEditChild = async () => {
    if (selectedChild && editName.trim()) {
      const success = await updateChild(selectedChild.id, {
        name: editName.trim(),
        date_of_birth: editDob || null,
      });
      if (success) {
        setSelectedChild({ ...selectedChild, name: editName.trim(), date_of_birth: editDob || null });
        setIsEditDialogOpen(false);
      }
    }
  };

  const openEditDialog = () => {
    if (selectedChild) {
      setEditName(selectedChild.name);
      setEditDob(selectedChild.date_of_birth || "");
      setIsEditDialogOpen(true);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="h-[calc(100vh-7rem)] flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Loading children...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <h1 className="text-2xl lg:text-3xl font-display font-bold">Child Information Hub</h1>
            <p className="text-muted-foreground mt-1">Keep important details organized and shared</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Child
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add a Child</DialogTitle>
                <DialogDescription>
                  Enter your child's information. This will be shared with your co-parent.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    placeholder="Child's name"
                    value={newChildName}
                    onChange={(e) => setNewChildName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dob">Date of Birth</Label>
                  <Input
                    id="dob"
                    type="date"
                    value={newChildDob}
                    onChange={(e) => setNewChildDob(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddChild} disabled={!newChildName.trim()}>
                  Add Child
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </motion.div>

        {children.length === 0 ? (
          /* Empty State */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-16 gap-4"
          >
            <Baby className="w-16 h-16 text-muted-foreground" />
            <h2 className="text-xl font-display font-bold">No Children Added Yet</h2>
            <p className="text-muted-foreground text-center max-w-md">
              Add your children to keep track of their information and share it with your co-parent.
            </p>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Child
            </Button>
          </motion.div>
        ) : (
          <>
            {/* Child Selector */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex gap-3 overflow-x-auto pb-2"
            >
              {children.map((child) => (
                <button
                  key={child.id}
                  onClick={() => setSelectedChild(child)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all whitespace-nowrap",
                    selectedChild?.id === child.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                    {child.avatar_url ? (
                      <img src={child.avatar_url} alt={child.name} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      child.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="text-left">
                    <p className="font-medium">{child.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {calculateAge(child.date_of_birth) !== null
                        ? `${calculateAge(child.date_of_birth)} years old`
                        : "Age not set"}
                    </p>
                  </div>
                </button>
              ))}
            </motion.div>

            {/* Child Profile */}
            {selectedChild && (
              <motion.div
                key={selectedChild.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-border bg-card overflow-hidden"
              >
                {/* Profile Header */}
                <div className="p-6 bg-gradient-to-r from-primary/5 to-accent/5 border-b border-border">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-semibold">
                        {selectedChild.avatar_url ? (
                          <img
                            src={selectedChild.avatar_url}
                            alt={selectedChild.name}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          selectedChild.name.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div>
                        <h2 className="text-xl font-display font-bold">{selectedChild.name}</h2>
                        <p className="text-sm text-muted-foreground">
                          {selectedChild.date_of_birth
                            ? `Born ${formatDate(selectedChild.date_of_birth)} • ${calculateAge(selectedChild.date_of_birth)} years old`
                            : "Date of birth not set"}
                        </p>
                      </div>
                    </div>
                    <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={openEditDialog}>
                          <Edit2 className="w-4 h-4 mr-2" />
                          Edit Profile
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Edit Child Profile</DialogTitle>
                          <DialogDescription>
                            Update your child's information.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="edit-name">Name</Label>
                            <Input
                              id="edit-name"
                              placeholder="Child's name"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="edit-dob">Date of Birth</Label>
                            <Input
                              id="edit-dob"
                              type="date"
                              value={editDob}
                              onChange={(e) => setEditDob(e.target.value)}
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button onClick={handleEditChild} disabled={!editName.trim()}>
                            Save Changes
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                  <p className="text-xs text-muted-foreground mt-4">
                    Last updated: {formatDate(selectedChild.updated_at)}
                  </p>
                </div>

                {/* Profile Content */}
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-muted/30 border border-border">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <h4 className="text-sm font-medium text-muted-foreground">Date of Birth</h4>
                      </div>
                      <p className="font-medium">{formatDate(selectedChild.date_of_birth)}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/30 border border-border">
                      <div className="flex items-center gap-2 mb-2">
                        <Baby className="w-4 h-4 text-muted-foreground" />
                        <h4 className="text-sm font-medium text-muted-foreground">Age</h4>
                      </div>
                      <p className="font-medium">
                        {calculateAge(selectedChild.date_of_birth) !== null
                          ? `${calculateAge(selectedChild.date_of_birth)} years old`
                          : "Not set"}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-6 p-4 rounded-lg bg-accent/20 border border-accent/30">
                    <p className="text-sm text-muted-foreground">
                      More profile features like health information, school details, sizes, and purchase tracking coming soon!
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ChildrenPage;
