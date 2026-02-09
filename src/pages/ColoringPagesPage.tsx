import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Sparkles, Palette, Download, FileText, Printer, Save, AlertCircle, Info, History, FolderOpen, Wand2, Mountain, Star, Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PremiumFeatureGate } from "@/components/premium/PremiumFeatureGate";
import { useColoringPages, type Difficulty } from "@/hooks/useColoringPages";
import { ColoringPageGallery } from "@/components/coloring-pages/ColoringPageGallery";
import { exportColoringPagePDF, printColoringPage } from "@/lib/coloringPageExport";
import { toast } from "sonner";

const EXAMPLE_PROMPTS = [
  "A friendly dragon playing with butterflies",
  "Underwater ocean scene with fish and coral",
  "Magical forest with fairies and mushrooms",
  "Space rocket flying past planets and stars",
  "Farm animals having a picnic",
  "Princess castle with rainbow and clouds",
  "Dinosaurs playing soccer in a park",
  "A treehouse village with bridges and slides",
];

const DIFFICULTY_INFO = {
  simple: { label: "Simple", ages: "Ages 3-5", description: "Bold outlines, simple shapes" },
  medium: { label: "Medium", ages: "Ages 5-8", description: "Moderate detail, clear elements" },
  detailed: { label: "Detailed", ages: "Ages 8+", description: "Intricate patterns, fine details" },
};

const ART_STYLES = [
  { value: "cartoon", label: "Cartoon", description: "Fun, rounded cartoon style" },
  { value: "whimsical", label: "Whimsical", description: "Dreamy, fantastical art" },
  { value: "realistic", label: "Realistic", description: "Lifelike proportions" },
  { value: "chibi", label: "Chibi/Kawaii", description: "Cute, oversized heads" },
  { value: "storybook", label: "Storybook", description: "Classic illustration style" },
  { value: "zentangle", label: "Zentangle", description: "Pattern-filled shapes" },
  { value: "mandala", label: "Mandala", description: "Circular geometric patterns" },
  { value: "pixel", label: "Pixel Art", description: "Blocky, retro game style" },
];

const SCENE_BACKGROUNDS = [
  { value: "none", label: "No Background" },
  { value: "nature", label: "Nature & Outdoors" },
  { value: "underwater", label: "Underwater World" },
  { value: "space", label: "Outer Space" },
  { value: "city", label: "Cityscape" },
  { value: "fantasy", label: "Fantasy Kingdom" },
  { value: "seasonal", label: "Seasonal / Holiday" },
];

const MOOD_THEMES = [
  { value: "none", label: "Any Mood" },
  { value: "playful", label: "Playful & Fun" },
  { value: "calm", label: "Calm & Soothing" },
  { value: "adventurous", label: "Adventurous" },
  { value: "magical", label: "Magical & Enchanting" },
  { value: "educational", label: "Educational" },
];

