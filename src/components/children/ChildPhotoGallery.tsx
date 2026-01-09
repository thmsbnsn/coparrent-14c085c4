import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Trash2, Image, Calendar, Download, Edit2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { useChildPhotos, ChildPhoto } from "@/hooks/useChildPhotos";
import { cn } from "@/lib/utils";

interface ChildPhotoGalleryProps {
  childId: string;
  childName: string;
}

export const ChildPhotoGallery = ({ childId, childName }: ChildPhotoGalleryProps) => {
  const { photos, loading, uploading, uploadPhoto, deletePhoto, updateCaption } = useChildPhotos(childId);
  
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<ChildPhoto | null>(null);
  const [photoToDelete, setPhotoToDelete] = useState<ChildPhoto | null>(null);
  const [editingCaption, setEditingCaption] = useState<string | null>(null);
  const [newCaption, setNewCaption] = useState("");
  
  // Upload form state
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadCaption, setUploadCaption] = useState("");
  const [uploadDate, setUploadDate] = useState("");
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadFile(file);
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => setUploadPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!uploadFile) return;
    
    const success = await uploadPhoto(uploadFile, uploadCaption, uploadDate);
    if (success) {
      setIsUploadOpen(false);
      resetUploadForm();
    }
  };

  const resetUploadForm = () => {
    setUploadFile(null);
    setUploadCaption("");
    setUploadDate("");
    setUploadPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDeleteConfirm = async () => {
    if (!photoToDelete) return;
    await deletePhoto(photoToDelete.id, photoToDelete.file_path);
    setPhotoToDelete(null);
    if (selectedPhoto?.id === photoToDelete.id) {
      setSelectedPhoto(null);
    }
  };

  const handleCaptionEdit = (photo: ChildPhoto) => {
    setEditingCaption(photo.id);
    setNewCaption(photo.caption || "");
  };

  const handleCaptionSave = async (photoId: string) => {
    await updateCaption(photoId, newCaption);
    setEditingCaption(null);
    setNewCaption("");
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="aspect-square rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with upload button */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {photos.length === 0
            ? "No photos yet. Add some memories!"
            : `${photos.length} photo${photos.length === 1 ? "" : "s"}`}
        </p>
        <Button size="sm" onClick={() => setIsUploadOpen(true)}>
          <Plus className="w-4 h-4 mr-1.5" />
          Add Photo
        </Button>
      </div>

      {/* Photo Grid */}
      {photos.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-10 gap-3">
            <div className="w-14 h-14 rounded-full bg-muted/50 flex items-center justify-center">
              <Image className="w-7 h-7 text-muted-foreground" />
            </div>
            <div className="text-center">
              <p className="font-medium">No photos yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Upload photos to share memories with your co-parent
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setIsUploadOpen(true)}>
              <Plus className="w-4 h-4 mr-1.5" />
              Upload First Photo
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          <AnimatePresence mode="popLayout">
            {photos.map((photo) => (
              <motion.button
                key={photo.id}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={() => setSelectedPhoto(photo)}
                className="relative aspect-square rounded-xl overflow-hidden bg-muted group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                {photo.signedUrl ? (
                  <img
                    src={photo.signedUrl}
                    alt={photo.caption || `Photo of ${childName}`}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Image className="w-8 h-8 text-muted-foreground" />
                  </div>
                )}
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                {photo.caption && (
                  <div className="absolute bottom-0 left-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-xs text-white truncate">{photo.caption}</p>
                  </div>
                )}
              </motion.button>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Upload Dialog */}
      <Dialog open={isUploadOpen} onOpenChange={(open) => {
        if (!open) resetUploadForm();
        setIsUploadOpen(open);
      }}>
        <DialogContent className="max-w-md mx-4 sm:mx-auto">
          <DialogHeader>
            <DialogTitle>Add Photo</DialogTitle>
            <DialogDescription>
              Upload a photo to {childName}'s gallery
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* File input */}
            <div className="space-y-2">
              <Label>Photo</Label>
              {uploadPreview ? (
                <div className="relative">
                  <img
                    src={uploadPreview}
                    alt="Preview"
                    className="w-full aspect-video object-cover rounded-lg"
                  />
                  <Button
                    size="icon"
                    variant="secondary"
                    className="absolute top-2 right-2 h-8 w-8"
                    onClick={resetUploadForm}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full aspect-video border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-2 hover:border-primary/50 hover:bg-muted/50 transition-colors"
                >
                  <Image className="w-8 h-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Click to select a photo</p>
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>

            {/* Caption */}
            <div className="space-y-2">
              <Label htmlFor="upload-caption">Caption (optional)</Label>
              <Input
                id="upload-caption"
                placeholder="Add a caption..."
                value={uploadCaption}
                onChange={(e) => setUploadCaption(e.target.value)}
              />
            </div>

            {/* Date taken */}
            <div className="space-y-2">
              <Label htmlFor="upload-date">Date taken (optional)</Label>
              <Input
                id="upload-date"
                type="date"
                value={uploadDate}
                onChange={(e) => setUploadDate(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setIsUploadOpen(false)} disabled={uploading}>
              Cancel
            </Button>
            <Button onClick={handleUpload} disabled={!uploadFile || uploading}>
              {uploading ? "Uploading..." : "Upload Photo"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Photo Viewer Dialog */}
      <Dialog open={!!selectedPhoto} onOpenChange={(open) => {
        if (!open) {
          setSelectedPhoto(null);
          setEditingCaption(null);
        }
      }}>
        <DialogContent className="max-w-3xl max-h-[90vh] p-0 overflow-hidden mx-4 sm:mx-auto">
          {selectedPhoto && (
            <div className="flex flex-col">
              {/* Image */}
              <div className="relative bg-black flex items-center justify-center min-h-[300px] max-h-[60vh]">
                {selectedPhoto.signedUrl ? (
                  <img
                    src={selectedPhoto.signedUrl}
                    alt={selectedPhoto.caption || `Photo of ${childName}`}
                    className="max-w-full max-h-[60vh] object-contain"
                  />
                ) : (
                  <div className="flex items-center justify-center h-64">
                    <Image className="w-12 h-12 text-muted-foreground" />
                  </div>
                )}
                {/* Close button */}
                <Button
                  size="icon"
                  variant="secondary"
                  className="absolute top-3 right-3"
                  onClick={() => setSelectedPhoto(null)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Details */}
              <div className="p-4 space-y-3">
                {/* Caption */}
                <div className="flex items-start gap-2">
                  {editingCaption === selectedPhoto.id ? (
                    <div className="flex-1 flex gap-2">
                      <Input
                        value={newCaption}
                        onChange={(e) => setNewCaption(e.target.value)}
                        placeholder="Add a caption..."
                        className="flex-1"
                        autoFocus
                      />
                      <Button size="icon" onClick={() => handleCaptionSave(selectedPhoto.id)}>
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button size="icon" variant="outline" onClick={() => setEditingCaption(null)}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <p className={cn(
                        "flex-1 text-sm",
                        !selectedPhoto.caption && "text-muted-foreground italic"
                      )}>
                        {selectedPhoto.caption || "No caption"}
                      </p>
                      <Button size="icon" variant="ghost" onClick={() => handleCaptionEdit(selectedPhoto)}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                </div>

                {/* Metadata */}
                <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                  {selectedPhoto.taken_at && (
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Taken {formatDate(selectedPhoto.taken_at)}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Uploaded {formatDate(selectedPhoto.created_at)}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  {selectedPhoto.signedUrl && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={selectedPhoto.signedUrl} download={selectedPhoto.file_name} target="_blank" rel="noopener noreferrer">
                        <Download className="w-4 h-4 mr-1.5" />
                        Download
                      </a>
                    </Button>
                  )}
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => setPhotoToDelete(selectedPhoto)}
                  >
                    <Trash2 className="w-4 h-4 mr-1.5" />
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!photoToDelete} onOpenChange={(open) => !open && setPhotoToDelete(null)}>
        <AlertDialogContent className="mx-4 sm:mx-auto">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Photo?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this photo from {childName}'s gallery. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete Photo
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
