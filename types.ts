// Data Models

export enum Step {
  INPUT = 0,
  ANALYSIS = 1,
  ARCHITECTURE = 2,
  PLANNING = 3,
  DOCS = 4,
}

export interface ClarifyingQuestion {
  question: string;
  suggestedAnswer: string;
  userAnswer?: string;
}

export interface ColorPalette {
  primary: string;    // Main action color
  secondary: string;  // Accents
  background: string; // Main app background
  surface: string;    // Card background
  text: string;       // Main text color
}

export interface AnalysisResult {
  title: string;
  summary: string;
  targetAudience: string[];
  coreFeatures: string[];
  questions: ClarifyingQuestion[];
  palette: ColorPalette; // New comprehensive palette
  themeMode: 'light' | 'dark';
}

export interface DiagramNode {
  id: string;
  label: string;
  type: 'client' | 'service' | 'database' | 'external';
}

export interface DiagramEdge {
  from: string;
  to: string;
  label?: string;
}

export interface ModuleDefinition {
  name: string;
  description: string;
  interactions: string[];
}

export interface ArchitectureResult {
  frontend: string[];
  backend: string[];
  database: string[];
  devops: string[];
  modules: ModuleDefinition[];
  rationale: string;
  diagram: {
    nodes: DiagramNode[];
    edges: DiagramEdge[];
  };
}

export interface Task {
  name: string;
  description: string;
  complexity: 'Low' | 'Medium' | 'High';
}

export interface Phase {
  name: string;
  duration: string;
  tasks: Task[];
}

export interface PlanResult {
  phases: Phase[];
  risks: string[];
  mvpDefinition: string;
}

export interface Slide {
  title: string;
  content: string; // Changed from 'points' to flexible content string
  speakerNotes: string;
  layout: 'title' | 'bullet-list' | 'big-number' | 'split' | 'quote'; // New layout control
}

export interface DocsResult {
  prd: string; // Markdown
  designStyle: 'minimal' | 'corporate' | 'creative' | 'tech'; // New design theme
  slides: Slide[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  agentName?: string; // e.g., "Architect", "Planner"
  text: string;
  timestamp: Date;
  isTyping?: boolean;
}

export interface ProjectData {
  id?: string; // UUID for history
  timestamp?: number;
  originalIdea: string;
  analysis: AnalysisResult | null;
  architecture: ArchitectureResult | null;
  plan: PlanResult | null;
  documentation: DocsResult | null;
  appImage?: string; // Base64 image
  messages: ChatMessage[]; // New: Persistence for chat history
}

export interface ProjectHistoryItem {
    id: string;
    title: string;
    timestamp: number;
    idea: string;
    themeColor: string;
}

export interface AIRequestState {
  loading: boolean;
  stepName?: string;
  error: string | null;
}