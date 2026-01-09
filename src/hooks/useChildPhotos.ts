import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const BUCKET_NAME = "child-photos";
const URL_EXPIRY_SECONDS = 3600; // 1 hour

export interface ChildPhoto {
  id: string;
  child_id: string;
  uploaded_by: string;
  file_path: string;
  file_name: string;
  caption: string | null;
  taken_at: string | null;
  tags: string[];
  created_at: string;
  signedUrl?: string;
}

export const useChildPhotos = (childId: string | null) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [photos, setPhotos] = useState<ChildPhoto[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [userProfileId, setUserProfileId] = useState<string | null>(null);

  // Get user profile ID
  useEffect(() => {
    const fetchProfileId = async () => {
      if (!user?.id) return;
      const { data } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();
      if (data) setUserProfileId(data.id);
    };
    fetchProfileId();
  }, [user?.id]);

  // Fetch photos for a child
  const fetchPhotos = useCallback(async () => {
    if (!childId) {
      setPhotos([]);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("child_photos")
        .select("*")
        .eq("child_id", childId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching photos:", error);
        setPhotos([]);
        return;
      }

      // Get signed URLs for each photo
      const photosWithUrls = await Promise.all(
        (data || []).map(async (photo) => {
          const { data: signedData } = await supabase.storage
            .from(BUCKET_NAME)
            .createSignedUrl(photo.file_path, URL_EXPIRY_SECONDS);
          return {
            ...photo,
            signedUrl: signedData?.signedUrl,
          };
        })
      );

      setPhotos(photosWithUrls);
    } catch (error) {
      console.error("Error fetching photos:", error);
      setPhotos([]);
    } finally {
      setLoading(false);
    }
  }, [childId]);

  // Initial fetch
  useEffect(() => {
    fetchPhotos();
  }, [fetchPhotos]);

  // Upload a photo
  const uploadPhoto = useCallback(
    async (file: File, caption?: string, takenAt?: string, tags?: string[]): Promise<boolean> => {
      if (!childId || !userProfileId) {
        toast({
          title: "Error",
          description: "Unable to upload photo. Please try again.",
          variant: "destructive",
        });
        return false;
      }

      // Validate file type
      const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
      if (!validTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: "Please upload a JPG, PNG, WebP, or GIF image",
          variant: "destructive",
        });
        return false;
      }

      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please upload an image under 10MB",
          variant: "destructive",
        });
        return false;
      }

      setUploading(true);

      try {
        // Generate unique filename
        const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
        const filePath = `${childId}/${fileName}`;

        // Upload to storage
        const { error: uploadError } = await supabase.storage
          .from(BUCKET_NAME)
          .upload(filePath, file, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) {
          console.error("Error uploading photo:", uploadError);
          toast({
            title: "Upload failed",
            description: "Could not upload the photo. Please try again.",
            variant: "destructive",
          });
          return false;
        }

        // Create database record
        const { error: dbError } = await supabase.from("child_photos").insert({
          child_id: childId,
          uploaded_by: userProfileId,
          file_path: filePath,
          file_name: file.name,
          caption: caption || null,
          taken_at: takenAt || null,
          tags: tags || [],
        });

        if (dbError) {
          console.error("Error creating photo record:", dbError);
          // Clean up uploaded file
          await supabase.storage.from(BUCKET_NAME).remove([filePath]);
          toast({
            title: "Upload failed",
            description: "Could not save photo details. Please try again.",
            variant: "destructive",
          });
          return false;
        }

        toast({
          title: "Photo uploaded",
          description: "The photo has been added to the gallery",
        });

        // Refresh photos
        await fetchPhotos();
        return true;
      } catch (error) {
        console.error("Error uploading photo:", error);
        toast({
          title: "Upload failed",
          description: "An unexpected error occurred",
          variant: "destructive",
        });
        return false;
      } finally {
        setUploading(false);
      }
    },
    [childId, userProfileId, toast, fetchPhotos]
  );

  // Delete a photo
  const deletePhoto = useCallback(
    async (photoId: string, filePath: string): Promise<boolean> => {
      try {
        // Delete from storage
        const { error: storageError } = await supabase.storage
          .from(BUCKET_NAME)
          .remove([filePath]);

        if (storageError) {
          console.error("Error deleting from storage:", storageError);
        }

        // Delete from database
        const { error: dbError } = await supabase
          .from("child_photos")
          .delete()
          .eq("id", photoId);

        if (dbError) {
          console.error("Error deleting photo record:", dbError);
          toast({
            title: "Delete failed",
            description: "Could not delete the photo. Please try again.",
            variant: "destructive",
          });
          return false;
        }

        toast({
          title: "Photo deleted",
          description: "The photo has been removed from the gallery",
        });

        // Refresh photos
        await fetchPhotos();
        return true;
      } catch (error) {
        console.error("Error deleting photo:", error);
        toast({
          title: "Delete failed",
          description: "An unexpected error occurred",
          variant: "destructive",
        });
        return false;
      }
    },
    [toast, fetchPhotos]
  );

  // Update photo caption
  const updateCaption = useCallback(
    async (photoId: string, caption: string): Promise<boolean> => {
      try {
        const { error } = await supabase
          .from("child_photos")
          .update({ caption })
          .eq("id", photoId);

        if (error) {
          console.error("Error updating caption:", error);
          toast({
            title: "Update failed",
            description: "Could not update the caption. Please try again.",
            variant: "destructive",
          });
          return false;
        }

        // Update local state
        setPhotos((prev) =>
          prev.map((p) => (p.id === photoId ? { ...p, caption } : p))
        );

        return true;
      } catch (error) {
        console.error("Error updating caption:", error);
        return false;
      }
    },
    [toast]
  );

  // Update photo tags
  const updateTags = useCallback(
    async (photoId: string, tags: string[]): Promise<boolean> => {
      try {
        const { error } = await supabase
          .from("child_photos")
          .update({ tags })
          .eq("id", photoId);

        if (error) {
          console.error("Error updating tags:", error);
          toast({
            title: "Update failed",
            description: "Could not update the tags. Please try again.",
            variant: "destructive",
          });
          return false;
        }

        // Update local state
        setPhotos((prev) =>
          prev.map((p) => (p.id === photoId ? { ...p, tags } : p))
        );

        return true;
      } catch (error) {
        console.error("Error updating tags:", error);
        return false;
      }
    },
    [toast]
  );

  return {
    photos,
    loading,
    uploading,
    uploadPhoto,
    deletePhoto,
    updateCaption,
    updateTags,
    refetch: fetchPhotos,
  };
};
