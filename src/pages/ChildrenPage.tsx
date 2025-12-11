import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Edit2, Heart, GraduationCap, ShoppingBag, Stethoscope } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

const childrenData = [
  {
    id: 1,
    name: "Emma",
    preferredName: "Em",
    dob: "March 15, 2016",
    age: 8,
    pronouns: "she/her",
    avatar: "E",
    basic: {
      allergies: "Peanuts, Tree nuts",
      medications: "None",
      doctor: "Dr. Sarah Johnson, (555) 123-4567",
      dentist: "Dr. Michael Chen, (555) 234-5678",
      insurance: "BlueCross BlueShield - Policy #ABC123456",
    },
    sizes: {
      clothing: "Size 8",
      shoes: "Size 2",
      notes: "Prefers pink and purple colors. Loves butterflies.",
    },
    school: {
      name: "Lincoln Elementary School",
      grade: "3rd Grade",
      teacher: "Mrs. Thompson",
      activities: [
        { name: "Soccer", days: "Tue/Thu 4-5 PM" },
        { name: "Art Club", days: "Wed 3-4 PM" },
      ],
    },
    purchases: [
      { item: "Winter jacket", date: "Nov 20, 2024", by: "Mom", link: "" },
      { item: "Soccer cleats", date: "Oct 5, 2024", by: "Dad", link: "" },
    ],
    lastUpdated: "Dec 10, 2024",
    updatedBy: "Sarah",
  },
  {
    id: 2,
    name: "Lucas",
    preferredName: "Luke",
    dob: "July 22, 2019",
    age: 5,
    pronouns: "he/him",
    avatar: "L",
    basic: {
      allergies: "None",
      medications: "None",
      doctor: "Dr. Sarah Johnson, (555) 123-4567",
      dentist: "Dr. Michael Chen, (555) 234-5678",
      insurance: "BlueCross BlueShield - Policy #ABC123456",
    },
    sizes: {
      clothing: "Size 5T",
      shoes: "Size 11",
      notes: "Loves dinosaurs and trucks.",
    },
    school: {
      name: "Sunshine Preschool",
      grade: "Pre-K",
      teacher: "Ms. Rodriguez",
      activities: [
        { name: "T-Ball", days: "Sat 10-11 AM" },
      ],
    },
    purchases: [
      { item: "Dinosaur backpack", date: "Aug 15, 2024", by: "Dad", link: "" },
    ],
    lastUpdated: "Dec 8, 2024",
    updatedBy: "John",
  },
];

const ChildrenPage = () => {
  const [selectedChild, setSelectedChild] = useState(childrenData[0]);

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
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Child
          </Button>
        </motion.div>

        {/* Child Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex gap-3 overflow-x-auto pb-2"
        >
          {childrenData.map((child) => (
            <button
              key={child.id}
              onClick={() => setSelectedChild(child)}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all whitespace-nowrap",
                selectedChild.id === child.id
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              )}
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                {child.avatar}
              </div>
              <div className="text-left">
                <p className="font-medium">{child.name}</p>
                <p className="text-xs text-muted-foreground">{child.age} years old</p>
              </div>
            </button>
          ))}
        </motion.div>

        {/* Child Profile */}
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
                  {selectedChild.avatar}
                </div>
                <div>
                  <h2 className="text-xl font-display font-bold">{selectedChild.name}</h2>
                  <p className="text-sm text-muted-foreground">
                    {selectedChild.preferredName && `"${selectedChild.preferredName}" • `}
                    {selectedChild.pronouns} • Born {selectedChild.dob}
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                <Edit2 className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              Last updated by {selectedChild.updatedBy} on {selectedChild.lastUpdated}
            </p>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="health" className="p-6">
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="health" className="flex items-center gap-2">
                <Stethoscope className="w-4 h-4" />
                <span className="hidden sm:inline">Health</span>
              </TabsTrigger>
              <TabsTrigger value="sizes" className="flex items-center gap-2">
                <Heart className="w-4 h-4" />
                <span className="hidden sm:inline">Sizes</span>
              </TabsTrigger>
              <TabsTrigger value="school" className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4" />
                <span className="hidden sm:inline">School</span>
              </TabsTrigger>
              <TabsTrigger value="purchases" className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4" />
                <span className="hidden sm:inline">Purchases</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="health" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-muted/30 border border-border">
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Allergies</h4>
                  <p className="font-medium">{selectedChild.basic.allergies || "None"}</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/30 border border-border">
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Medications</h4>
                  <p className="font-medium">{selectedChild.basic.medications || "None"}</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/30 border border-border">
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Doctor</h4>
                  <p className="font-medium">{selectedChild.basic.doctor}</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/30 border border-border">
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Dentist</h4>
                  <p className="font-medium">{selectedChild.basic.dentist}</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/30 border border-border md:col-span-2">
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Insurance</h4>
                  <p className="font-medium">{selectedChild.basic.insurance}</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="sizes" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-muted/30 border border-border">
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Clothing Size</h4>
                  <p className="font-medium">{selectedChild.sizes.clothing}</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/30 border border-border">
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Shoe Size</h4>
                  <p className="font-medium">{selectedChild.sizes.shoes}</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/30 border border-border md:col-span-2">
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Notes & Preferences</h4>
                  <p className="font-medium">{selectedChild.sizes.notes}</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="school" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-muted/30 border border-border">
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">School</h4>
                  <p className="font-medium">{selectedChild.school.name}</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/30 border border-border">
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Grade & Teacher</h4>
                  <p className="font-medium">{selectedChild.school.grade} • {selectedChild.school.teacher}</p>
                </div>
              </div>
              <div className="p-4 rounded-lg bg-muted/30 border border-border">
                <h4 className="text-sm font-medium text-muted-foreground mb-3">Activities</h4>
                <div className="space-y-2">
                  {selectedChild.school.activities.map((activity) => (
                    <div key={activity.name} className="flex items-center justify-between p-3 bg-card rounded-lg">
                      <span className="font-medium">{activity.name}</span>
                      <span className="text-sm text-muted-foreground">{activity.days}</span>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="purchases" className="space-y-4">
              <div className="space-y-3">
                {selectedChild.purchases.map((purchase, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border">
                    <div>
                      <p className="font-medium">{purchase.item}</p>
                      <p className="text-sm text-muted-foreground">{purchase.date} • Purchased by {purchase.by}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Add Purchase
              </Button>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default ChildrenPage;
