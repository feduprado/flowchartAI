import type { FlowNode, Connection, QualityAnalysis, QualityIssue, QualityMetrics } from '../types';

type ValidationResult = { passed: boolean; issues: QualityIssue[] };
type QualityRule = {
    name: string;
    validate: (nodes: FlowNode[], connections: Connection[]) => ValidationResult;
};

export class FlowQualityAnalyzer {
    private rules: QualityRule[];

    constructor() {
        this.rules = this.initializeRules();
    }

    public analyze(nodes: FlowNode[], connections: Connection[]): QualityAnalysis {
        if (nodes.length === 0) {
            return this.getEmptyAnalysis();
        }

        const issues: QualityIssue[] = [];
        const passedChecks: string[] = [];
        
        for (const rule of this.rules) {
            const result = rule.validate(nodes, connections);
            if (result.passed) {
                passedChecks.push(rule.name);
            } else {
                issues.push(...result.issues);
            }
        }
        
        const metrics = this.calculateMetrics(nodes, connections, issues);
        const score = this.calculateOverallScore(issues, passedChecks.length, this.rules.length);

        return {
            score,
            issues: this.sortIssuesBySeverity(issues),
            metrics,
            passedChecks,
            failedChecks: issues.map(issue => issue.rule),
        };
    }

    private initializeRules(): QualityRule[] {
        return [
            { name: "Single Start Node", validate: this.validateSingleStartNode },
            { name: "End Node Presence", validate: this.validateEndNodePresence },
            { name: "End Node Outputs", validate: this.validateEndNodeOutputs },
            { name: "Decision Node Logic", validate: this.validateDecisionNodes },
            { name: "Connectivity", validate: this.validateConnectivity },
            { name: "Termination", validate: this.validateTermination },
        ];
    }
    
    // --- Validation Rules ---

    private validateSingleStartNode(nodes: FlowNode[]): ValidationResult {
        const startNodes = nodes.filter(n => n.type === 'start');
        if (startNodes.length === 0) {
            return { passed: false, issues: [{ id: 'no-start', type: 'error', severity: 'critical', title: 'No Start Node', description: 'The flowchart must have exactly one start node.', rule: '2.1', suggestedFix: 'Add a [Start] node to the canvas.' }] };
        }
        if (startNodes.length > 1) {
            return { passed: false, issues: [{ id: 'multiple-starts', type: 'error', severity: 'critical', title: 'Multiple Start Nodes', description: `Found ${startNodes.length} start nodes. Only one is allowed.`, nodeIds: startNodes.map(n => n.id), rule: '2.1', suggestedFix: 'Remove extra [Start] nodes.' }] };
        }
        return { passed: true, issues: [] };
    }

    private validateEndNodePresence(nodes: FlowNode[]): ValidationResult {
        const endNodes = nodes.filter(n => n.type === 'end');
        if (endNodes.length === 0) {
            return { passed: false, issues: [{ id: 'no-end', type: 'error', severity: 'high', title: 'No End Node', description: 'The flowchart must have at least one end node.', rule: '2.4', suggestedFix: 'Add one or more [End] nodes to represent termination points.' }] };
        }
        return { passed: true, issues: [] };
    }

    private validateEndNodeOutputs(nodes: FlowNode[], connections: Connection[]): ValidationResult {
        const endNodes = nodes.filter(n => n.type === 'end');
        const issues: QualityIssue[] = [];
        endNodes.forEach(node => {
            if (connections.some(c => c.fromNodeId === node.id)) {
                issues.push({ id: `end-output-${node.id}`, type: 'error', severity: 'high', title: 'End Node Has Output', description: `End node "${node.text}" should not have outgoing connections.`, nodeIds: [node.id], rule: '2.4', suggestedFix: 'Remove connections originating from this [End] node.' });
            }
        });
        return { passed: issues.length === 0, issues };
    }

    private validateDecisionNodes(nodes: FlowNode[], connections: Connection[]): ValidationResult {
        const decisionNodes = nodes.filter(n => n.type === 'decision');
        const issues: QualityIssue[] = [];
        decisionNodes.forEach(node => {
            const outgoing = connections.filter(c => c.fromNodeId === node.id);
            if (outgoing.length < 2) {
                issues.push({ id: `decision-outputs-${node.id}`, type: 'error', severity: 'high', title: 'Insufficient Decision Outputs', description: `Decision node "${node.text}" must have at least two outgoing connections (e.g., Sim/Não).`, nodeIds: [node.id], rule: '2.3', suggestedFix: 'Add the missing outcome connection(s) from this node.' });
            }
            if (!node.text.includes('?')) {
                issues.push({ id: `decision-question-${node.id}`, type: 'warning', severity: 'medium', title: 'Decision Not a Question', description: `The text for decision node "${node.text}" should be a question ending with '?'.`, nodeIds: [node.id], rule: '3.2', suggestedFix: 'Rephrase the node text as a question.' });
            }
            outgoing.forEach(conn => {
                if (!conn.label) {
                    issues.push({ id: `decision-label-${conn.id}`, type: 'error', severity: 'high', title: 'Missing Decision Label', description: `Connection from "${node.text}" needs a label (e.g., Sim/Não).`, connectionIds: [conn.id], nodeIds: [node.id], rule: '2.3', suggestedFix: 'Add a label to the connection.' });
                }
            });
        });
        return { passed: issues.length === 0, issues };
    }
    
