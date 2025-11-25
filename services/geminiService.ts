
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AnalysisResult, ArchitectureResult, PlanResult, DocsResult, ProjectData } from "../types";

// Helper to get client
const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing in environment variables");
  }
  return new GoogleGenAI({ apiKey });
};

// 1. Analysis Agent
export const analyzeIdea = async (idea: string): Promise<AnalysisResult> => {
  const ai = getClient();
  
  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING, description: "A catchy name for the project" },
      summary: { type: Type.STRING, description: "A professional executive summary of the idea" },
      palette: {
        type: Type.OBJECT,
        description: "A unique color scheme tailored specifically to the project's mood. Do not use generic colors.",
        properties: {
            background: { type: Type.STRING, description: "Main app background HEX. e.g. #0f172a for tech, #1a0505 for horror, #f0fdf4 for plants." },
            surface: { type: Type.STRING, description: "Card/Container background HEX. Slightly lighter/darker than background." },
            primary: { type: Type.STRING, description: "Main brand color HEX." },
            secondary: { type: Type.STRING, description: "Accent color HEX." },
            text: { type: Type.STRING, description: "Main text color HEX. Must be readable on background." }
        },
        required: ["background", "surface", "primary", "secondary", "text"]
      },
      themeMode: { type: Type.STRING, enum: ["light", "dark"], description: "The best UI theme mode for this app." },
      targetAudience: { 
        type: Type.ARRAY, 
        items: { type: Type.STRING },
        description: "List of potential user personas"
      },
      coreFeatures: { 
        type: Type.ARRAY, 
        items: { type: Type.STRING },
        description: "List of must-have features"
      },
      questions: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            suggestedAnswer: { type: Type.STRING, description: "An AI-generated likely answer based on the context" }
          },
          required: ["question", "suggestedAnswer"]
        },
        description: "3-5 Clarifying questions to refine the requirements"
      }
    },
    required: ["title", "summary", "targetAudience", "coreFeatures", "questions", "palette", "themeMode"]
  };

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `Analyze this project idea: "${idea}". Structure it into a professional project brief. 
    Crucial: Generate a unique, custom color palette (HEX codes) that perfectly fits the mood. 
    For a horror game, use deep blacks/reds. For a medical app, use sterile whites/blues. For a nature app, use organic greens/creams.
    Respond in Russian.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: schema,
      systemInstruction: "You are an expert Product Manager and UI Designer."
    }
  });

  const text = response.text;
  if (!text) throw new Error("No response from AI");
  return JSON.parse(text) as AnalysisResult;
};

// 2. Architecture Agent
export const generateArchitecture = async (analysis: AnalysisResult): Promise<ArchitectureResult> => {
  const ai = getClient();

  const context = JSON.stringify({
    summary: analysis.summary,
    features: analysis.coreFeatures,
    userClarifications: analysis.questions.map(q => `Q: ${q.question} A: ${q.userAnswer || q.suggestedAnswer}`).join("; ")
  });

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      frontend: { type: Type.ARRAY, items: { type: Type.STRING } },
      backend: { type: Type.ARRAY, items: { type: Type.STRING } },
      database: { type: Type.ARRAY, items: { type: Type.STRING } },
      devops: { type: Type.ARRAY, items: { type: Type.STRING } },
      rationale: { type: Type.STRING, description: "Why this stack was chosen" },
      modules: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            description: { type: Type.STRING },
            interactions: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["name", "description", "interactions"]
        }
      },
      diagram: {
        type: Type.OBJECT,
        description: "Data to render a high-level architecture diagram.",
        properties: {
          nodes: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING, description: "Unique short ID, e.g., 'web', 'api'" },
                label: { type: Type.STRING, description: "Display name" },
                type: { type: Type.STRING, enum: ["client", "service", "database", "external"] }
              },
              required: ["id", "label", "type"]
            }
          },
          edges: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                from: { type: Type.STRING, description: "Source Node ID" },
                to: { type: Type.STRING, description: "Target Node ID" },
                label: { type: Type.STRING, description: "Protocol or Data type, e.g. 'JSON', 'SQL'" }
              },
              required: ["from", "to"]
            }
          }
        },
        required: ["nodes", "edges"]
      }
    },
    required: ["frontend", "backend", "database", "devops", "modules", "rationale", "diagram"]
  };

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `Design the system architecture for this project based on these requirements: ${context}. Include a high-level diagram structure. Respond in Russian.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: schema,
      systemInstruction: "You are a Senior Solutions Architect. Define a scalable, modern technology stack and modular architecture."
    }
  });

  const text = response.text;
  if (!text) throw new Error("No response from AI");
  return JSON.parse(text) as ArchitectureResult;
};

