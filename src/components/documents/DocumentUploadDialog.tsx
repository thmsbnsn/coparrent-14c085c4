import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, FileText } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DOCUMENT_CATEGORIES } from '@/hooks/useDocuments';
import { useChildren } from '@/hooks/useChildren';

interface DocumentUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpload: (
    file: File,
    title: string,
    description: string,
    category: string,
    childId?: string
  ) => Promise<any>;
  uploading: boolean;
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const DocumentUploadDialog = ({
  open,
  onOpenChange,
  onUpload,
  uploading,
}: DocumentUploadDialogProps) => {
  const { children } = useChildren();
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('other');
  const [childId, setChildId] = useState<string>('');

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];
      setFile(selectedFile);
      if (!title) {
        setTitle(selectedFile.name.replace(/\.[^/.]+$/, ''));
      }
    }
  }, [title]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    maxSize: 20 * 1024 * 1024, // 20MB
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title || !category) return;

    const result = await onUpload(
      file,
      title,
      description,
      category,
      childId || undefined
    );

    if (result) {
      setFile(null);
      setTitle('');
      setDescription('');
      setCategory('other');
      setChildId('');
      onOpenChange(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setTitle('');
    setDescription('');
    setCategory('other');
    setChildId('');
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) resetForm();
      onOpenChange(isOpen);
    }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display">Upload Document</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Dropzone */}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
              isDragActive
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50'
            }`}
          >
            <input {...getInputProps()} />
            {file ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="w-8 h-8 text-primary" />
                  <div className="text-left">
                    <p className="font-medium truncate max-w-[200px]">{file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFile(null);
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <>
                <Upload className="w-10 h-10 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  {isDragActive
                    ? 'Drop the file here'
                    : 'Drag and drop a file, or click to select'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  PDF, Word, Excel, or images up to 20MB
                </p>
              </>
            )}
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Document Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Custody Agreement 2024"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional notes about this document"
              rows={2}
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label>Category *</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DOCUMENT_CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Associated Child */}
          {children.length > 0 && (
            <div className="space-y-2">
              <Label>Associated Child</Label>
              <Select value={childId} onValueChange={setChildId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a child (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {children.map((child) => (
                    <SelectItem key={child.id} value={child.id}>
                      {child.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={!file || !title || uploading}
            >
              {uploading ? 'Uploading...' : 'Upload'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