const ColoringPagesContent = () => {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [artStyle, setArtStyle] = useState("cartoon");
  const [sceneBackground, setSceneBackground] = useState("none");
  const [moodTheme, setMoodTheme] = useState("none");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [activeTab, setActiveTab] = useState<"create" | "history">("create");
  const {
    generating,
    saving,
    currentImage,
    currentPageId,
    errorState,
    history,
    loadingHistory,
    generateColoringPage,
    saveToVault,
    saveToCreations,
    downloadPNG,
    clearCurrentImage,
  } = useColoringPages();

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a description for your coloring page");
      return;
    }
    // Build enhanced prompt with creative options
    const enhancedPrompt = buildEnhancedPrompt(prompt, artStyle, sceneBackground, moodTheme);
    await generateColoringPage(enhancedPrompt, difficulty);
  };

  const handleExampleClick = (example: string) => {
    setPrompt(example);
  };

  const handleExportPDF = async () => {
    if (!currentImage) return;
    try {
      await exportColoringPagePDF(currentImage, prompt);
      toast.success("PDF exported!");
    } catch (error) {
      console.error("PDF export error:", error);
      toast.error("Failed to export PDF");
    }
  };

  const handlePrint = () => {
    if (!currentImage) return;
    try {
      printColoringPage(currentImage, prompt);
    } catch (error) {
      console.error("Print error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to print");
    }
  };

  const handleSaveToVault = async () => {
    if (!currentImage) return;
    await saveToVault(currentImage, prompt, difficulty, currentPageId || undefined);
  };

  const handleSaveToCreations = async () => {
    if (!currentImage) return;
    await saveToCreations(currentImage, prompt, difficulty);
  };

  const handleNewPage = () => {
    clearCurrentImage();
    setPrompt("");
  };

  const handleSurpriseMe = () => {
    const randomPrompt = EXAMPLE_PROMPTS[Math.floor(Math.random() * EXAMPLE_PROMPTS.length)];
    const randomStyle = ART_STYLES[Math.floor(Math.random() * ART_STYLES.length)];
    setPrompt(randomPrompt);
    setArtStyle(randomStyle.value);
    setShowAdvanced(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/dashboard/kids-hub")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">Coloring Page Creator</h1>
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              <Sparkles className="h-3 w-3 mr-1" />
              AI-Powered
            </Badge>
          </div>
          <p className="text-muted-foreground">
            Generate custom coloring pages with creative styles and themes
          </p>
        </div>
      </div>

      {/* Error State */}
      {errorState && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>
            {errorState.code === "RATE_LIMITED" ? "Daily Limit Reached" : "Error"}
          </AlertTitle>
          <AlertDescription>{errorState.message}</AlertDescription>
        </Alert>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "create" | "history")}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="create" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Create
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            History
            {history.length > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                {history.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="mt-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Creation Panel */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5 text-primary" />
                  Design Your Coloring Page
                </CardTitle>
                <CardDescription>
                  Describe your scene, choose a style, and let AI create it
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* Prompt Input */}
                <div className="space-y-2">
                  <Label htmlFor="prompt">What should the coloring page show?</Label>
                  <div className="flex gap-2">
                    <Input
                      id="prompt"
                      placeholder="e.g., A friendly unicorn in a garden of flowers"
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      disabled={generating}
                      onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleSurpriseMe}
                      disabled={generating}
                      title="Surprise Me!"
                      className="shrink-0"
                    >
                      <Wand2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Example Prompts */}
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Try these ideas:</Label>
                  <div className="flex flex-wrap gap-1.5">
                    {EXAMPLE_PROMPTS.map((example, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        className="text-xs h-7"
                        onClick={() => handleExampleClick(example)}
                        disabled={generating}
                      >
                        {example.length > 30 ? example.slice(0, 30) + "..." : example}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Difficulty Toggle */}
                <div className="space-y-3">
                  <Label>Difficulty Level</Label>
                  <ToggleGroup
                    type="single"
                    value={difficulty}
                    onValueChange={(value) => value && setDifficulty(value as Difficulty)}
                    className="justify-start"
                    disabled={generating}
                  >
                    {(Object.keys(DIFFICULTY_INFO) as Difficulty[]).map((level) => (
                      <ToggleGroupItem
                        key={level}
                        value={level}
                        className="flex-col h-auto py-2 px-4"
                      >
                        <span className="font-medium">{DIFFICULTY_INFO[level].label}</span>
                        <span className="text-[10px] text-muted-foreground">
                          {DIFFICULTY_INFO[level].ages}
                        </span>
                      </ToggleGroupItem>
                    ))}
                  </ToggleGroup>
                  <p className="text-xs text-muted-foreground">
                    {DIFFICULTY_INFO[difficulty].description}
                  </p>
                </div>

                {/* Art Style Selection */}
                <div className="space-y-2">
                  <Label>Art Style</Label>
                  <Select value={artStyle} onValueChange={setArtStyle} disabled={generating}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ART_STYLES.map((style) => (
                        <SelectItem key={style.value} value={style.value}>
                          <div className="flex flex-col">
                            <span>{style.label}</span>
                            <span className="text-xs text-muted-foreground">{style.description}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Advanced Options Toggle */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-muted-foreground"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                >
                  <Star className="h-3.5 w-3.5 mr-1.5" />
                  {showAdvanced ? "Hide" : "Show"} Creative Options
                </Button>

                {/* Advanced Creative Options */}
                <AnimatePresence>
                  {showAdvanced && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="space-y-4 overflow-hidden"
                    >
                      {/* Scene Background */}
                      <div className="space-y-2">
                        <Label className="flex items-center gap-1.5">
                          <Mountain className="h-3.5 w-3.5" />
                          Scene Background
                        </Label>
                        <Select value={sceneBackground} onValueChange={setSceneBackground} disabled={generating}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {SCENE_BACKGROUNDS.map((bg) => (
                              <SelectItem key={bg.value} value={bg.value}>
                                {bg.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Mood / Theme */}
                      <div className="space-y-2">
                        <Label className="flex items-center gap-1.5">
                          <Heart className="h-3.5 w-3.5" />
                          Mood & Theme
                        </Label>
                        <Select value={moodTheme} onValueChange={setMoodTheme} disabled={generating}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {MOOD_THEMES.map((mood) => (
                              <SelectItem key={mood.value} value={mood.value}>
                                {mood.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Generate Button */}
                <Button
                  onClick={handleGenerate}
                  disabled={generating || !prompt.trim()}
                  className="w-full"
                  size="lg"
                >
                  {generating ? (
                    <>
                      <Sparkles className="h-4 w-4 mr-2 animate-pulse" />
                      Creating Your Masterpiece...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate Coloring Page
                    </>
                  )}
                </Button>

                {/* Privacy Note */}
                <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg">
                  <Info className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                  <p className="text-xs text-muted-foreground">
                    Generated images are saved to your account. Save them to your Document Vault or Creations Library for sharing with family.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Preview Panel */}
            <Card>
              <CardHeader>
                <CardTitle>Preview</CardTitle>
                <CardDescription>
                  {currentImage ? "Your coloring page is ready!" : "Your coloring page will appear here"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="aspect-square bg-muted/30 rounded-lg border-2 border-dashed border-muted flex items-center justify-center overflow-hidden">
                  <AnimatePresence mode="wait">
                    {generating ? (
                      <motion.div
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-center p-4 w-full h-full flex flex-col items-center justify-center"
                      >
                        <Skeleton className="w-full h-full absolute inset-0" />
                        <div className="relative z-10 space-y-4">
                          <Palette className="h-12 w-12 text-primary mx-auto animate-pulse" />
                          <p className="text-sm text-muted-foreground">Creating your coloring page...</p>
                          <p className="text-xs text-muted-foreground">This may take a moment</p>
                        </div>
                      </motion.div>
                    ) : currentImage ? (
                      <motion.img
                        key="image"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        src={currentImage}
                        alt="Generated coloring page"
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <motion.div
                        key="empty"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-center p-4"
                      >
                        <Palette className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
                        <p className="text-sm text-muted-foreground">No coloring page yet</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Enter a description and click Generate
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Action Buttons */}
                {currentImage && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 space-y-3"
                  >
                    {/* Save Options */}
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        onClick={handleSaveToCreations}
                        disabled={saving}
                        variant="default"
                        className="gap-2"
                      >
                        <FolderOpen className="h-4 w-4" />
                        {saving ? "Saving..." : "Save to Library"}
                      </Button>
                      <Button
                        onClick={handleSaveToVault}
                        disabled={saving}
                        variant="outline"
                        className="gap-2"
                      >
                        <Save className="h-4 w-4" />
                        Save to Vault
                      </Button>
                    </div>

                    {/* Export Options */}
                    <div className="grid grid-cols-3 gap-2">
                      <Button
                        variant="outline"
                        onClick={() => downloadPNG(currentImage, prompt)}
                        className="flex-col h-auto py-3"
                      >
                        <Download className="h-4 w-4 mb-1" />
                        <span className="text-xs">PNG</span>
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleExportPDF}
                        className="flex-col h-auto py-3"
                      >
                        <FileText className="h-4 w-4 mb-1" />
                        <span className="text-xs">PDF</span>
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handlePrint}
                        className="flex-col h-auto py-3"
                      >
                        <Printer className="h-4 w-4 mb-1" />
                        <span className="text-xs">Print</span>
                      </Button>
                    </div>

                    {/* New Page Button */}
                    <Button
                      variant="ghost"
                      onClick={handleNewPage}
                      className="w-full text-muted-foreground"
                    >
                      Create New Page
                    </Button>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Tips Card */}
          <Card className="bg-muted/50 border-dashed">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Sparkles className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">Tips for Amazing Results</h3>
                  <ul className="text-sm text-muted-foreground mt-1 space-y-1 list-disc list-inside">
                    <li>Be specific — "a cat sleeping on a bookshelf" works better than just "cat"</li>
                    <li>Try different art styles — Zentangle and Mandala are great for older kids</li>
                    <li>Combine a mood with a background for richer scenes</li>
                    <li>Use "Surprise Me" when you need inspiration!</li>
                    <li>Save favorites to your Creations Library for easy re-printing</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5 text-primary" />
                Your Coloring Pages
              </CardTitle>
              <CardDescription>
                Browse and re-download your previously generated coloring pages
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ColoringPageGallery
                pages={history}
                loading={loadingHistory}
                onDownloadPNG={downloadPNG}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

/**
 * Build an enhanced prompt by combining user input with creative options.
 * The art style, background, and mood modifiers are appended as natural-language
 * directives that the image model understands.
 */
function buildEnhancedPrompt(
  basePrompt: string,
  artStyle: string,
  sceneBackground: string,
  moodTheme: string
): string {
  const parts = [basePrompt.trim()];

  // Art style modifiers
  const styleMap: Record<string, string> = {
    cartoon: "in a fun, rounded cartoon illustration style",
    whimsical: "in a dreamy, whimsical fairy-tale illustration style",
    realistic: "in a realistic, lifelike illustration style with accurate proportions",
    chibi: "in an adorable chibi/kawaii style with oversized heads and expressive eyes",
    storybook: "in a classic children's storybook illustration style",
    zentangle: "filled with intricate zentangle patterns inside the shapes",
    mandala: "arranged in a circular mandala pattern with geometric symmetry",
    pixel: "in a retro pixel art style with blocky, grid-based shapes",
  };
  if (styleMap[artStyle]) {
    parts.push(styleMap[artStyle]);
  }

  // Scene background
  const bgMap: Record<string, string> = {
    nature: "set in a lush natural outdoor scene with trees, flowers, and rolling hills",
    underwater: "set in an underwater ocean scene with bubbles, seaweed, and coral",
    space: "set in outer space with planets, stars, and cosmic swirls",
    city: "set against a city skyline with buildings and streets",
    fantasy: "set in a magical fantasy kingdom with castles and enchanted elements",
    seasonal: "with seasonal decorations and festive holiday elements",
  };
  if (bgMap[sceneBackground]) {
    parts.push(bgMap[sceneBackground]);
  }

  // Mood/theme
  const moodMap: Record<string, string> = {
    playful: "with a playful, energetic, joyful feeling",
    calm: "with a calm, serene, soothing atmosphere",
    adventurous: "with an exciting, adventurous action-filled scene",
    magical: "with magical sparkles, enchantment, and wonder",
    educational: "incorporating educational elements like letters, numbers, or shapes",
  };
  if (moodMap[moodTheme]) {
    parts.push(moodMap[moodTheme]);
  }

  return parts.join(", ");
}

const ColoringPagesPage = () => {
  return (
    <DashboardLayout>
      {/* All family members can access AI tools if family has Power subscription */}
      <PremiumFeatureGate featureName="Coloring Page Creator">
        <ColoringPagesContent />
      </PremiumFeatureGate>
    </DashboardLayout>
  );
};

export default ColoringPagesPage;
