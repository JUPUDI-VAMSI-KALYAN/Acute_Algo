import React, { useEffect, useRef, useState } from 'react';

interface MermaidDiagramProps {
  chart: string;
  className?: string;
  id?: string;
}

const MermaidDiagram: React.FC<MermaidDiagramProps> = ({ 
  chart, 
  className = "", 
  id 
}) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mermaidReady, setMermaidReady] = useState(false);

  useEffect(() => {
    const loadMermaid = async () => {
      try {
        // Dynamically import mermaid
        const mermaid = (await import('mermaid')).default;
        
        // Initialize mermaid
        mermaid.initialize({
          startOnLoad: false,
          theme: 'default',
          securityLevel: 'loose',
          themeVariables: {
            primaryColor: '#3b82f6',
            primaryTextColor: '#1f2937',
            primaryBorderColor: '#1d4ed8',
            lineColor: '#6b7280',
            sectionBkgColor: '#f3f4f6',
            altSectionBkgColor: '#e5e7eb',
            gridColor: '#d1d5db',
            secondaryColor: '#10b981',
            tertiaryColor: '#f59e0b'
          },
          flowchart: {
            useMaxWidth: true,
            htmlLabels: true,
            curve: 'basis'
          }
        });

        setMermaidReady(true);
      } catch (err) {
        console.error('Failed to load Mermaid:', err);
        setError('Failed to load diagram renderer');
        setIsLoading(false);
      }
    };

    loadMermaid();
  }, []);

  useEffect(() => {
    if (!mermaidReady || !chart || !elementRef.current) {
      return;
    }

    const renderDiagram = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const mermaid = (await import('mermaid')).default;
        
        // Clear previous content
        if (elementRef.current) {
          elementRef.current.innerHTML = '';
        }

        // Generate unique ID for the diagram
        const diagramId = id || `mermaid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        // Validate and clean the chart syntax
        let cleanChart = chart.trim();
        
        // Remove any markdown code block syntax if present
        cleanChart = cleanChart.replace(/^```(?:mermaid)?\s*\n?/, '');
        cleanChart = cleanChart.replace(/\n?```\s*$/, '');
        
        // Clean up problematic syntax that can cause parsing errors
        cleanChart = cleanChart
          // Fix nested parentheses in round nodes - replace inner parentheses with square brackets
          .replace(/(\w+)\(([^)]*\([^)]*\)[^)]*)\)/g, (match, nodeId, nodeText) => {
            const cleanedText = nodeText.replace(/\(/g, '[').replace(/\)/g, ']');
            return `${nodeId}(${cleanedText})`;
          })
          // Fix square brackets inside node text - replace with parentheses
          .replace(/(\w+)\[([^\]]*\[[^\]]*\][^\]]*)\]/g, (match, nodeId, nodeText) => {
            const cleanedText = nodeText.replace(/\[/g, '(').replace(/\]/g, ')');
            return `${nodeId}[${cleanedText}]`;
          })
          // Replace mathematical operators and special characters
          .replace(/(\w+)(\[|\()([^)\]]*\*[^)\]]*)\)/g, (match, nodeId, bracket, nodeText) => {
            const cleanedText = nodeText.replace(/\*/g, ' times ');
            const closeBracket = bracket === '[' ? ']' : ')';
            return `${nodeId}${bracket}${cleanedText}${closeBracket}`;
          })
          .replace(/(\w+)(\[|\()([^)\]]*=[^)\]]*)\)/g, (match, nodeId, bracket, nodeText) => {
            const cleanedText = nodeText.replace(/=/g, ' equals ');
            const closeBracket = bracket === '[' ? ']' : ')';
            return `${nodeId}${bracket}${cleanedText}${closeBracket}`;
          })
          .replace(/(\w+)(\[|\()([^)\]]*\+[^)\]]*)\)/g, (match, nodeId, bracket, nodeText) => {
            const cleanedText = nodeText.replace(/\+/g, ' plus ');
            const closeBracket = bracket === '[' ? ']' : ')';
            return `${nodeId}${bracket}${cleanedText}${closeBracket}`;
          })
          .replace(/(\w+)(\[|\()([^)\]]*-[^)\]]*)\)/g, (match, nodeId, bracket, nodeText) => {
            const cleanedText = nodeText.replace(/-/g, ' minus ');
            const closeBracket = bracket === '[' ? ']' : ')';
            return `${nodeId}${bracket}${cleanedText}${closeBracket}`;
          })
          // Replace angle brackets and other problematic characters
          .replace(/(\w+)(\[|\()([^)\]]*<[^)\]]*)\)/g, (match, nodeId, bracket, nodeText) => {
            const cleanedText = nodeText.replace(/</g, ' less than ');
            const closeBracket = bracket === '[' ? ']' : ')';
            return `${nodeId}${bracket}${cleanedText}${closeBracket}`;
          })
          .replace(/(\w+)(\[|\()([^)\]]*>[^)\]]*)\)/g, (match, nodeId, bracket, nodeText) => {
            const cleanedText = nodeText.replace(/>/g, ' greater than ');
            const closeBracket = bracket === '[' ? ']' : ')';
            return `${nodeId}${bracket}${cleanedText}${closeBracket}`;
          })
          .replace(/(\w+)(\[|\()([^)\]]*&[^)\]]*)\)/g, (match, nodeId, bracket, nodeText) => {
            const cleanedText = nodeText.replace(/&/g, ' and ');
            const closeBracket = bracket === '[' ? ']' : ')';
            return `${nodeId}${bracket}${cleanedText}${closeBracket}`;
          })
          // Truncate overly long node text
          .replace(/(\w+)(\[|\()([^)\]]{25,})\)/g, (match, nodeId, bracket, nodeText) => {
            const closeBracket = bracket === '[' ? ']' : ')';
            let truncatedText = nodeText;
            
            if (nodeText.length > 25) {
              const words = nodeText.split(' ');
              if (words.length > 3) {
                truncatedText = words.slice(0, 3).join(' ') + '...';
              } else {
                truncatedText = nodeText.substring(0, 22) + '...';
              }
            }
            
            return `${nodeId}${bracket}${truncatedText}${closeBracket}`;
          });
        
        // Ensure the chart starts with a valid diagram type
        if (!cleanChart.match(/^(graph|flowchart|sequenceDiagram|classDiagram|stateDiagram|pie|journey|gitgraph)/i)) {
          // If no diagram type is specified, assume it's a flowchart
          if (!cleanChart.startsWith('flowchart') && !cleanChart.startsWith('graph')) {
            cleanChart = `flowchart TD\n${cleanChart}`;
          }
        }

        // Parse and validate the diagram
        const parseResult = await mermaid.parse(cleanChart);
        if (!parseResult) {
          throw new Error('Invalid Mermaid syntax');
        }

        // Render the diagram
        const { svg } = await mermaid.render(diagramId, cleanChart);
        
        if (elementRef.current) {
          elementRef.current.innerHTML = svg;
          
          // Add click handlers to make the diagram interactive
          const svgElement = elementRef.current.querySelector('svg');
          if (svgElement) {
            svgElement.style.maxWidth = '100%';
            svgElement.style.height = 'auto';
            
            // Add zoom and pan functionality
            svgElement.addEventListener('wheel', (e) => {
              e.preventDefault();
              const scale = e.deltaY > 0 ? 0.9 : 1.1;
              const currentTransform = svgElement.style.transform || 'scale(1)';
              const currentScale = parseFloat(currentTransform.match(/scale\(([^)]+)\)/)?.[1] || '1');
              const newScale = Math.max(0.5, Math.min(3, currentScale * scale));
              svgElement.style.transform = `scale(${newScale})`;
            });
          }
        }

        setIsLoading(false);
      } catch (err) {
        console.error('Mermaid render error:', err);
        setError(err instanceof Error ? err.message : 'Failed to render diagram');
        setIsLoading(false);
        
        // Fallback: show the raw chart text
        if (elementRef.current) {
          elementRef.current.innerHTML = `
            <div class="bg-red-50 border border-red-200 rounded-lg p-4">
              <p class="text-red-700 font-medium mb-2">Failed to render diagram</p>
              <pre class="text-sm text-gray-600 bg-gray-100 p-2 rounded overflow-auto">${chart}</pre>
            </div>
          `;
        }
      }
    };

    renderDiagram();
  }, [chart, mermaidReady, id]);

  if (!mermaidReady) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading diagram renderer...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
        <p className="text-red-700 font-medium mb-2">Error rendering diagram</p>
        <p className="text-sm text-gray-600">{error}</p>
        <details className="mt-2">
          <summary className="text-sm text-gray-500 cursor-pointer">Show raw diagram code</summary>
          <pre className="text-xs text-gray-600 bg-gray-100 p-2 rounded mt-1 overflow-auto">{chart}</pre>
        </details>
      </div>
    );
  }

  return (
    <div className={className}>
      {isLoading && (
        <div className="flex items-center justify-center p-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Rendering diagram...</span>
        </div>
      )}
      <div 
        ref={elementRef} 
        className="mermaid-container"
        style={{ 
          textAlign: 'center',
          overflow: 'auto',
          maxHeight: '600px'
        }}
      />
    </div>
  );
};

export default MermaidDiagram; 