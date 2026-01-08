'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';

import {
  createCssFile,
  deleteIcon,
  getCssFiles,
  saveIcon,
} from '@actions/icons';
import { sanitizeClassName } from '@actions/icons/utils';
import {
  AlertCircle,
  Check,
  Copy,
  FileCode,
  Filter,
  Plus,
  Search,
  Trash2,
  Upload,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface IconData {
  className: string;
  type: 'svg' | 'background';
  file: string;
}

const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  } catch (error) {
    console.error(error);
    toast.error('Failed to copy');
  }
};

export default function CreateIcon() {
  const [svg, setSvg] = useState('');
  const [className, setClassName] = useState('');
  const [sanitizedPreview, setSanitizedPreview] = useState('');
  const [displayType, setDisplayType] = useState<'svg' | 'background'>('svg');
  const [icons, setIcons] = useState<IconData[]>([]);
  const [cssFiles, setCssFiles] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState('');
  const [newFileName, setNewFileName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const [filterType, setFilterType] = useState<'all' | 'svg' | 'background'>(
    'all'
  );

  const [filterFile, setFilterFile] = useState<string>('all');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadCssFiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Auto-generate sanitized preview
    if (className) {
      setSanitizedPreview(sanitizeClassName(className));
    } else {
      setSanitizedPreview('');
    }
  }, [className]);

  const loadCssFiles = async () => {
    const files = await getCssFiles();

    setCssFiles(files);

    if (files.length > 0 && !selectedFile) {
      setSelectedFile(files[0]);
    }

    loadAllIcons(files);
  };

  const loadAllIcons = async (files: string[]) => {
    const allIcons: IconData[] = [];

    for (const file of files) {
      const fileIcons = await loadIconsFromFile(file);

      allIcons.push(...fileIcons);
    }

    setIcons(allIcons);
  };

  const loadIconsFromFile = async (fileName: string): Promise<IconData[]> => {
    try {
      const response = await fetch(`/${fileName}`);
      const css = await response.text();
      const iconRegex = /\/\*\s*([\w-]+)[^*]*\*\/\s*\.([\w-]+)\s*{([^}]*)}/g;
      let match;
      const loadedIcons: IconData[] = [];

      while ((match = iconRegex.exec(css)) !== null) {
        const [, , className, styles] = match;
        const type = styles.includes('mask-image') ? 'svg' : 'background';

        loadedIcons.push({ className, type, file: fileName });
      }

      return loadedIcons;
    } catch (error) {
      console.error(`Error loading icons from ${fileName}:`, error);

      return [];
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.name.endsWith('.svg')) {
      toast.error('Please upload an SVG file');

      return;
    }

    const reader = new FileReader();

    reader.onload = (event) => {
      const content = event.target?.result as string;

      setSvg(content);

      // Auto-generate class name from filename
      const fileName = file.name.replace('.svg', '');
      const autoClassName = fileName.toLowerCase().replace(/[^a-z0-9]/g, '-');

      setClassName(autoClassName);
      toast.success('SVG file loaded successfully!');
    };

    reader.onerror = () => {
      toast.error('Failed to read file');
    };

    reader.readAsText(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!svg.trim()) {
      toast.error('SVG data is required');

      return;
    }

    if (!className.trim()) {
      toast.error('Class name is required');

      return;
    }

    if (!selectedFile) {
      toast.error('Please select a CSS file');

      return;
    }

    if (isSubmitting) return; // Prevent double submission

    setIsSubmitting(true);

    const formData = new FormData();

    formData.append('svg', svg);
    formData.append('className', className);
    formData.append('displayType', displayType);
    formData.append('fileName', selectedFile);

    try {
      const result = await saveIcon(formData);

      if (result.success) {
        toast.success(result.message);

        // Clear form
        setSvg('');
        setClassName('');
        setSanitizedPreview('');

        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }

        // Reload icons from CSS file (single source of truth)
        await loadCssFiles();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('An error occurred while saving the icon');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateFile = async () => {
    if (!newFileName.trim()) {
      toast.error('File name is required');

      return;
    }

    try {
      const result = await createCssFile(newFileName);

      if (result.success) {
        toast.success(result.message);
        setNewFileName('');
        setIsDialogOpen(false);

        // Reload CSS files list
        await loadCssFiles();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('An error occurred while creating the file');
      console.error(error);
    }
  };

  const handleDeleteIcon = async (icon: IconData) => {
    if (!confirm(`Delete "${icon.className}"?`)) return;

    const formData = new FormData();

    formData.append('className', icon.className);
    formData.append('fileName', icon.file);

    try {
      const result = await deleteIcon(formData);

      if (result.success) {
        toast.success(result.message);

        // Reload icons from CSS file (single source of truth)
        await loadCssFiles();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('An error occurred while deleting the icon');
      console.error(error);
    }
  };

  const filteredIcons = useMemo(
    () =>
      icons.filter((icon) => {
        const matchesSearch = icon.className
          .toLowerCase()
          .includes(searchQuery.toLowerCase());

        const matchesType = filterType === 'all' || icon.type === filterType;
        const matchesFile = filterFile === 'all' || icon.file === filterFile;

        return matchesSearch && matchesType && matchesFile;
      }),
    [icons, searchQuery, filterType, filterFile]
  );

  const uniqueFiles = useMemo(
    () => ['all', ...Array.from(new Set(icons.map((icon) => icon.file)))],
    [icons]
  );

  return (
    <div className="container mx-auto space-y-6 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Custom Icon Creator</h1>
          <p className="text-muted-foreground mt-1">
            Convert SVG files into reusable CSS icon classes
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          {icons.length} {icons.length === 1 ? 'Icon' : 'Icons'}
        </Badge>
      </div>

      {/* Create Icon Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileCode className="h-5 w-5" />
            Create New Icon
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Left Column */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="svg" className="flex items-center gap-2">
                    SVG Data
                    {svg && <Check className="h-4 w-4 text-green-500" />}
                  </Label>
                  <Textarea
                    id="svg"
                    value={svg}
                    onChange={(e) => setSvg(e.target.value)}
                    placeholder="Paste your SVG code here or upload a file below"
                    required
                    className="min-h-[200px] font-mono text-sm"
                  />
                  <div className="flex items-center gap-2">
                    <Input
                      ref={fileInputRef}
                      type="file"
                      accept=".svg"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full"
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Upload SVG File
                    </Button>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="className">Icon Class Name</Label>
                  <Input
                    type="text"
                    id="className"
                    value={className}
                    onChange={(e) => setClassName(e.target.value)}
                    placeholder="e.g., user-profile, shopping-cart"
                    required
                  />
                  {sanitizedPreview && (
                    <div className="flex items-start gap-2 rounded-md bg-blue-50 p-3 text-sm">
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
                      <div>
                        <p className="font-medium text-blue-900">
                          Will be saved as:
                        </p>
                        <code className="text-blue-700">
                          {sanitizedPreview}
                        </code>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Display Type</Label>
                  <RadioGroup
                    value={displayType}
                    onValueChange={(value) =>
                      setDisplayType(value as 'svg' | 'background')
                    }
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="svg" id="svg-radio" />
                      <Label htmlFor="svg-radio" className="font-normal">
                        SVG (Mask) - Inherits text color
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem
                        value="background"
                        id="background-radio"
                      />
                      <Label htmlFor="background-radio" className="font-normal">
                        Background Image - Original colors
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label>Target CSS File</Label>
                  <div className="flex gap-2">
                    <Select
                      onValueChange={setSelectedFile}
                      value={selectedFile}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Select a file" />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        {cssFiles.map((file) => (
                          <SelectItem key={file} value={file}>
                            {file}
                            {file === 'custom-icons.css' && (
                              <Badge variant="outline" className="ml-2">
                                Default
                              </Badge>
                            )}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="icon">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-white">
                        <DialogHeader>
                          <DialogTitle>Create New CSS File</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label>File Name</Label>
                            <Input
                              value={newFileName}
                              onChange={(e) => setNewFileName(e.target.value)}
                              placeholder="e.g., custom-icons, brand-icons"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleCreateFile();
                                }
                              }}
                            />
                            <p className="text-muted-foreground text-xs">
                              .css extension will be added automatically
                            </p>
                          </div>
                          <Button
                            className="w-full bg-blue-500 text-white hover:bg-blue-600"
                            onClick={handleCreateFile}
                          >
                            Create File
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>

                {/* Preview */}
                {svg && (
                  <div className="space-y-2">
                    <Label>Preview</Label>
                    <div className="flex items-center justify-center rounded-md border-2 border-dashed p-6">
                      <div
                        dangerouslySetInnerHTML={{ __html: svg }}
                        className="h-12 w-12"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-500 text-white hover:bg-blue-600"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save Icon'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Icons Library */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="flex items-center gap-2">
              Icon Library
              <Badge variant="secondary">{filteredIcons.length}</Badge>
            </CardTitle>

            {/* Search and Filters */}
            <div className="flex flex-wrap gap-2">
              <div className="relative flex-1 sm:w-64">
                <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                <Input
                  type="text"
                  placeholder="Search icons..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select
                value={filterType}
                onValueChange={(v: any) => setFilterType(v)}
              >
                <SelectTrigger className="w-[140px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="svg">SVG</SelectItem>
                  <SelectItem value="background">Background</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterFile} onValueChange={setFilterFile}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {uniqueFiles.map((file) => (
                    <SelectItem key={file} value={file}>
                      {file === 'all' ? 'All Files' : file}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredIcons.length === 0 ? (
            <div className="text-muted-foreground py-12 text-center">
              <FileCode className="mx-auto mb-4 h-12 w-12 opacity-50" />
              <p className="text-lg font-medium">No icons found</p>
              <p className="text-sm">
                {searchQuery || filterType !== 'all' || filterFile !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Create your first icon above'}
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {filteredIcons.map((icon, index) => (
                <div
                  key={`${icon.className}-${index}`}
                  className="group relative flex flex-col items-center rounded-lg border p-4 transition-all hover:border-blue-300 hover:shadow-md"
                >
                  <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-md bg-gray-50">
                    <i
                      className={`${icon.className} h-10 w-10 ${
                        icon.type === 'svg' ? 'text-gray-900' : ''
                      }`}
                    />
                  </div>

                  <div className="mb-2 flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {icon.type}
                    </Badge>
                  </div>

                  <button
                    onClick={() => copyToClipboard(icon.className)}
                    className="mb-1 flex items-center gap-1 text-xs font-medium transition-colors hover:text-blue-600"
                    title="Click to copy"
                  >
                    <span className="max-w-[150px] truncate">
                      {icon.className}
                    </span>
                    <Copy className="h-3 w-3" />
                  </button>

                  <p className="text-muted-foreground text-xs">{icon.file}</p>

                  {/* Delete button */}
                  <button
                    onClick={() => handleDeleteIcon(icon)}
                    className="absolute top-2 right-2 rounded-md p-1.5 text-gray-400 opacity-0 transition-all group-hover:opacity-100 hover:bg-red-50 hover:text-red-600"
                    title="Delete icon"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
