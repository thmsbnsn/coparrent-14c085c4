import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { 
  getMutationKey, 
  acquireMutationLock, 
  releaseMutationLock 
} from '@/lib/mutations';

export type Difficulty = 'simple' | 'medium' | 'detailed';

export interface ColoringPage {
  id: string;
  user_id: string;
  document_id: string | null;
  prompt: string;
  difficulty: Difficulty;
  image_url: string | null;
  created_at: string;
}

interface GenerateResult {
  ok: boolean;
  imageUrl?: string;
  coloringPageId?: string;
  remaining?: number;
  code?: string;
  message?: string;
}

export const useColoringPages = () => {
  const { user } = useAuth();
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [currentPageId, setCurrentPageId] = useState<string | null>(null);
  const [errorState, setErrorState] = useState<{ code: string; message: string } | null>(null);

  const generateColoringPage = useCallback(async (
    prompt: string,
    difficulty: Difficulty
  ): Promise<boolean> => {
    if (!user) {
      toast.error('Please sign in to generate coloring pages');
      return false;
    }

    // Guard against double-submits
    const mutationKey = getMutationKey('generateColoringPage', prompt, difficulty);
    if (!acquireMutationLock(mutationKey)) {
      toast.error('Please wait, a coloring page is already being generated');
      return false;
    }

    setGenerating(true);
    setErrorState(null);
    setCurrentImage(null);
    setCurrentPageId(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Session expired. Please sign in again.');
        return false;
      }

      const response = await supabase.functions.invoke('generate-coloring-page', {
        body: { prompt, difficulty },
      });

      const result: GenerateResult = response.data;

      if (!result.ok) {
        // Handle specific error codes
        if (result.code === 'RATE_LIMITED') {
          setErrorState({ code: 'RATE_LIMITED', message: result.message || 'Daily limit reached' });
          toast.error(result.message || 'Daily coloring page limit reached');
          return false;
        }
        if (result.code === 'UNAUTHORIZED') {
          setErrorState({ code: 'UNAUTHORIZED', message: 'Please sign in to continue' });
          toast.error('Please sign in to continue');
          return false;
        }
        if (result.code === 'PREMIUM_REQUIRED' || result.code === 'ROLE_REQUIRED') {
          setErrorState({ code: result.code, message: result.message || 'Upgrade required' });
          toast.error(result.message || 'This feature requires a Power subscription');
          return false;
        }
        
        toast.error(result.message || 'Failed to generate coloring page');
        return false;
      }

      if (result.imageUrl) {
        setCurrentImage(result.imageUrl);
        setCurrentPageId(result.coloringPageId || null);
        toast.success('Coloring page created!');
        return true;
      }

      toast.error('No image was generated');
      return false;
    } catch (error) {
      console.error('Error generating coloring page:', error);
      toast.error('Failed to generate coloring page. Please try again.');
      return false;
    } finally {
      setGenerating(false);
      releaseMutationLock(mutationKey);
    }
  }, [user]);

  const saveToVault = useCallback(async (
    imageUrl: string,
    prompt: string,
    difficulty: Difficulty,
    coloringPageId?: string
  ): Promise<boolean> => {
    if (!user) {
      toast.error('Please sign in to save');
      return false;
    }

    const mutationKey = getMutationKey('saveColoringToVault', prompt, Date.now().toString());
    if (!acquireMutationLock(mutationKey)) {
      toast.error('Please wait...');
      return false;
    }

    setSaving(true);

    try {
      // Get user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) {
        toast.error('Profile not found');
        return false;
      }

      // Convert base64 to blob
      const base64Data = imageUrl.replace(/^data:image\/\w+;base64,/, '');
      const binaryData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
      const blob = new Blob([binaryData], { type: 'image/png' });

      // Generate unique filename
      const fileName = `coloring-${crypto.randomUUID()}.png`;
      const filePath = `${user.id}/${fileName}`;

      // Upload to documents bucket
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, blob, {
          contentType: 'image/png',
        });

      if (uploadError) throw uploadError;

      // Create document record with "creations" category
      const title = `Coloring Page: ${prompt.slice(0, 50)}${prompt.length > 50 ? '...' : ''}`;
      const description = `Generated coloring page (${difficulty} difficulty). Original prompt: "${prompt}"`;

      const { data: doc, error: docError } = await supabase
        .from('documents')
        .insert({
          title,
          description,
          file_path: filePath,
          file_name: `${prompt.slice(0, 30).replace(/[^a-zA-Z0-9]/g, '-')}-coloring-page.png`,
          file_type: 'image/png',
          file_size: blob.size,
          uploaded_by: profile.id,
          category: 'other', // Using 'other' as category, UI will show as "CoParrent Creations"
        })
        .select()
        .single();

      if (docError) throw docError;

      // Update coloring_pages record with document_id if we have it
      if (coloringPageId) {
        await supabase
          .from('coloring_pages')
          .update({ document_id: doc.id })
          .eq('id', coloringPageId);
      }

      // Log access
      await supabase.from('document_access_logs').insert({
        document_id: doc.id,
        accessed_by: profile.id,
        action: 'upload',
        user_agent: navigator.userAgent,
      });

      toast.success('Saved to Document Vault!');
      return true;
    } catch (error) {
      console.error('Error saving to vault:', error);
      toast.error('Failed to save to vault');
      return false;
    } finally {
      setSaving(false);
      releaseMutationLock(mutationKey);
    }
  }, [user]);

  const downloadPNG = useCallback((imageUrl: string, prompt: string) => {
    try {
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = `${prompt.slice(0, 30).replace(/[^a-zA-Z0-9]/g, '-')}-coloring-page.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('PNG downloaded!');
    } catch (error) {
      console.error('Error downloading PNG:', error);
      toast.error('Failed to download');
    }
  }, []);

  const clearCurrentImage = useCallback(() => {
    setCurrentImage(null);
    setCurrentPageId(null);
    setErrorState(null);
  }, []);

  return {
    generating,
    saving,
    currentImage,
    currentPageId,
    errorState,
    generateColoringPage,
    saveToVault,
    downloadPNG,
    clearCurrentImage,
  };
};
