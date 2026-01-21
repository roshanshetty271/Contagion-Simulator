// ============================================
// NETWORK VISUALIZATION
// D3.js force-directed graph visualization
// ============================================

'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import * as d3 from 'd3';
import { useSimulationStore } from '@/stores/simulationStore';
import { getEpidemicColor, getFinancialColor, shouldGlow, getGlowColor } from '@/lib/colors';
import type { SimulationNode, SimulationLink } from '@/types';

interface NetworkVisualizationProps {
  width: number;
  height: number;
}

export function NetworkVisualization({ width, height }: NetworkVisualizationProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const simulationRef = useRef<d3.Simulation<SimulationNode, SimulationLink> | null>(null);
  
  // Store state
  const nodes = useSimulationStore(state => state.nodes);
  const links = useSimulationStore(state => state.links);
  const mode = useSimulationStore(state => state.mode);
  const colorBlindMode = useSimulationStore(state => state.colorBlindMode);
  const playbackState = useSimulationStore(state => state.playbackState);
  const transform = useSimulationStore(state => state.transform);
  const setTransform = useSimulationStore(state => state.setTransform);
  const infectNode = useSimulationStore(state => state.infectNode);
  const shockNode = useSimulationStore(state => state.shockNode);
  const selectNode = useSimulationStore(state => state.selectNode);
  const hoverNode = useSimulationStore(state => state.hoverNode);
  const selectedNodeId = useSimulationStore(state => state.selectedNodeId);
  const hoveredNodeId = useSimulationStore(state => state.hoveredNodeId);
  
  // Get node color based on mode and state
  const getNodeColor = useCallback((node: SimulationNode) => {
    if (mode === 'epidemic') {
      return getEpidemicColor(node.epidemicState, colorBlindMode);
    }
    return getFinancialColor(node.financialState, colorBlindMode);
  }, [mode, colorBlindMode]);
  
  // Get node glow
  const getNodeGlow = useCallback((node: SimulationNode) => {
    const state = mode === 'epidemic' ? node.epidemicState : node.financialState;
    if (shouldGlow(state)) {
      return getGlowColor(state);
    }
    return 'none';
  }, [mode]);
  
  // Handle node click
  const handleNodeClick = useCallback((event: MouseEvent, node: SimulationNode) => {
    event.stopPropagation();
    
    if (mode === 'epidemic') {
      if (node.epidemicState === 'SUSCEPTIBLE') {
        infectNode(node.id);
      }
    } else {
      if (node.financialState === 'HEALTHY') {
        shockNode(node.id, 0.5);
      }
    }
    
    selectNode(node.id);
  }, [mode, infectNode, shockNode, selectNode]);
  
  // Initialize D3 visualization
  useEffect(() => {
    if (!svgRef.current || nodes.length === 0) return;
    
    const svg = d3.select(svgRef.current);
    
    // Clear existing content
    svg.selectAll('*').remove();
    
    // Create container group for zoom
    const container = svg.append('g').attr('class', 'container');
    
    // Apply initial transform
    container.attr('transform', `translate(${transform.x},${transform.y}) scale(${transform.k})`);
    
    // Setup zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.2, 4])
      .on('zoom', (event) => {
        container.attr('transform', event.transform.toString());
        setTransform({ x: event.transform.x, y: event.transform.y, k: event.transform.k });
      });
    
    svg.call(zoom);
    
    // Create arrow marker for directed edges (optional)
    svg.append('defs')
      .append('marker')
      .attr('id', 'arrowhead')
      .attr('viewBox', '-0 -5 10 10')
      .attr('refX', 20)
      .attr('refY', 0)
      .attr('orient', 'auto')
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .append('path')
      .attr('d', 'M 0,-5 L 10,0 L 0,5')
      .attr('fill', 'rgba(255,255,255,0.2)');
    
    // Create links
    const linkGroup = container.append('g').attr('class', 'links');
    
    // Create nodes
    const nodeGroup = container.append('g').attr('class', 'nodes');
    
    // Prepare link data with source/target as objects
    const linkData = links.map(l => ({
      ...l,
      source: nodes.find(n => n.id === l.sourceId) || l.sourceId,
      target: nodes.find(n => n.id === l.targetId) || l.targetId,
    }));
    
    // Create force simulation
    const simulation = d3.forceSimulation<SimulationNode>(nodes)
      .force('link', d3.forceLink<SimulationNode, SimulationLink>(linkData)
        .id(d => d.id)
        .distance(60)
        .strength(0.3))
      .force('charge', d3.forceManyBody().strength(-100))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide<SimulationNode>().radius(d => d.radius + 3))
      .force('x', d3.forceX(width / 2).strength(0.05))
      .force('y', d3.forceY(height / 2).strength(0.05));
    
    simulationRef.current = simulation;
    
    // Draw links
    const link = linkGroup
      .selectAll<SVGLineElement, typeof linkData[0]>('line')
      .data(linkData)
      .join('line')
      .attr('stroke', 'rgba(255,255,255,0.08)')
      .attr('stroke-width', 1);
    
    // Draw nodes
    const node = nodeGroup
      .selectAll<SVGCircleElement, SimulationNode>('circle')
      .data(nodes)
      .join('circle')
      .attr('r', d => d.radius)
      .attr('fill', d => getNodeColor(d))
      .attr('stroke', 'rgba(255,255,255,0.2)')
      .attr('stroke-width', 1.5)
      .style('cursor', 'pointer')
      .style('filter', d => {
        const glow = getNodeGlow(d);
        return glow !== 'none' ? `drop-shadow(0 0 8px ${glow})` : 'none';
      })
      .call(drag(simulation) as any);
    
    // Node event handlers
    node
      .on('click', function(event, d) {
        handleNodeClick(event, d);
      })
      .on('mouseenter', function(event, d) {
        hoverNode(d.id);
        d3.select(this)
          .transition()
          .duration(150)
          .attr('r', d.radius * 1.2);
      })
      .on('mouseleave', function(event, d) {
        hoverNode(null);
        d3.select(this)
          .transition()
          .duration(150)
          .attr('r', d.radius);
      });
    
    // Simulation tick handler
    simulation.on('tick', () => {
      link
        .attr('x1', d => (d.source as SimulationNode).x)
        .attr('y1', d => (d.source as SimulationNode).y)
        .attr('x2', d => (d.target as SimulationNode).x)
        .attr('y2', d => (d.target as SimulationNode).y);
      
      node
        .attr('cx', d => d.x)
        .attr('cy', d => d.y);
    });
    
    // Drag behavior
    function drag(simulation: d3.Simulation<SimulationNode, SimulationLink>) {
      function dragstarted(event: d3.D3DragEvent<SVGCircleElement, SimulationNode, SimulationNode>) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
      }
      
      function dragged(event: d3.D3DragEvent<SVGCircleElement, SimulationNode, SimulationNode>) {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
      }
      
      function dragended(event: d3.D3DragEvent<SVGCircleElement, SimulationNode, SimulationNode>) {
        if (!event.active) simulation.alphaTarget(0);
        event.subject.fx = null;
        event.subject.fy = null;
      }
      
      return d3.drag<SVGCircleElement, SimulationNode>()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended);
    }
    
    // Initial alpha decay
    simulation.alpha(1).restart();
    
    // Cleanup
    return () => {
      simulation.stop();
    };
  }, [nodes.length, links.length, width, height]); // Only re-init on structure change
  
  // Update colors when state changes (without recreating simulation)
  useEffect(() => {
    if (!svgRef.current || nodes.length === 0) return;
    
    const svg = d3.select(svgRef.current);
    
    svg.selectAll<SVGCircleElement, SimulationNode>('.nodes circle')
      .data(nodes)
      .transition()
      .duration(200)
      .attr('fill', d => getNodeColor(d))
      .style('filter', d => {
        const glow = getNodeGlow(d);
        return glow !== 'none' ? `drop-shadow(0 0 8px ${glow})` : 'none';
      });
    
    // Update link colors based on connected node states
    svg.selectAll<SVGLineElement, SimulationLink>('.links line')
      .transition()
      .duration(200)
      .attr('stroke', d => {
        const sourceId = typeof d.source === 'string' ? d.source : (d.source as SimulationNode).id;
        const targetId = typeof d.target === 'string' ? d.target : (d.target as SimulationNode).id;
        const sourceNode = nodes.find(n => n.id === sourceId);
        const targetNode = nodes.find(n => n.id === targetId);
        
        if (!sourceNode || !targetNode) return 'rgba(255,255,255,0.08)';
        
        const isActive = mode === 'epidemic'
          ? sourceNode.epidemicState === 'INFECTED' || targetNode.epidemicState === 'INFECTED'
          : (sourceNode.financialState === 'STRESSED' || sourceNode.financialState === 'DISTRESSED') ||
            (targetNode.financialState === 'STRESSED' || targetNode.financialState === 'DISTRESSED');
        
        return isActive ? 'rgba(239, 68, 68, 0.3)' : 'rgba(255,255,255,0.08)';
      });
  }, [nodes, mode, colorBlindMode, getNodeColor, getNodeGlow]);
  
  // Highlight selected/hovered node
  useEffect(() => {
    if (!svgRef.current) return;
    
    const svg = d3.select(svgRef.current);
    
    svg.selectAll<SVGCircleElement, SimulationNode>('.nodes circle')
      .attr('stroke', d => {
        if (d.id === selectedNodeId) return '#fff';
        if (d.id === hoveredNodeId) return 'rgba(255,255,255,0.5)';
        return 'rgba(255,255,255,0.2)';
      })
      .attr('stroke-width', d => {
        if (d.id === selectedNodeId) return 3;
        if (d.id === hoveredNodeId) return 2;
        return 1.5;
      });
  }, [selectedNodeId, hoveredNodeId]);
  
  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      className="bg-canvas"
      onClick={() => selectNode(null)}
    />
  );
}
