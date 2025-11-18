import { GoogleGenAI, Type } from "@google/genai";
import type { FlowNode, Connection, QualityAnalysis } from '../types';

if (!process.env.API_KEY) {
  console.warn("API_KEY environment variable not set. AI features will not work.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const flowchartSchema = {
    type: Type.OBJECT,
    properties: {
        nodes: {
            type: Type.ARRAY,
            description: "Array of flowchart nodes.",
            items: {
                type: Type.OBJECT,
                properties: {
                    id: { type: Type.STRING, description: "Unique ID for the node, e.g., 'node_1'." },
                    type: { type: Type.STRING, description: "Node type: 'start', 'process', 'decision', or 'end'." },
                    text: { type: Type.STRING, description: "Display text for the node." },
                    position: {
                        type: Type.OBJECT,
                        properties: {
                            x: { type: Type.NUMBER, description: "X coordinate." },
                            y: { type: Type.NUMBER, description: "Y coordinate." }
                        },
                        required: ["x", "y"]
                    }
                },
                required: ["id", "type", "text", "position"]
            }
        },
        connections: {
            type: Type.ARRAY,
            description: "Array of connections between nodes.",
            items: {
                type: Type.OBJECT,
                properties: {
                    fromNodeId: { type: Type.STRING, description: "ID of the source node." },
                    toNodeId: { type: Type.STRING, description: "ID of the target node." },
                    label: { type: Type.STRING, description: "Optional label for the connection, like 'Sim' or 'Não'." }
                },
                required: ["fromNodeId", "toNodeId"]
            }
        }
    },
    required: ["nodes", "connections"]
};


export const generateFlowchartFromText = async (text: string): Promise<{ nodes: FlowNode[]; connections: Connection[] }> => {
  const prompt = `
    Analyze the following textual description of a process and convert it into a structured flowchart in JSON format.
    Follow these strict rules:
    1.  The flowchart must have exactly one 'start' node.
    2.  All paths must eventually lead to an 'end' node.
    3.  'decision' nodes must be phrased as questions.
    4.  Connections originating from a 'decision' node must have a 'Sim' or 'Não' label.
    5.  Generate logical x and y positions for the nodes to form a readable, top-down layout. Start at position (x: 400, y: 50). Increase y for subsequent nodes. For decisions, branch out on the x-axis.
    6.  Ensure all 'toNodeId' in connections refer to valid node IDs you have created. A common mistake is connecting to a node that doesn't exist. Double-check this.
    7.  The ID for each node must be unique. A simple schema like 'node_1', 'node_2' is sufficient.
    
    Process Description:
    ---
    ${text}
    ---
  `;

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: flowchartSchema,
        }
    });

    const jsonString = response.text.trim();
    const parsed = JSON.parse(jsonString);

    // Basic validation
    if (!parsed.nodes || !parsed.connections) {
        throw new Error("AI response is missing 'nodes' or 'connections' array.");
    }

    // Add full IDs to connections for the app state
    const connectionsWithIds = parsed.connections.map((c: Omit<Connection, 'id'>, index: number) => ({
      ...c,
      id: `conn_${Date.now()}_${index}`
    }));

    return { nodes: parsed.nodes, connections: connectionsWithIds };

  } catch (error) {
    console.error("Error generating flowchart with Gemini:", error);
    throw new Error("Failed to generate flowchart from text. The AI model might have returned an invalid structure.");
  }
};

/**
 * Provides advanced, context-aware suggestions for a flowchart based on a specific business domain.
 */
export const analyzeBusinessContext = async (nodes: FlowNode[], connections: Connection[], domain: string): Promise<string[]> => {
    const prompt = `
        As an expert in ${domain}, analyze this flowchart and provide three actionable, domain-specific suggestions for improvement.
        Focus on optimizing the process, adding missing validation steps common in this industry, and ensuring best practices for ${domain} are followed.

        Flowchart Structure:
        Nodes: ${JSON.stringify(nodes.map(n => ({type: n.type, text: n.text})))}
        Connections: ${connections.length} connections forming the process flow.

        Return a JSON array of three suggestion strings.
    `;
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
        });

        // This is a simplified example; in a real app, you'd use a JSON schema.
        const suggestions = JSON.parse(response.text);
        return Array.isArray(suggestions) ? suggestions : [];
    } catch (error) {
        console.error("Error with contextual analysis:", error);
        return ["Could not get AI suggestions at this time."];
    }
};