// 3. Planning Agent
export const generatePlan = async (analysis: AnalysisResult, architecture: ArchitectureResult): Promise<PlanResult> => {
  const ai = getClient();
  
  const context = JSON.stringify({
    features: analysis.coreFeatures,
    modules: architecture.modules.map(m => m.name),
  });

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      mvpDefinition: { type: Type.STRING, description: "What constitutes the MVP" },
      risks: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Potential technical or product risks" },
      phases: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            duration: { type: Type.STRING, description: "e.g., '2 weeks'" },
            tasks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  description: { type: Type.STRING },
                  complexity: { type: Type.STRING, enum: ["Low", "Medium", "High"] }
                },
                required: ["name", "description", "complexity"]
              }
            }
          },
          required: ["name", "duration", "tasks"]
        }
      }
    },
    required: ["mvpDefinition", "risks", "phases"]
  };

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `Create a project roadmap and development plan based on: ${context}. Respond in Russian.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: schema,
      systemInstruction: "You are a Technical Project Manager. Break down the project into logical phases, defining MVP and dependencies."
    }
  });

  const text = response.text;
  if (!text) throw new Error("No response from AI");
  return JSON.parse(text) as PlanResult;
};

// 4. Docs & Presentation Agent
export const generateDocumentation = async (data: any): Promise<DocsResult> => {
  const ai = getClient();
  
  // Remove binary image data to save tokens
  const { appImage, ...cleanData } = data;
  const context = JSON.stringify(cleanData);

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      prd: { type: Type.STRING, description: "Full Product Requirements Document in Markdown format" },
      designStyle: { type: Type.STRING, enum: ["minimal", "corporate", "creative", "tech"], description: "The visual style for the presentation slides" },
      slides: {
        type: Type.ARRAY,
        description: "5-7 slides for an investor pitch deck",
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            content: { type: Type.STRING, description: "The main content text/bullets" },
            speakerNotes: { type: Type.STRING, description: "Notes for the presenter" },
            layout: { 
                type: Type.STRING, 
                enum: ["title", "bullet-list", "big-number", "split", "quote"],
                description: "The best layout strategy for this specific content"
            }
          },
          required: ["title", "content", "speakerNotes", "layout"]
        }
      }
    },
    required: ["prd", "slides", "designStyle"]
  };

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `Generate a comprehensive Product Requirements Document (PRD) and Investor Presentation slides based on this project data: ${context}. 
    For the PRD, use Markdown. Include sections for: Executive Summary, Problem & Solution, Technical Architecture, Roadmap, and Risk Analysis.
    For the Slides, focus on the business value, problem/solution, and market potential.
    Select a 'layout' for each slide that best fits the text (e.g. use 'big-number' for statistics, 'split' for comparisons).
    Respond in Russian.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: schema,
      systemInstruction: "You are a Chief Product Officer. Write clear, professional, and persuasive documentation."
    }
  });

  const text = response.text;
  if (!text) throw new Error("No response from AI");
  return JSON.parse(text) as DocsResult;
};

// 5. Visual Generation Agent
export const generateAppVisual = async (summary: string, themeMode: 'light' | 'dark', brandColor: string, palette: any): Promise<string> => {
  const ai = getClient();
  
  const themePrompt = themeMode === 'light' 
    ? "clean, bright, airy" 
    : "futuristic, sleek, dark mode, cinematic lighting";

  const prompt = `Create a high-quality UI design mockup for: ${summary}. 
  Style: ${themePrompt}. 
  Color Palette: 
  - Background: ${palette.background}
  - Surface: ${palette.surface}
  - Primary: ${palette.primary}
  - Secondary: ${palette.secondary}
  
  The image MUST strictly follow this color scheme.
  The interface should be modern and professional.
  Do not include any text or words in the image.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { text: prompt }
      ]
    }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  
  throw new Error("No image generated by the model. Please try again.");
};

// 6. Generic Chat Router
export const sendAgentMessage = async (
  message: string, 
  projectContext: ProjectData
): Promise<{ text: string; agentName: string }> => {
  const ai = getClient();

  // Create a light version of context to avoid token limits
  const lightContext = {
    idea: projectContext.originalIdea,
    analysisSummary: projectContext.analysis?.summary,
    techStack: projectContext.architecture?.frontend,
    roadmapPhases: projectContext.plan?.phases.map(p => p.name)
  };

  const systemPrompt = `
    You are an intelligent router and role-player for a Project Management AI system. 
    There are three agents:
    1. 'Агент-Аналитик' (Product focus, requirements, features)
    2. 'Агент-Архитектор' (Tech stack, database, security, diagrams)
    3. 'Агент-Планнер' (Timeline, tasks, team, risks)

    The user says: "${message}".
    Context: ${JSON.stringify(lightContext)}.

    Determine which agent should answer. Then, assume that role and answer the user directly in Russian.
    Return JSON: { "agentName": "Name of Agent", "response": "The response content" }
  `;

  const schema: Schema = {
      type: Type.OBJECT,
      properties: {
          agentName: { type: Type.STRING, enum: ["Агент-Аналитик", "Агент-Архитектор", "Агент-Планнер"] },
          response: { type: Type.STRING }
      },
      required: ["agentName", "response"]
  };

  const result = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: systemPrompt,
      config: {
          responseMimeType: "application/json",
          responseSchema: schema
      }
  });

  const text = result.text;
  if (!text) throw new Error("No response");
  const parsed = JSON.parse(text);
  
  return {
      text: parsed.response,
      agentName: parsed.agentName
  };
};
