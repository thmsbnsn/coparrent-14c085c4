import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Gift, Plus, ArrowLeft, Sparkles } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { GiftListCard } from "@/components/gifts/GiftListCard";
import { GiftItemCard } from "@/components/gifts/GiftItemCard";
import { CreateGiftListDialog } from "@/components/gifts/CreateGiftListDialog";
import { AddGiftItemDialog } from "@/components/gifts/AddGiftItemDialog";
import { useGiftLists, useGiftItems, GiftList, GiftItem } from "@/hooks/useGiftLists";
import { useChildren } from "@/hooks/useChildren";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const GiftsPage = () => {
  const { children } = useChildren();
  const { 
    giftLists, 
    loading, 
    isParent, 
    profileId,
    createGiftList, 
    updateGiftList,
    deleteGiftList 
  } = useGiftLists();
  
  const [selectedList, setSelectedList] = useState<GiftList | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditListDialog, setShowEditListDialog] = useState(false);
  const [showAddItemDialog, setShowAddItemDialog] = useState(false);
  const [showEditItemDialog, setShowEditItemDialog] = useState(false);
  const [listToEdit, setListToEdit] = useState<GiftList | null>(null);
  const [itemToEdit, setItemToEdit] = useState<GiftItem | null>(null);
  const [listToDelete, setListToDelete] = useState<string | null>(null);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  // Gift items for selected list
  const {
    items,
    loading: itemsLoading,
    isParent: isParentForItems,
    profileId: profileIdForItems,
    addItem,
    updateItem,
    claimItem,
    unclaimItem,
    markPurchased,
    deleteItem,
  } = useGiftItems(selectedList?.id || "");

  useEffect(() => {
    if (!selectedList) return;
    const refreshed = giftLists.find((list) => list.id === selectedList.id);
    if (refreshed) {
      setSelectedList(refreshed);
    }
  }, [giftLists, selectedList]);

  const handleDeleteList = async () => {
    if (listToDelete) {
      await deleteGiftList(listToDelete);
      setListToDelete(null);
      if (selectedList?.id === listToDelete) {
        setSelectedList(null);
      }
    }
  };

  const handleDeleteItem = async () => {
    if (itemToDelete) {
      await deleteItem(itemToDelete);
      setItemToDelete(null);
    }
  };

  const handleEditList = (list: GiftList) => {
    setListToEdit(list);
    setShowEditListDialog(true);
  };

  const handleUpdateList = async (data: {
    child_id: string;
    occasion_type: string;
    custom_occasion_name?: string;
    event_date?: string;
    allow_multiple_claims?: boolean;
  }) => {
    if (!listToEdit) return false;

    const success = await updateGiftList(listToEdit.id, {
      child_id: data.child_id,
      occasion_type: data.occasion_type,
      custom_occasion_name: data.custom_occasion_name ?? null,
      event_date: data.event_date ?? null,
      allow_multiple_claims: data.allow_multiple_claims ?? false,
    });

    if (success) {
      setShowEditListDialog(false);
      setListToEdit(null);
    }
    return success;
  };

  const handleEditItem = (item: GiftItem) => {
    setItemToEdit(item);
    setShowEditItemDialog(true);
  };

  const handleUpdateItem = async (data: {
    title: string;
    category?: string;
    suggested_age_range?: string;
    notes?: string;
    parent_only_notes?: string;
    link?: string;
  }) => {
    if (!itemToEdit) return false;

    const success = await updateItem(itemToEdit.id, {
      title: data.title,
      category: data.category ?? "other",
      suggested_age_range: data.suggested_age_range ?? null,
      notes: data.notes ?? null,
      parent_only_notes: data.parent_only_notes ?? null,
      link: data.link ?? null,
    });

    if (success) {
      setShowEditItemDialog(false);
      setItemToEdit(null);
    }
    return success;
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
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
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {selectedList && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedList(null)}
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              )}
              <div>
                <h1 className="text-2xl lg:text-3xl font-display font-bold flex items-center gap-2">
                  <Gift className="w-7 h-7 text-primary" />
                  {selectedList ? selectedList.child_name + "'s Gifts" : "Gift Lists"}
                </h1>
                <p className="text-muted-foreground mt-1">
                  {selectedList 
                    ? "Coordinate gifts to avoid duplicates"
                    : "Organize and coordinate gifts for your children"}
                </p>
              </div>
            </div>
            {isParent && !selectedList && (
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                New Gift List
              </Button>
            )}
            {selectedList && isParent && (
              <Button onClick={() => setShowAddItemDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Gift
              </Button>
            )}
          </div>
        </motion.div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {!selectedList ? (
            // Gift Lists View
            <motion.div
              key="lists"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {giftLists.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-16"
                >
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
                    <Sparkles className="w-10 h-10 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">No gift lists yet</h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    Create a gift list for birthdays, holidays, or other occasions to coordinate 
                    gifts and avoid duplicates.
                  </p>
                  {isParent && (
                    <Button onClick={() => setShowCreateDialog(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Create First Gift List
                    </Button>
                  )}
                </motion.div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {giftLists.map((list) => (
                    <GiftListCard
                      key={list.id}
                      list={list}
                      isParent={isParent}
                      onClick={() => setSelectedList(list)}
                      onEdit={() => handleEditList(list)}
                      onDelete={() => setListToDelete(list.id)}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          ) : (
            // Gift Items View
            <motion.div
              key="items"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {itemsLoading ? (
                <div className="flex items-center justify-center h-32">
                  <LoadingSpinner />
                </div>
              ) : items.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-16"
                >
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
                    <Gift className="w-10 h-10 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">No gifts yet</h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    Add gift ideas to this list so family members can claim them.
                  </p>
                  {isParent && (
                    <Button onClick={() => setShowAddItemDialog(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add First Gift
                    </Button>
                  )}
                </motion.div>
              ) : (
                <div className="space-y-3">
                  {items.map((item) => (
                    <GiftItemCard
                      key={item.id}
                      item={item}
                      isParent={isParentForItems}
                      profileId={profileIdForItems}
                      allowMultipleClaims={selectedList?.allow_multiple_claims || false}
                      onClaim={() => claimItem(item.id)}
                      onUnclaim={() => unclaimItem(item.id)}
                      onMarkPurchased={(purchased) => markPurchased(item.id, purchased)}
                      onEdit={() => handleEditItem(item)}
                      onDelete={() => setItemToDelete(item.id)}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Create Gift List Dialog */}
      <CreateGiftListDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        children={children}
        onSubmit={createGiftList}
      />

      {/* Edit Gift List Dialog */}
      <CreateGiftListDialog
        open={showEditListDialog}
        onOpenChange={(open) => {
          setShowEditListDialog(open);
          if (!open) setListToEdit(null);
        }}
        mode="edit"
        initialData={listToEdit}
        children={children}
        onSubmit={handleUpdateList}
      />

      {/* Add Gift Item Dialog */}
      <AddGiftItemDialog
        open={showAddItemDialog}
        onOpenChange={setShowAddItemDialog}
        isParent={isParent}
        onSubmit={addItem}
      />

      {/* Edit Gift Item Dialog */}
      <AddGiftItemDialog
        open={showEditItemDialog}
        onOpenChange={(open) => {
          setShowEditItemDialog(open);
          if (!open) setItemToEdit(null);
        }}
        mode="edit"
        initialData={itemToEdit}
        isParent={isParent}
        onSubmit={handleUpdateItem}
      />

      {/* Delete List Confirmation */}
      <AlertDialog open={!!listToDelete} onOpenChange={() => setListToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Gift List?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the gift list and all its items. 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteList} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Item Confirmation */}
      <AlertDialog open={!!itemToDelete} onOpenChange={() => setItemToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Gift?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the gift from the list. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteItem} className="bg-destructive text-destructive-foreground">
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default GiftsPage;