    private validateConnectivity(nodes: FlowNode[], connections: Connection[]): ValidationResult {
        const startNode = nodes.find(n => n.type === 'start');
        if (!startNode) return { passed: true, issues: [] }; // Handled by another rule

        const reachable = new Set<string>();
        const queue = [startNode.id];
        reachable.add(startNode.id);

        while (queue.length > 0) {
            const currentId = queue.shift()!;
            connections.filter(c => c.fromNodeId === currentId).forEach(c => {
                if (!reachable.has(c.toNodeId)) {
                    reachable.add(c.toNodeId);
                    queue.push(c.toNodeId);
                }
            });
        }

        const unreachableNodes = nodes.filter(n => !reachable.has(n.id));
        if (unreachableNodes.length > 0) {
            return { passed: false, issues: [{ id: 'unreachable-nodes', type: 'error', severity: 'high', title: 'Unreachable Nodes', description: `${unreachableNodes.length} node(s) cannot be reached from the start node.`, nodeIds: unreachableNodes.map(n => n.id), rule: '4.1', suggestedFix: 'Connect the highlighted nodes to the main flow.' }] };
        }
        return { passed: true, issues: [] };
    }

    private validateTermination(nodes: FlowNode[], connections: Connection[]): ValidationResult {
        const endNodeIds = new Set(nodes.filter(n => n.type === 'end').map(n => n.id));
        if (endNodeIds.size === 0) return { passed: true, issues: [] }; // Handled by another rule

        const canReachEnd = new Set<string>(endNodeIds);
        let changed = true;
        while(changed) {
            changed = false;
            connections.forEach(c => {
                if (canReachEnd.has(c.toNodeId) && !canReachEnd.has(c.fromNodeId)) {
                    canReachEnd.add(c.fromNodeId);
                    changed = true;
                }
            });
        }
        
        const deadEndNodes = nodes.filter(n => !canReachEnd.has(n.id) && n.type !== 'end');
        if (deadEndNodes.length > 0) {
            return { passed: false, issues: [{ id: 'dead-end-nodes', type: 'error', severity: 'high', title: 'Dead End Paths', description: `${deadEndNodes.length} node(s) are on a path that does not lead to an end node.`, nodeIds: deadEndNodes.map(n => n.id), rule: '4.2', suggestedFix: 'Ensure all paths from these nodes eventually connect to an [End] node.' }] };
        }
        return { passed: true, issues: [] };
    }
    
    // --- Metrics & Scoring ---

    private calculateMetrics(nodes: FlowNode[], connections: Connection[], issues: QualityIssue[]): QualityMetrics {
        const decisionNodes = nodes.filter(n => n.type === 'decision');
        return {
            structural: {
                startNodes: nodes.filter(n => n.type === 'start').length,
                endNodes: nodes.filter(n => n.type === 'end').length,
                unreachableNodes: issues.find(i => i.id === 'unreachable-nodes')?.nodeIds?.length || 0,
                deadEndNodes: issues.find(i => i.id === 'dead-end-nodes')?.nodeIds?.length || 0,
            },
            semantic: {
                decisionNodesWithoutQuestion: issues.filter(i => i.id.startsWith('decision-question-')).length,
                decisionConnectionsWithoutLabel: issues.filter(i => i.id.startsWith('decision-label-')).length,
            },
            complexity: {
                nodeCount: nodes.length,
                connectionCount: connections.length,
                cyclomaticComplexity: connections.length - nodes.length + 2,
            },
        };
    }

    private calculateOverallScore(issues: QualityIssue[], passedChecks: number, totalChecks: number): number {
        let score = 100;
        const severityWeights = { critical: 25, high: 15, medium: 5, low: 2, info: 1 };
        
        issues.forEach(issue => {
            score -= severityWeights[issue.severity] || 0;
        });

        const checkBonus = (passedChecks / totalChecks) * 10;
        score += checkBonus;

        return Math.max(0, Math.min(100, Math.round(score)));
    }
    
    private sortIssuesBySeverity(issues: QualityIssue[]): QualityIssue[] {
        const severityOrder = { critical: 0, high: 1, medium: 2, low: 3, info: 4 };
        return issues.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
    }
    
    private getEmptyAnalysis(): QualityAnalysis {
        const metrics = this.calculateMetrics([], [], []);
        return {
            score: 100,
            issues: [],
            metrics,
            passedChecks: [],
            failedChecks: [],
        };
    }
}
