import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  Wand2, 
  Upload, 
  Layers, 
  Music, 
  Sliders, 
  Share, 
  Play, 
  Pause, 
  Trash2, 
  Plus, 
  ChevronRight, 
  Check, 
  AlertCircle, 
  Film, 
  FileText, 
  Download, 
  Eye, 
  Volume2, 
  Clock, 
  Zap, 
  Video,
  Mic,
  Scissors,
  BookOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  VideoStyle, 
  AspectRatio, 
  StudioClip, 
  StudioProject, 
  UserProfile, 
  MusicTrack 
} from '../../types';
import { VIDEO_STYLES, CAMERA_MOTIONS, VOICES, LANGUAGES, MUSIC_LIBRARY } from '../../data/mockData';

interface StudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  initialPrompt?: string;
  initialStyle?: VideoStyle;
  onClipPublished: (newReel: any) => void;
  onCreditsUpdated: (newCredits: number) => void;
  onOpenCreditPlans: () => void;
}

export const StudioModal: React.FC<StudioModalProps> = ({
  isOpen,
  onClose,
  user,
  initialPrompt = '',
  initialStyle = 'Cinematic',
  onClipPublished,
  onCreditsUpdated,
  onOpenCreditPlans,
}) => {
  // Navigation inside studio
  const [activeStep, setActiveStep] = useState<'create' | 'story' | 'timeline' | 'edit' | 'publish'>('create');

  // Generation parameters
  const [prompt, setPrompt] = useState(initialPrompt);
  const [selectedStyle, setSelectedStyle] = useState<VideoStyle>(initialStyle);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('9:16');
  const [duration, setDuration] = useState<'5s' | '10s' | '15s'>('5s');
  const [cameraMotion, setCameraMotion] = useState(CAMERA_MOTIONS[0]);
  const [voice, setVoice] = useState(VOICES[0].id);
  const [language, setLanguage] = useState('en-US');
  const [referenceImage, setReferenceImage] = useState<string | null>(null);

  // AI Storytelling Engine (Urdu & Punjabi 5-Minute Project)
  const [storyTopic, setStoryTopic] = useState('The Clever Little Fox in Old Lahore / چالاک لومڑی');
  const [storyGenre, setStoryGenre] = useState('Cartoon Moral Tale');
  const [storyLanguage, setStoryLanguage] = useState('ur-PK');
  const [storyVoice, setStoryVoice] = useState('Zainab-Urdu');
  const [storyTargetMinutes, setStoryTargetMinutes] = useState(5);
  const [isGeneratingStory, setIsGeneratingStory] = useState(false);

  // AI Script Assistant State
  const [isEnhancingPrompt, setIsEnhancingPrompt] = useState(false);
  const [scriptModalOpen, setScriptModalOpen] = useState(false);
  const [generatedScript, setGeneratedScript] = useState<any>(null);
  const [isWritingScript, setIsWritingScript] = useState(false);

  // Generation status
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationTip, setGenerationTip] = useState('Initializing Gemini video neural pipeline...');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Studio Timeline Project
  const [project, setProject] = useState<StudioProject>({
    id: `proj-${Date.now()}`,
    title: 'Untitled AI Reel',
    clips: [],
    selectedMusicId: MUSIC_LIBRARY[0].id,
    musicVolume: 0.7,
    voiceVolume: 1.0,
    filter: 'normal',
    captionStyle: {
      color: '#ffffff',
      bgColor: 'rgba(0,0,0,0.7)',
      fontSize: 'medium',
      position: 'bottom',
    },
  });

  // Preview video player
  const [previewClipIndex, setPreviewClipIndex] = useState(0);
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(true);
  const previewVideoRef = useRef<HTMLVideoElement>(null);
  const previewAudioRef = useRef<HTMLAudioElement>(null);

  // Publish Form State
  const [publishTitle, setPublishTitle] = useState('');
  const [publishDesc, setPublishDesc] = useState('');
  const [publishPrivacy, setPublishPrivacy] = useState<'public' | 'followers' | 'private'>('public');
  const [publishAllowComments, setPublishAllowComments] = useState(true);
  const [isPublishing, setIsPublishing] = useState(false);

  // Reference image input ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync initial prompt if passed
  useEffect(() => {
    if (initialPrompt) {
      setPrompt(initialPrompt);
    }
    if (initialStyle) {
      setSelectedStyle(initialStyle);
    }
  }, [initialPrompt, initialStyle]);

  // Credit calculation
  const getCreditCost = () => {
    if (duration === '5s') return 10;
    if (duration === '10s') return 20;
    return 30;
  };

  const creditCost = getCreditCost();
  const hasEnoughCredits = user.credits >= creditCost;

  // Handle Reference Image Upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setReferenceImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Enhance prompt with Gemini
  const handleEnhancePrompt = async () => {
    if (!prompt.trim()) return;
    setIsEnhancingPrompt(true);
    try {
      const res = await fetch('/api/generate-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Enhance this visual prompt into an ultra-detailed, photorealistic cinematic scene description: "${prompt}"`,
          style: selectedStyle,
          duration,
        }),
      });
      const data = await res.json();
      if (data.script?.visualScenes?.[0]?.description) {
        setPrompt(data.script.visualScenes[0].description);
      } else if (data.script?.hook) {
        setPrompt(`${prompt}. ${data.script.hook}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsEnhancingPrompt(false);
    }
  };

  // Generate complete viral 3-scene script
  const handleGenerateScript = async () => {
    if (!prompt.trim()) return;
    setIsWritingScript(true);
    setScriptModalOpen(true);
    try {
      const res = await fetch('/api/generate-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          style: selectedStyle,
          duration,
        }),
      });
      const data = await res.json();
      if (data.script) {
        setGeneratedScript(data.script);
        if (data.script.title) setPublishTitle(data.script.title);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsWritingScript(false);
    }
  };

  // Apply script scenes to timeline
  const applyScriptScenes = () => {
    if (!generatedScript) return;
    if (generatedScript.title) {
      setPublishTitle(generatedScript.title);
    }
    if (generatedScript.visualScenes?.[0]?.description) {
      setPrompt(generatedScript.visualScenes[0].description);
    }
    setScriptModalOpen(false);
  };

  // Generate 5-Minute Multi-scene Storyboard in Urdu, Punjabi or English
  const handleGenerateStory = async () => {
    if (!storyTopic.trim()) {
      setErrorMsg('Please enter a topic or moral lesson for the story');
      return;
    }

    if (user.credits < 25) {
      setErrorMsg(`Insufficient credits for AI Storyboard project. Requires 25 credits, but you have ${user.credits}.`);
      return;
    }

    setErrorMsg(null);
    setIsGeneratingStory(true);

    try {
      const res = await fetch('/api/generate-story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: storyTopic,
          genre: storyGenre,
          language: storyLanguage,
          targetDurationMinutes: storyTargetMinutes,
          voice: storyVoice,
          style: selectedStyle,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate story');
      }

      if (typeof data.story.remainingCredits === 'number') {
        onCreditsUpdated(data.story.remainingCredits);
      }

      // Convert generated scenes into timeline clips
      const storyClips: StudioClip[] = data.story.scenes.map((sc: any, idx: number) => ({
        id: `story-clip-${Date.now()}-${idx}`,
        title: sc.title || `Scene ${idx + 1}`,
        prompt: sc.visualPrompt,
        style: selectedStyle,
        aspectRatio,
        duration: sc.durationSeconds || 12,
        videoUrl: sc.videoUrl || '/videos/cartoon.mp4',
        thumbnailUrl: sc.thumbnailUrl || 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80',
        captions: sc.captions,
        cameraMotion: sc.cameraMotion || 'Slow Cinematic Push-In',
        creditsUsed: Math.round(25 / data.story.scenes.length),
        createdAt: new Date().toISOString(),
        transitionToNext: 'fade',
      }));

      setProject((prev) => ({
        ...prev,
        title: data.story.titleBilingual || data.story.title,
        clips: storyClips,
        selectedMusicId: data.story.suggestedMusicId || 'm-6',
      }));

      setPublishTitle(data.story.titleBilingual || data.story.title);
      setPublishDesc(`${data.story.title} - ${data.story.moral} #AICartoon #${storyGenre.replace(/\s+/g, '')} #ReelTok`);

      // Switch to project timeline
      setActiveStep('timeline');
    } catch (err: any) {
      setErrorMsg(err.message || 'Story generation failed');
    } finally {
      setIsGeneratingStory(false);
    }
  };

  // Direct MP4 Download Handler
  const handleDownloadVideo = (videoUrl?: string, title?: string) => {
    const targetVideo = videoUrl || currentPreviewClip?.videoUrl || '/videos/cartoon.mp4';
    const targetTitle = title || project.title || 'ReelTok_AI_Video';
    window.location.href = `/api/download?file=${encodeURIComponent(targetVideo)}&title=${encodeURIComponent(targetTitle)}`;
  };

  // Generate AI Video Clip
  const handleGenerateVideo = async () => {
    if (!prompt.trim()) {
      setErrorMsg('Please enter a descriptive prompt for the AI Video');
      return;
    }

    if (!hasEnoughCredits) {
      setErrorMsg(`Insufficient credits. You need ${creditCost} credits, but have ${user.credits}.`);
      return;
    }

    setErrorMsg(null);
    setIsGenerating(true);
    setGenerationProgress(10);

    const tips = [
      'Synthesizing cinematic 3D perspective with Gemini...',
      'Applying camera motion physics and volumetric lighting...',
      'Synchronizing multi-frame neural motion...',
      'Polishing color grade and audio spectral tracks...',
      'Finalizing 60fps high-resolution reel...',
    ];
    let tipIdx = 0;
    const tipInterval = setInterval(() => {
      tipIdx = (tipIdx + 1) % tips.length;
      setGenerationTip(tips[tipIdx]);
      setGenerationProgress((p) => Math.min(95, p + 18));
    }, 1500);

    try {
      const res = await fetch('/api/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          referenceImage,
          style: selectedStyle,
          aspectRatio,
          duration,
          cameraMotion,
          voice,
          language,
        }),
      });

      const data = await res.json();
      clearInterval(tipInterval);

      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate video');
      }

      setGenerationProgress(100);

      // Add to project timeline
      const newClip: StudioClip = {
        id: data.clip.id,
        title: data.clip.title,
        prompt: data.clip.prompt,
        style: data.clip.style,
        aspectRatio: data.clip.aspectRatio,
        duration: data.clip.duration,
        videoUrl: data.clip.videoUrl,
        thumbnailUrl: data.clip.thumbnailUrl,
        captions: data.clip.captions,
        cameraMotion: data.clip.cameraMotion,
        creditsUsed: data.clip.creditsUsed,
        createdAt: data.clip.createdAt,
        transitionToNext: 'fade',
      };

      setProject((prev) => ({
        ...prev,
        clips: [...prev.clips, newClip],
      }));

      // Update user credits
      if (typeof data.clip.remainingCredits === 'number') {
        onCreditsUpdated(data.clip.remainingCredits);
      }

      // Pre-fill publish details
      if (!publishTitle) {
        setPublishTitle(`${selectedStyle} Vision: ${prompt.slice(0, 35)}`);
      }
      if (!publishDesc) {
        setPublishDesc(`${prompt} #AIGeneration #${selectedStyle.replace(/\s+/g, '')} #ReelTok`);
      }

      // Move to timeline / preview
      setTimeout(() => {
        setIsGenerating(false);
        setActiveStep('timeline');
      }, 600);
    } catch (err: any) {
      clearInterval(tipInterval);
      setIsGenerating(false);
      setErrorMsg(err.message || 'Generation failed. Credits were not deducted.');
    }
  };

  // Timeline helpers
  const removeClipFromTimeline = (clipId: string) => {
    setProject((prev) => ({
      ...prev,
      clips: prev.clips.filter((c) => c.id !== clipId),
    }));
    if (previewClipIndex >= project.clips.length - 1) {
      setPreviewClipIndex(Math.max(0, project.clips.length - 2));
    }
  };

  const currentPreviewClip = project.clips[previewClipIndex] || project.clips[0];
  const totalProjectDuration = project.clips.reduce((sum, c) => sum + c.duration, 0);

  // Selected music object
  const selectedMusic = MUSIC_LIBRARY.find((m) => m.id === project.selectedMusicId) || MUSIC_LIBRARY[0];

  // Publish to ReelTok Social Feed
  const handlePublishReel = async () => {
    if (!publishTitle.trim()) {
      setErrorMsg('Please enter a title for your reel');
      return;
    }

    if (project.clips.length === 0) {
      setErrorMsg('Please generate or add at least one clip before publishing');
      return;
    }

    setIsPublishing(true);
    setErrorMsg(null);

    try {
      const activeClip = project.clips[0];

      const res = await fetch('/api/reels/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: publishTitle.trim(),
          description: publishDesc.trim() || `${publishTitle} #AIGeneration #ReelTok`,
          tags: ['AIGeneration', 'ReelTok', selectedStyle.replace(/\s+/g, ''), 'AIStudio'],
          videoUrl: activeClip.videoUrl,
          thumbnailUrl: activeClip.thumbnailUrl,
          duration: totalProjectDuration || activeClip.duration,
          aspectRatio: activeClip.aspectRatio,
          musicTrackId: project.selectedMusicId,
          captions: activeClip.captions,
          privacy: publishPrivacy,
          allowComments: publishAllowComments,
          aiPrompt: activeClip.prompt,
          aiStyle: activeClip.style,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to publish');

      onClipPublished(data.reel);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Publishing failed. Please check network.');
    } finally {
      setIsPublishing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full h-full sm:h-[92vh] sm:max-w-4xl bg-zinc-950 sm:bg-zinc-900 border border-white/10 rounded-none sm:rounded-2xl flex flex-col shadow-2xl overflow-hidden text-white"
      >
        {/* Studio Top Header */}
        <div className="px-5 py-3.5 border-b border-white/10 flex items-center justify-between bg-zinc-950">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#ff0050] to-[#00f2fe] flex items-center justify-center p-[2px]">
              <div className="w-full h-full bg-zinc-950 rounded-[6px] flex items-center justify-center">
                <Film className="w-4 h-4 text-[#ff0050]" />
              </div>
            </div>
            <div>
              <h2 className="font-extrabold text-sm sm:text-base tracking-tight flex items-center gap-2">
                ReelTok AI Video Studio
                <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30">
                  Pro Engine
                </span>
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Credits Quota Balance Button */}
            <button
              onClick={onOpenCreditPlans}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900 border border-amber-500/30 text-amber-300 text-xs font-semibold hover:border-amber-400 transition-all"
            >
              <Zap className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{user.credits} Credits</span>
              <span className="text-[10px] text-zinc-400">+ Add</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Studio Sub-Navigation Tabs */}
        <div className="px-5 border-b border-white/10 bg-zinc-900 flex items-center gap-6 text-xs font-bold overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveStep('create')}
            className={`py-3 flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              activeStep === 'create'
                ? 'border-[#ff0050] text-white text-glow-pink'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#ff0050]" />
            <span>1. Video Generator</span>
          </button>

          <button
            onClick={() => setActiveStep('story')}
            className={`py-3 flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              activeStep === 'story'
                ? 'border-amber-400 text-white shadow-neon-amber'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            <span>2. AI Storytelling & Cartoon (اردو / پنجابی)</span>
            <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded border border-amber-500/40">5-Min</span>
          </button>

          <button
            onClick={() => setActiveStep('timeline')}
            className={`py-3 flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              activeStep === 'timeline'
                ? 'border-[#00f2fe] text-white text-glow-cyan'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-[#00f2fe]" />
            <span>3. Multi-Clip Timeline ({project.clips.length})</span>
          </button>

          <button
            onClick={() => setActiveStep('edit')}
            className={`py-3 flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              activeStep === 'edit'
                ? 'border-purple-500 text-white'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-purple-400" />
            <span>4. Audio & Captions</span>
          </button>

          <button
            onClick={() => setActiveStep('publish')}
            className={`py-3 flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              activeStep === 'publish'
                ? 'border-emerald-500 text-white'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Share className="w-3.5 h-3.5 text-emerald-400" />
            <span>5. Export & Download</span>
          </button>
        </div>

        {/* Studio Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 no-scrollbar">
          {errorMsg && (
            <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{errorMsg}</span>
              </div>
              <button
                onClick={() => setErrorMsg(null)}
                className="text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>
          )}

          {/* ================= STEP 1: CREATE CLIP ================= */}
          {activeStep === 'create' && (
            <div className="space-y-6 max-w-3xl mx-auto">
              {/* Generation in progress overlay */}
              {isGenerating ? (
                <div className="py-16 flex flex-col items-center justify-center text-center">
                  <div className="relative mb-6">
                    <div className="w-24 h-24 rounded-full border-4 border-zinc-800 border-t-[#ff0050] border-r-[#00f2fe] animate-spin" />
                    <Sparkles className="w-8 h-8 text-[#00f2fe] absolute inset-0 m-auto animate-pulse" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">
                    Creating Your AI Video
                  </h3>
                  <p className="text-xs text-zinc-400 max-w-sm mb-4 leading-relaxed">
                    {generationTip}
                  </p>
                  <div className="w-64 h-2 bg-zinc-800 rounded-full overflow-hidden mb-2">
                    <div
                      className="h-full bg-gradient-to-r from-[#ff0050] to-[#00f2fe] transition-all duration-300 rounded-full"
                      style={{ width: `${generationProgress}%` }}
                    />
                  </div>
                  <span className="text-[11px] font-mono text-zinc-500">
                    {generationProgress}% complete
                  </span>
                </div>
              ) : (
                <>
                  {/* Prompt Textarea */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-[#ff0050]" />
                        <span>VIDEO PROMPT</span>
                      </label>
                      <div className="flex items-center gap-2">
                        {/* Enhance prompt */}
                        <button
                          type="button"
                          onClick={handleEnhancePrompt}
                          disabled={isEnhancingPrompt || !prompt.trim()}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-[#00f2fe] text-xs font-semibold disabled:opacity-40 transition-colors"
                        >
                          <Wand2 className="w-3 h-3" />
                          <span>{isEnhancingPrompt ? 'Enhancing...' : 'Gemini Enhance'}</span>
                        </button>

                        {/* Viral Script Generator */}
                        <button
                          type="button"
                          onClick={handleGenerateScript}
                          disabled={isWritingScript || !prompt.trim()}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-950/60 border border-purple-500/30 text-purple-300 hover:bg-purple-900/60 text-xs font-semibold disabled:opacity-40 transition-colors"
                        >
                          <FileText className="w-3 h-3 text-purple-400" />
                          <span>Viral Script</span>
                        </button>
                      </div>
                    </div>

                    <div className="relative">
                      <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Describe your scene in detail, e.g. Cyberpunk samurai walking through rain-drenched Shinjuku neon alleyway with floating holographic koi fish, 4k 60fps cinematic lighting..."
                        rows={3}
                        className="w-full bg-zinc-900 border border-white/10 rounded-xl p-3.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#ff0050] transition-colors leading-relaxed"
                      />
                    </div>

                    {/* Quick suggestion tags */}
                    <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-zinc-400">
                      <span className="font-semibold text-zinc-500">Quick ideas:</span>
                      {[
                        'Neon Tokyo alleyway at rain midnight',
                        'Bioluminescent underwater coral reef with pulsing lights',
                        'Makoto Shinkai anime sky with shooting star',
                        'Miniature clay croissants rising in rustic bakery oven',
                        'FPV drone dive through volcanic Icelandic glaciers',
                      ].map((idea) => (
                        <button
                          key={idea}
                          type="button"
                          onClick={() => setPrompt(idea)}
                          className="px-2 py-0.5 rounded-full bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors"
                        >
                          {idea.slice(0, 28)}...
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Reference Image Upload (Optional Image-to-Video) */}
                  <div className="p-3.5 bg-zinc-900/80 border border-white/10 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Upload className="w-4 h-4 text-[#00f2fe]" />
                        <span className="text-xs font-bold text-zinc-200">
                          REFERENCE IMAGE / FIRST FRAME (OPTIONAL)
                        </span>
                      </div>
                      {referenceImage && (
                        <button
                          onClick={() => setReferenceImage(null)}
                          className="text-[11px] text-rose-400 hover:underline"
                        >
                          Remove Image
                        </button>
                      )}
                    </div>

                    {referenceImage ? (
                      <div className="flex items-center gap-3">
                        <img
                          src={referenceImage}
                          alt="Reference"
                          className="w-16 h-16 rounded-lg object-cover border border-white/20"
                        />
                        <div className="text-xs text-zinc-400">
                          <p className="font-semibold text-zinc-200">Starting Frame Attached</p>
                          <p className="text-[11px]">Gemini will animate motion based on this visual guide.</p>
                        </div>
                      </div>
                    ) : (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border border-dashed border-white/20 rounded-xl p-3 text-center cursor-pointer hover:border-[#00f2fe] hover:bg-zinc-800/40 transition-all flex items-center justify-center gap-2 text-xs text-zinc-400"
                      >
                        <Upload className="w-4 h-4 text-[#00f2fe]" />
                        <span>Upload starting image (JPG/PNG) to animate</span>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </div>
                    )}
                  </div>

                  {/* Style Selector Grid */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                      <Film className="w-3.5 h-3.5 text-purple-400" />
                      <span>VISUAL STYLE</span>
                    </label>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {VIDEO_STYLES.map((st) => (
                        <div
                          key={st.id}
                          onClick={() => setSelectedStyle(st.id)}
                          className={`relative rounded-xl overflow-hidden cursor-pointer p-2.5 border transition-all ${
                            selectedStyle === st.id
                              ? 'border-[#ff0050] bg-zinc-800/90 shadow-neon-pink'
                              : 'border-white/10 bg-zinc-900/60 hover:border-white/30'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-base">{st.icon}</span>
                            <span className="font-bold text-xs text-white">{st.name}</span>
                          </div>
                          <p className="text-[10px] text-zinc-400 line-clamp-2 leading-relaxed">
                            {st.desc}
                          </p>
                          {selectedStyle === st.id && (
                            <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-[#ff0050] text-white flex items-center justify-center text-[10px]">
                              ✓
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Format Settings: Aspect Ratio, Duration & Camera Motion */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Aspect Ratio */}
                    <div className="p-3 bg-zinc-900 border border-white/10 rounded-xl space-y-1.5">
                      <label className="text-[11px] font-bold text-zinc-400 block">
                        ASPECT RATIO
                      </label>
                      <div className="grid grid-cols-3 gap-1">
                        {(['9:16', '16:9', '1:1'] as AspectRatio[]).map((ar) => (
                          <button
                            key={ar}
                            type="button"
                            onClick={() => setAspectRatio(ar)}
                            className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition-all ${
                              aspectRatio === ar
                                ? 'bg-[#ff0050] text-white shadow-sm'
                                : 'bg-zinc-800 text-zinc-400 hover:text-white'
                            }`}
                          >
                            {ar}
                          </button>
                        ))}
                      </div>
                      <span className="text-[10px] text-zinc-500 block">
                        {aspectRatio === '9:16' ? 'Vertical (TikTok/Reel)' : aspectRatio === '16:9' ? 'Landscape (16:9)' : 'Square (1:1)'}
                      </span>
                    </div>

                    {/* Duration */}
                    <div className="p-3 bg-zinc-900 border border-white/10 rounded-xl space-y-1.5">
                      <label className="text-[11px] font-bold text-zinc-400 block">
                        CLIP DURATION
                      </label>
                      <div className="grid grid-cols-3 gap-1">
                        {(['5s', '10s', '15s'] as const).map((d) => (
                          <button
                            key={d}
                            type="button"
                            onClick={() => setDuration(d)}
                            className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition-all ${
                              duration === d
                                ? 'bg-[#00f2fe] text-black font-bold shadow-sm'
                                : 'bg-zinc-800 text-zinc-400 hover:text-white'
                            }`}
                          >
                            {d}
                          </button>
                        ))}
                      </div>
                      <span className="text-[10px] text-zinc-500 block">
                        Cost: {getCreditCost()} credits
                      </span>
                    </div>

                    {/* Camera Movement */}
                    <div className="p-3 bg-zinc-900 border border-white/10 rounded-xl space-y-1.5">
                      <label className="text-[11px] font-bold text-zinc-400 block">
                        CAMERA MOVEMENT
                      </label>
                      <select
                        value={cameraMotion}
                        onChange={(e) => setCameraMotion(e.target.value)}
                        className="w-full bg-zinc-800 border border-white/10 rounded-lg p-1.5 text-xs text-white focus:outline-none focus:border-[#00f2fe]"
                      >
                        {CAMERA_MOTIONS.map((cm) => (
                          <option key={cm} value={cm}>
                            {cm}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Voice Narration Setup */}
                  <div className="p-3.5 bg-zinc-900 border border-white/10 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Mic className="w-4 h-4 text-purple-400" />
                        <span className="text-xs font-bold text-zinc-200">
                          AI VOICEOVER NARRATION
                        </span>
                      </div>
                      <span className="text-[10px] text-zinc-400">Gemini TTS Studio</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-zinc-400 block mb-1">Voice Persona</label>
                        <select
                          value={voice}
                          onChange={(e) => setVoice(e.target.value)}
                          className="w-full bg-zinc-800 border border-white/10 rounded-lg p-2 text-xs text-white"
                        >
                          {VOICES.map((v) => (
                            <option key={v.id} value={v.id}>
                              {v.name} - {v.mood}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] text-zinc-400 block mb-1">Narration Language</label>
                        <select
                          value={language}
                          onChange={(e) => setLanguage(e.target.value)}
                          className="w-full bg-zinc-800 border border-white/10 rounded-lg p-2 text-xs text-white"
                        >
                          {LANGUAGES.map((l) => (
                            <option key={l.code} value={l.code}>
                              {l.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Quota & Generation Action Bar */}
                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/10">
                    <div className="flex items-center gap-2 text-xs text-zinc-400">
                      <Zap className="w-4 h-4 text-amber-400" />
                      <span>
                        Cost: <strong className="text-amber-300">{creditCost} credits</strong> • You have <strong className="text-white">{user.credits}</strong>
                      </span>
                      {!hasEnoughCredits && (
                        <button
                          onClick={onOpenCreditPlans}
                          className="text-xs text-[#00f2fe] underline font-semibold ml-1"
                        >
                          Top up credits
                        </button>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={handleGenerateVideo}
                      disabled={isGenerating || !prompt.trim()}
                      className="w-full sm:w-auto px-8 py-3 rounded-xl bg-gradient-to-r from-[#ff0050] to-[#00f2fe] text-white font-extrabold text-sm shadow-neon-pink hover:scale-105 active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Generate AI Video ({creditCost} Credits)</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ================= STEP 2: AI STORYTELLING & CARTOON GENERATOR ================= */}
          {activeStep === 'story' && (
            <div className="space-y-6 max-w-3xl mx-auto">
              {isGeneratingStory ? (
                <div className="py-16 flex flex-col items-center justify-center text-center">
                  <div className="relative mb-6">
                    <div className="w-24 h-24 rounded-full border-4 border-zinc-800 border-t-amber-400 border-r-emerald-400 animate-spin" />
                    <BookOpen className="w-8 h-8 text-amber-400 absolute inset-0 m-auto animate-pulse" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">
                    Directing Your 5-Minute AI Story
                  </h3>
                  <p className="text-xs text-zinc-400 max-w-sm mb-4 leading-relaxed">
                    Crafting multi-scene cartoon storyboard in {storyLanguage.startsWith('ur') ? 'Urdu (اردو)' : storyLanguage.startsWith('pa') ? 'Punjabi (پنجابی / ਪੰਜਾਬੀ)' : 'English'}, synchronizing scene narratives and traditional folk soundtracks...
                  </p>
                  <div className="w-64 h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-amber-400 via-pink-500 to-emerald-400 animate-pulse w-3/4 rounded-full" />
                  </div>
                </div>
              ) : (
                <>
                  {/* Story Header Banner */}
                  <div className="p-4 bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-purple-500/10 border border-amber-500/20 rounded-2xl flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">🦚</span>
                        <h3 className="font-extrabold text-base text-white">
                          AI Storytelling & Cartoon Studio
                        </h3>
                        <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded-full border border-amber-500/40">
                          Urdu & Punjabi Voice Engine
                        </span>
                      </div>
                      <p className="text-xs text-zinc-300 leading-relaxed">
                        Generate complete moral stories, bedtime cartoons, and skits with synchronized characters, multi-scene storyboards, and regional audio narration.
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <span className="text-xs text-amber-400 font-bold block">Cost: 25 Credits</span>
                      <span className="text-[10px] text-zinc-400">Creates 3-4 Video Scenes</span>
                    </div>
                  </div>

                  {/* Topic / Moral Theme */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-300 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                        STORY TOPIC & MORAL THEME
                      </span>
                      <span className="text-[11px] text-zinc-400">Supports English, Urdu & Punjabi</span>
                    </label>

                    <textarea
                      value={storyTopic}
                      onChange={(e) => setStoryTopic(e.target.value)}
                      placeholder="e.g. چالاک لومڑی اور شیر - The clever little fox outsmarts the proud lion king in old Lahore, teaching that intelligence is stronger than brute force..."
                      rows={3}
                      className="w-full bg-zinc-900 border border-white/10 rounded-xl p-3.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 transition-colors leading-relaxed"
                    />

                    {/* Presets */}
                    <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                      <span className="font-semibold text-zinc-500">Popular ideas:</span>
                      {[
                        { title: 'The Clever Little Fox (چالاک لومڑی)', lang: 'ur-PK' },
                        { title: 'Golden Mustard Fields of Punjab (پنجاب دی سوہنی دھرتی)', lang: 'pa-PK' },
                        { title: 'The Honest Woodcutter (سچا لکڑہارا)', lang: 'ur-PK' },
                        { title: 'Space Astronaut Bunny on Moon (ننھا خلاباز خرگوش)', lang: 'ur-PK' },
                        { title: 'Karachi Rickshaw Superhero', lang: 'en-US' },
                      ].map((preset) => (
                        <button
                          key={preset.title}
                          type="button"
                          onClick={() => {
                            setStoryTopic(preset.title);
                            setStoryLanguage(preset.lang);
                          }}
                          className="px-2 py-0.5 rounded-full bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors"
                        >
                          {preset.title}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Story Configuration: Language, Voice & Genre */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Language */}
                    <div className="p-3 bg-zinc-900 border border-white/10 rounded-xl space-y-1.5">
                      <label className="text-[11px] font-bold text-zinc-400 block">
                        STORY LANGUAGE
                      </label>
                      <select
                        value={storyLanguage}
                        onChange={(e) => {
                          setStoryLanguage(e.target.value);
                          if (e.target.value === 'ur-PK') setStoryVoice('Zainab-Urdu');
                          if (e.target.value.startsWith('pa')) setStoryVoice('Simran-Punjabi');
                        }}
                        className="w-full bg-zinc-800 border border-white/10 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-amber-400"
                      >
                        <option value="ur-PK">اردو - Urdu (Pakistan)</option>
                        <option value="pa-PK">پنجابی - Punjabi (Shahmukhi)</option>
                        <option value="pa-IN">ਪੰਜਾਬੀ - Punjabi (Gurmukhi)</option>
                        <option value="en-US">English (US)</option>
                        <option value="hi-IN">हिन्दी - Hindi</option>
                      </select>
                      <span className="text-[10px] text-zinc-500 block">
                        Generates bilingual script & Nastaliq subtitles
                      </span>
                    </div>

                    {/* Narrator Voice */}
                    <div className="p-3 bg-zinc-900 border border-white/10 rounded-xl space-y-1.5">
                      <label className="text-[11px] font-bold text-zinc-400 block">
                        VOICE PERSONA
                      </label>
                      <select
                        value={storyVoice}
                        onChange={(e) => setStoryVoice(e.target.value)}
                        className="w-full bg-zinc-800 border border-white/10 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-amber-400"
                      >
                        {VOICES.map((v) => (
                          <option key={v.id} value={v.id}>
                            {v.name}
                          </option>
                        ))}
                      </select>
                      <span className="text-[10px] text-zinc-500 block">
                        Expressive folk narrator cadence
                      </span>
                    </div>

                    {/* Genre */}
                    <div className="p-3 bg-zinc-900 border border-white/10 rounded-xl space-y-1.5">
                      <label className="text-[11px] font-bold text-zinc-400 block">
                        ANIMATION GENRE
                      </label>
                      <select
                        value={storyGenre}
                        onChange={(e) => setStoryGenre(e.target.value)}
                        className="w-full bg-zinc-800 border border-white/10 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-amber-400"
                      >
                        <option value="Cartoon Moral Tale">Cartoon Moral Tale (اخلاقی سبق)</option>
                        <option value="3D Pixar Bedtime Story">3D Pixar Bedtime Story (بچوں کی کہانی)</option>
                        <option value="Desi Folk Tale & Dastaan">Desi Folk Tale & Dastaan (لوک داستان)</option>
                        <option value="Funny Comedy Cartoon">Funny Comedy Cartoon (مزاحیہ اینیمیشن)</option>
                        <option value="Sci-Fi Adventure">Sci-Fi Adventure (خلائی مہم جوئی)</option>
                      </select>
                      <span className="text-[10px] text-zinc-500 block">
                        Custom cartoon character prompts
                      </span>
                    </div>
                  </div>

                  {/* Target Project Duration */}
                  <div className="p-3.5 bg-zinc-900 border border-white/10 rounded-xl space-y-2">
                    <label className="text-[11px] font-bold text-zinc-400 block">
                      TARGET PROJECT DURATION
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { min: 1, label: '1 Minute (Short Reel)' },
                        { min: 3, label: '3 Minutes (Mini Dastaan)' },
                        { min: 5, label: '5 Minutes (Full Tale Project)' },
                      ].map((item) => (
                        <button
                          key={item.min}
                          type="button"
                          onClick={() => setStoryTargetMinutes(item.min)}
                          className={`py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                            storyTargetMinutes === item.min
                              ? 'bg-amber-500 text-black shadow-md'
                              : 'bg-zinc-800 text-zinc-300 hover:text-white'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Generation Action */}
                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/10">
                    <div className="flex items-center gap-2 text-xs text-zinc-400">
                      <Zap className="w-4 h-4 text-amber-400" />
                      <span>
                        Project Cost: <strong className="text-amber-300">25 credits</strong> • Balance: <strong className="text-white">{user.credits}</strong>
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={handleGenerateStory}
                      disabled={isGeneratingStory || !storyTopic.trim() || user.credits < 25}
                      className="w-full sm:w-auto px-8 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 text-white font-extrabold text-sm shadow-neon-amber hover:scale-105 active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Generate 5-Minute Storyboard Project (25 Credits)</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ================= STEP 3: PROJECT TIMELINE ================= */}
          {activeStep === 'timeline' && (
            <div className="space-y-6 max-w-3xl mx-auto">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Layers className="w-4 h-4 text-[#00f2fe]" />
                    <span>Multi-Clip Timeline (Max 30 Minutes)</span>
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Combine multiple AI clips into longer projects and stories. Total duration: {totalProjectDuration}s
                  </p>
                </div>

                <button
                  onClick={() => setActiveStep('create')}
                  className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-white flex items-center gap-1.5 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5 text-[#ff0050]" />
                  <span>Generate Another Clip</span>
                </button>
              </div>

              {project.clips.length === 0 ? (
                <div className="py-12 border border-dashed border-white/20 rounded-2xl text-center space-y-3">
                  <Film className="w-10 h-10 text-zinc-600 mx-auto" />
                  <p className="font-semibold text-sm text-zinc-300">Timeline is empty</p>
                  <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                    Generate your first clip in Step 1 to begin editing your reel!
                  </p>
                  <button
                    onClick={() => setActiveStep('create')}
                    className="px-4 py-2 rounded-xl bg-[#ff0050] text-white text-xs font-bold"
                  >
                    Go to Clip Generator
                  </button>
                </div>
              ) : (
                <>
                  {/* Active Preview Player */}
                  <div className="relative w-full max-w-sm mx-auto aspect-[9/16] bg-black rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                    {currentPreviewClip && (
                      <video
                        ref={previewVideoRef}
                        key={currentPreviewClip.id}
                        poster={currentPreviewClip.thumbnailUrl}
                        loop
                        playsInline
                        autoPlay
                        onError={(e) => {
                          console.warn('Studio preview video source error, using fallback');
                          // If current source failed, switch target src to fallback local video
                          const target = e.currentTarget;
                          if (target.src !== '/videos/cyberpunk.mp4') {
                            target.src = '/videos/cyberpunk.mp4';
                            target.play().catch(() => {});
                          }
                        }}
                        className="w-full h-full object-cover"
                      >
                        <source src={currentPreviewClip.videoUrl} type="video/mp4" />
                        <source src="/videos/cyberpunk.mp4" type="video/mp4" />
                      </video>
                    )}

                    {/* Preview overlay tags */}
                    <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold text-[#00f2fe] border border-white/10">
                      Clip {previewClipIndex + 1} of {project.clips.length} • {currentPreviewClip?.style}
                    </div>

                    <div className="absolute bottom-3 left-3 right-3 bg-black/70 backdrop-blur-md p-2.5 rounded-xl border border-white/10 text-xs">
                      <p className="font-bold text-white truncate">{currentPreviewClip?.title}</p>
                      <p className="text-[11px] text-zinc-400 line-clamp-1">{currentPreviewClip?.prompt}</p>
                    </div>
                  </div>

                  {/* Direct Download MP4 Video Actions */}
                  <div className="flex items-center justify-center gap-3 max-w-sm mx-auto">
                    <button
                      type="button"
                      onClick={() => handleDownloadVideo(currentPreviewClip?.videoUrl, currentPreviewClip?.title)}
                      className="flex-1 py-2 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-xs border border-white/10 flex items-center justify-center gap-2 transition-all hover:border-[#00f2fe]"
                      title="Download active clip MP4"
                    >
                      <Download className="w-3.5 h-3.5 text-[#00f2fe]" />
                      <span>Download Clip (MP4)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDownloadVideo(currentPreviewClip?.videoUrl, project.title)}
                      className="flex-1 py-2 px-3 rounded-xl bg-emerald-950/60 border border-emerald-500/30 hover:bg-emerald-900/60 text-emerald-300 font-semibold text-xs flex items-center justify-center gap-2 transition-all"
                      title="Export entire video project"
                    >
                      <Film className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Export Video (MP4)</span>
                    </button>
                  </div>

                  {/* Horizontal Clips Sequencer */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-300 block">CLIPS SEQUENCE</label>
                    <div className="flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar">
                      {project.clips.map((clip, idx) => (
                        <div
                          key={clip.id}
                          onClick={() => setPreviewClipIndex(idx)}
                          className={`relative shrink-0 w-36 h-28 rounded-xl overflow-hidden border cursor-pointer transition-all ${
                            previewClipIndex === idx
                              ? 'border-[#ff0050] ring-2 ring-[#ff0050]/40 shadow-neon-pink'
                              : 'border-white/10 opacity-70 hover:opacity-100'
                          }`}
                        >
                          <img
                            src={clip.thumbnailUrl}
                            alt={clip.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 p-2 flex flex-col justify-between">
                            <div className="flex items-center justify-between">
                              <span className="w-5 h-5 rounded-full bg-black/60 text-white text-[10px] font-bold flex items-center justify-center">
                                {idx + 1}
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeClipFromTimeline(clip.id);
                                }}
                                className="w-5 h-5 rounded-full bg-rose-600/80 hover:bg-rose-600 text-white flex items-center justify-center"
                                title="Remove from timeline"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>

                            <div>
                              <p className="text-[10px] font-bold text-white truncate">{clip.style}</p>
                              <span className="text-[9px] text-amber-300">{clip.duration}s</span>
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Add more clips tile */}
                      <div
                        onClick={() => setActiveStep('create')}
                        className="shrink-0 w-28 h-28 rounded-xl border border-dashed border-white/20 hover:border-[#00f2fe] flex flex-col items-center justify-center gap-2 text-zinc-400 hover:text-white cursor-pointer transition-colors"
                      >
                        <Plus className="w-6 h-6 text-[#00f2fe]" />
                        <span className="text-[11px] font-semibold">Add Clip</span>
                      </div>
                    </div>
                  </div>

                  {/* Transition settings between clips */}
                  <div className="p-3.5 bg-zinc-900 border border-white/10 rounded-xl space-y-2">
                    <label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                      <Scissors className="w-3.5 h-3.5 text-[#00f2fe]" />
                      <span>CLIP TRANSITIONS</span>
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {(['fade', 'wipe', 'zoom', 'glitch'] as const).map((tr) => (
                        <button
                          key={tr}
                          type="button"
                          className="py-2 px-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold capitalize text-zinc-300 hover:text-white transition-colors border border-white/5"
                        >
                          {tr}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Next Step Button */}
                  <div className="flex justify-end pt-2">
                    <button
                      onClick={() => setActiveStep('edit')}
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs flex items-center gap-2 hover:scale-105 transition-transform"
                    >
                      <span>Proceed to Audio & Captions</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ================= STEP 3: AUDIO & CAPTIONS EDIT ================= */}
          {activeStep === 'edit' && (
            <div className="space-y-6 max-w-3xl mx-auto">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Music className="w-4 h-4 text-[#ff0050]" />
                  <span>Licensed Soundtrack & Audio Mixer</span>
                </h3>
                <p className="text-xs text-zinc-400">
                  Select certified royalty-free music and balance voiceover volume.
                </p>
              </div>

              {/* Music Library selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-300">CERTIFIED LICENSED TRACKS</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {MUSIC_LIBRARY.map((track) => (
                    <div
                      key={track.id}
                      onClick={() =>
                        setProject((prev) => ({ ...prev, selectedMusicId: track.id }))
                      }
                      className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                        project.selectedMusicId === track.id
                          ? 'border-[#ff0050] bg-zinc-800/90 shadow-neon-pink'
                          : 'border-white/10 bg-zinc-900/60 hover:border-white/20'
                      }`}
                    >
                      <img
                        src={track.albumArt}
                        alt={track.title}
                        className="w-12 h-12 rounded-lg object-cover shrink-0"
                      />
                      <div className="flex-1 min-w-0 text-left">
                        <h4 className="font-bold text-xs text-white truncate">{track.title}</h4>
                        <p className="text-[11px] text-zinc-400 truncate">{track.artist}</p>
                        <span className="text-[10px] text-emerald-400 block truncate mt-0.5">
                          ✓ {track.license}
                        </span>
                      </div>
                      {project.selectedMusicId === track.id && (
                        <div className="w-5 h-5 rounded-full bg-[#ff0050] text-white flex items-center justify-center text-xs shrink-0">
                          ✓
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Audio Volume Mixer */}
              <div className="p-4 bg-zinc-900 border border-white/10 rounded-xl space-y-4">
                <h4 className="font-bold text-xs text-zinc-200">VOLUME MIXER</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center justify-between text-xs text-zinc-400 mb-1.5">
                      <span>Background Music Volume</span>
                      <span className="font-mono text-white">{Math.round(project.musicVolume * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.05}
                      value={project.musicVolume}
                      onChange={(e) =>
                        setProject((prev) => ({ ...prev, musicVolume: parseFloat(e.target.value) }))
                      }
                      className="w-full accent-[#ff0050]"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs text-zinc-400 mb-1.5">
                      <span>AI Voiceover Narration</span>
                      <span className="font-mono text-white">{Math.round(project.voiceVolume * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.05}
                      value={project.voiceVolume}
                      onChange={(e) =>
                        setProject((prev) => ({ ...prev, voiceVolume: parseFloat(e.target.value) }))
                      }
                      className="w-full accent-[#00f2fe]"
                    />
                  </div>
                </div>
              </div>

              {/* Color Grading Filter */}
              <div className="p-4 bg-zinc-900 border border-white/10 rounded-xl space-y-3">
                <h4 className="font-bold text-xs text-zinc-200">COLOR GRADING FILTER</h4>
                <div className="grid grid-cols-5 gap-2 text-center text-xs font-semibold">
                  {[
                    { id: 'normal', name: 'Original' },
                    { id: 'cyberpunk', name: 'Cyber Neon' },
                    { id: 'warm', name: 'Golden Hour' },
                    { id: 'noir', name: 'B&W Noir' },
                    { id: 'vhs', name: '80s VHS' },
                  ].map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setProject((prev) => ({ ...prev, filter: f.id as any }))}
                      className={`p-2.5 rounded-xl border transition-all ${
                        project.filter === f.id
                          ? 'border-[#00f2fe] bg-zinc-800 text-white'
                          : 'border-white/10 bg-zinc-950 text-zinc-400 hover:text-white'
                      }`}
                    >
                      {f.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Next Button */}
              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setActiveStep('publish')}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs flex items-center gap-2 hover:scale-105 transition-transform"
                >
                  <span>Ready to Export & Publish</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ================= STEP 4: EXPORT & PUBLISH ================= */}
          {activeStep === 'publish' && (
            <div className="space-y-6 max-w-2xl mx-auto">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Share className="w-4 h-4 text-emerald-400" />
                  <span>Publish to ReelTok Feed</span>
                </h3>
                <p className="text-xs text-zinc-400">
                  Fill in title, hashtags and privacy controls to broadcast your AI masterpiece.
                </p>
              </div>

              {/* Form fields */}
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-zinc-300 block mb-1">REEL TITLE</label>
                  <input
                    type="text"
                    value={publishTitle}
                    onChange={(e) => setPublishTitle(e.target.value)}
                    placeholder="Catchy viral title with emojis..."
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#ff0050]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-300 block mb-1">
                    DESCRIPTION & HASHTAGS
                  </label>
                  <textarea
                    value={publishDesc}
                    onChange={(e) => setPublishDesc(e.target.value)}
                    placeholder="Tell your audience what inspired this AI creation... #AIGen #Viral"
                    rows={3}
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#ff0050]"
                  />
                </div>

                {/* Privacy & Permissions */}
                <div className="p-4 bg-zinc-900 border border-white/10 rounded-xl space-y-3">
                  <h4 className="font-bold text-xs text-zinc-200">PRIVACY & INTERACTION</h4>

                  <div className="grid grid-cols-3 gap-2">
                    {(['public', 'followers', 'private'] as const).map((pr) => (
                      <button
                        key={pr}
                        type="button"
                        onClick={() => setPublishPrivacy(pr)}
                        className={`py-2 px-3 rounded-lg text-xs font-semibold capitalize border transition-all ${
                          publishPrivacy === pr
                            ? 'bg-[#ff0050] border-[#ff0050] text-white'
                            : 'bg-zinc-800 border-white/5 text-zinc-400 hover:text-white'
                        }`}
                      >
                        {pr === 'public' ? '🌍 Public' : pr === 'followers' ? '👥 Followers' : '🔒 Private'}
                      </button>
                    ))}
                  </div>

                  <div className="pt-2 flex items-center justify-between text-xs text-zinc-300">
                    <span>Allow viewers to comment</span>
                    <input
                      type="checkbox"
                      checked={publishAllowComments}
                      onChange={(e) => setPublishAllowComments(e.target.checked)}
                      className="w-4 h-4 accent-[#ff0050]"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-4 flex flex-col sm:flex-row items-center gap-3">
                  <button
                    type="button"
                    onClick={handlePublishReel}
                    disabled={isPublishing || !publishTitle.trim() || project.clips.length === 0}
                    className="w-full sm:flex-1 py-3 px-6 rounded-xl bg-gradient-to-r from-[#ff0050] via-purple-600 to-[#00f2fe] text-white font-extrabold text-sm shadow-neon-pink hover:scale-105 active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                  >
                    <Share className="w-4 h-4" />
                    <span>{isPublishing ? 'Publishing to Feed...' : 'Publish to ReelTok Feed'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDownloadVideo(currentPreviewClip?.videoUrl, publishTitle || project.title)}
                    className="w-full sm:w-auto py-3 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs transition-colors flex items-center justify-center gap-2 shadow-lg"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download MP4</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      alert('Reel project saved to your Studio Drafts!');
                      onClose();
                    }}
                    className="w-full sm:w-auto py-3 px-5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-xs transition-colors"
                  >
                    Save Draft
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Viral Script Modal Breakdown */}
        {scriptModalOpen && generatedScript && (
          <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-zinc-900 border border-white/10 rounded-2xl p-5 text-left text-white shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-purple-400" />
                  <h3 className="font-bold text-sm">Gemini Viral Script Blueprint</h3>
                </div>
                <button
                  onClick={() => setScriptModalOpen(false)}
                  className="text-zinc-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 text-xs max-h-80 overflow-y-auto no-scrollbar">
                <div>
                  <span className="text-zinc-400 font-semibold block mb-0.5">HOOK (First 2s):</span>
                  <p className="bg-zinc-950 p-2 rounded-lg text-amber-300 font-medium">
                    "{generatedScript.hook}"
                  </p>
                </div>

                <div>
                  <span className="text-zinc-400 font-semibold block mb-0.5">SCENES BREAKDOWN:</span>
                  <div className="space-y-2">
                    {generatedScript.visualScenes?.map((sc: any, i: number) => (
                      <div key={i} className="p-2 bg-zinc-950 rounded-lg text-zinc-300">
                        <span className="text-[#00f2fe] font-bold">Scene {i + 1}: </span>
                        {sc.description}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-zinc-400 font-semibold block mb-0.5">VOICEOVER NARRATION:</span>
                  <p className="bg-zinc-950 p-2 rounded-lg text-zinc-200 italic">
                    "{generatedScript.voiceoverText}"
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => setScriptModalOpen(false)}
                  className="flex-1 py-2 rounded-xl bg-zinc-800 text-xs font-semibold"
                >
                  Close
                </button>
                <button
                  onClick={applyScriptScenes}
                  className="flex-1 py-2 rounded-xl bg-[#ff0050] text-xs font-bold text-white shadow-neon-pink"
                >
                  Apply to Prompt
                </button>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
