import React from 'react';
import { chartRegistry } from './InteractiveCharts';

// Lightweight markdown-to-React renderer for blog posts and case studies
// Handles: headings, paragraphs, bold, italic, inline code, code blocks,
// blockquotes, lists, tables, horizontal rules, links, custom callouts,
// and interactive chart embeds via {{chart:id}} syntax

interface MarkdownRendererProps {
  content: string;
}

// Parse inline formatting: **bold**, *italic*, `code`, [link](url)
function renderInline(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    // Bold **text**
    const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
    // Italic *text* (not preceded by *)
    const italicMatch = remaining.match(/(?<!\*)\*([^*]+?)\*(?!\*)/);
    // Inline code `text`
    const codeMatch = remaining.match(/`([^`]+?)`/);
    // Link [text](url)
    const linkMatch = remaining.match(/\[([^\]]+?)\]\(([^)]+?)\)/);

    // Find earliest match
    const matches = [
      boldMatch ? { type: 'bold', match: boldMatch, index: boldMatch.index! } : null,
      italicMatch ? { type: 'italic', match: italicMatch, index: italicMatch.index! } : null,
      codeMatch ? { type: 'code', match: codeMatch, index: codeMatch.index! } : null,
      linkMatch ? { type: 'link', match: linkMatch, index: linkMatch.index! } : null,
    ].filter(Boolean).sort((a, b) => a!.index - b!.index);

    if (matches.length === 0) {
      parts.push(remaining);
      break;
    }

    const first = matches[0]!;
    const before = remaining.slice(0, first.index);
    if (before) parts.push(before);

    switch (first.type) {
      case 'bold':
        parts.push(<strong key={key++} style={{ color: 'rgba(255,255,255,0.95)', fontFamily: 'NeueMontreal-Medium, sans-serif' }}>{first.match[1]}</strong>);
        remaining = remaining.slice(first.index + first.match[0].length);
        break;
      case 'italic':
        parts.push(<em key={key++} style={{ color: 'rgba(255,255,255,0.95)' }}>{first.match[1]}</em>);
        remaining = remaining.slice(first.index + first.match[0].length);
        break;
      case 'code':
        parts.push(
          <code key={key++} style={{
            fontFamily: 'monospace',
            fontSize: '0.85em',
            padding: '0.15em 0.4em',
            borderRadius: '4px',
            background: 'rgba(255,255,255,0.08)',
            color: 'rgba(255,255,255,0.95)'
          }}>{first.match[1]}</code>
        );
        remaining = remaining.slice(first.index + first.match[0].length);
        break;
      case 'link':
        parts.push(
          <a key={key++} href={first.match[2]} target="_blank" rel="noopener noreferrer" style={{
            color: '#60A5FA',
            textDecoration: 'underline',
            textDecorationColor: 'rgba(96, 165, 250, 0.3)',
            textUnderlineOffset: '2px'
          }}>{first.match[1]}</a>
        );
        remaining = remaining.slice(first.index + first.match[0].length);
        break;
    }
  }

  return parts;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  const elements: React.ReactNode[] = [];
  let key = 0;

  // Strip HTML callout divs and convert to simple text blocks
  let cleaned = content
    // Remove callout wrapper divs
    .replace(/<div class="callout[^"]*">/g, '---callout-start---')
    .replace(/<div class="callout-header">[\s\S]*?<\/div>/g, '')
    .replace(/<div class="callout-content">/g, '')
    .replace(/<\/div>\s*<\/div>\s*<\/div>/g, '---callout-end---')
    .replace(/<\/div>/g, '')
    // Remove other HTML tags
    .replace(/<hr[^>]*\/?>/, '---')
    .replace(/<span[^>]*>/g, '')
    .replace(/<\/span>/g, '')
    // Remove the title heading (first # heading) since we show it in the header
    .replace(/^#\s+.+\n/, '');

  // Split into blocks by code fences first
  const codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g;
  const segments: { type: 'text' | 'code'; content: string; lang?: string }[] = [];
  let lastIndex = 0;
  let codeMatch;

  while ((codeMatch = codeBlockRegex.exec(cleaned)) !== null) {
    if (codeMatch.index > lastIndex) {
      segments.push({ type: 'text', content: cleaned.slice(lastIndex, codeMatch.index) });
    }
    segments.push({ type: 'code', content: codeMatch[2], lang: codeMatch[1] || undefined });
    lastIndex = codeMatch.index + codeMatch[0].length;
  }
  if (lastIndex < cleaned.length) {
    segments.push({ type: 'text', content: cleaned.slice(lastIndex) });
  }

  for (const segment of segments) {
    if (segment.type === 'code') {
      elements.push(
        <pre key={key++} style={{
          background: 'rgba(0, 0, 0, 0.4)',
          border: '0.5px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '8px',
          padding: '1rem 1.25rem',
          overflowX: 'auto',
          margin: '1.5rem 0',
          fontSize: '0.82rem',
          lineHeight: '1.6'
        }}>
          <code style={{
            fontFamily: '"SF Mono", "Fira Code", "Consolas", monospace',
            color: 'rgba(255, 255, 255, 0.92)',
            whiteSpace: 'pre'
          }}>
            {segment.content.trimEnd()}
          </code>
        </pre>
      );
      continue;
    }

    // Process text blocks
    const lines = segment.content.split('\n');
    let i = 0;

    while (i < lines.length) {
      const line = lines[i].trim();

      // Skip empty lines
      if (!line) { i++; continue; }

      // Skip callout markers
      if (line.startsWith('---callout-start---') || line.startsWith('---callout-end---')) { i++; continue; }

      // Horizontal rule
      if (/^-{3,}$/.test(line)) {
        elements.push(<hr key={key++} style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.1)', margin: '2rem 0' }} />);
        i++;
        continue;
      }

      // Heading
      if (line.startsWith('### ')) {
        elements.push(
          <h3 key={key++} style={{
            fontFamily: 'NeueMontreal-Medium, sans-serif',
            fontSize: '1.1rem',
            color: 'rgba(255, 255, 255, 0.95)',
            margin: '2rem 0 0.75rem',
            fontWeight: 500
          }}>
            {renderInline(line.slice(4))}
          </h3>
        );
        i++;
        continue;
      }

      if (line.startsWith('## ')) {
        elements.push(
          <h2 key={key++} style={{
            fontFamily: 'NeueMontreal-Medium, sans-serif',
            fontSize: '1.35rem',
            color: 'white',
            margin: '2.5rem 0 1rem',
            fontWeight: 500,
            paddingBottom: '0.5rem',
            borderBottom: '1px solid rgba(255,255,255,0.08)'
          }}>
            {renderInline(line.slice(3))}
          </h2>
        );
        i++;
        continue;
      }

      // Blockquote
      if (line.startsWith('> ')) {
        const quoteLines: string[] = [];
        while (i < lines.length && lines[i].trim().startsWith('> ')) {
          quoteLines.push(lines[i].trim().slice(2));
          i++;
        }
        elements.push(
          <blockquote key={key++} style={{
            borderLeft: '3px solid rgba(255,255,255,0.2)',
            paddingLeft: '1rem',
            margin: '1.5rem 0',
            color: 'rgba(255,255,255,0.85)',
            fontStyle: 'italic',
            fontFamily: 'NeueMontreal-Light, sans-serif',
            lineHeight: '1.7'
          }}>
            {renderInline(quoteLines.join(' '))}
          </blockquote>
        );
        continue;
      }

      // Table
      if (line.includes('|') && line.startsWith('|')) {
        const tableLines: string[] = [];
        while (i < lines.length && lines[i].trim().startsWith('|')) {
          tableLines.push(lines[i].trim());
          i++;
        }
        // Parse table
        const headers = tableLines[0].split('|').filter(c => c.trim()).map(c => c.trim());
        // Skip separator line (|---|---|)
        const dataRows = tableLines.slice(2).map(row =>
          row.split('|').filter(c => c.trim()).map(c => c.trim())
        );

        elements.push(
          <div key={key++} style={{ overflowX: 'auto', margin: '1.5rem 0' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '0.85rem',
              fontFamily: 'NeueMontreal-Light, sans-serif'
            }}>
              <thead>
                <tr>
                  {headers.map((h, hi) => (
                    <th key={hi} style={{
                      textAlign: 'left',
                      padding: '0.6rem 0.8rem',
                      borderBottom: '1px solid rgba(255,255,255,0.2)',
                      color: 'rgba(255,255,255,0.95)',
                      fontFamily: 'NeueMontreal-Medium, sans-serif',
                      fontWeight: 500,
                      whiteSpace: 'nowrap'
                    }}>{renderInline(h)}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dataRows.map((row, ri) => (
                  <tr key={ri}>
                    {row.map((cell, ci) => (
                      <td key={ci} style={{
                        padding: '0.5rem 0.8rem',
                        borderBottom: '0.5px solid rgba(255,255,255,0.08)',
                        color: 'rgba(255,255,255,0.85)',
                        whiteSpace: 'nowrap'
                      }}>{renderInline(cell)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        continue;
      }

      // Unordered list
      if (line.startsWith('- ') || line.startsWith('* ')) {
        const listItems: string[] = [];
        while (i < lines.length && (lines[i].trim().startsWith('- ') || lines[i].trim().startsWith('* '))) {
          listItems.push(lines[i].trim().slice(2));
          i++;
        }
        elements.push(
          <ul key={key++} style={{
            fontFamily: 'NeueMontreal-Light, sans-serif',
            color: 'rgba(255,255,255,0.92)',
            fontSize: '0.9rem',
            lineHeight: '1.7',
            margin: '1rem 0',
            paddingLeft: '1.25rem'
          }}>
            {listItems.map((item, li) => (
              <li key={li} style={{ marginBottom: '0.4rem' }}>{renderInline(item)}</li>
            ))}
          </ul>
        );
        continue;
      }

      // Ordered list
      if (/^\d+\.\s/.test(line)) {
        const listItems: string[] = [];
        while (i < lines.length && /^\d+\.\s/.test(lines[i].trim())) {
          listItems.push(lines[i].trim().replace(/^\d+\.\s/, ''));
          i++;
        }
        elements.push(
          <ol key={key++} style={{
            fontFamily: 'NeueMontreal-Light, sans-serif',
            color: 'rgba(255,255,255,0.92)',
            fontSize: '0.9rem',
            lineHeight: '1.7',
            margin: '1rem 0',
            paddingLeft: '1.25rem'
          }}>
            {listItems.map((item, li) => (
              <li key={li} style={{ marginBottom: '0.4rem' }}>{renderInline(item)}</li>
            ))}
          </ol>
        );
        continue;
      }

      // Interactive chart embed: {{chart:chartId}}
      const chartMatch = line.match(/^\{\{chart:([a-z0-9-]+)\}\}$/);
      if (chartMatch) {
        const ChartComponent = chartRegistry[chartMatch[1]];
        if (ChartComponent) {
          elements.push(<ChartComponent key={key++} />);
        }
        i++;
        continue;
      }

      // Math blocks ($$...$$) - render as styled code
      if (line.startsWith('$$')) {
        const mathLines: string[] = [];
        i++; // skip opening $$
        while (i < lines.length && !lines[i].trim().startsWith('$$')) {
          mathLines.push(lines[i]);
          i++;
        }
        i++; // skip closing $$
        elements.push(
          <div key={key++} style={{
            background: 'rgba(99, 102, 241, 0.08)',
            border: '0.5px solid rgba(99, 102, 241, 0.2)',
            borderRadius: '8px',
            padding: '1rem 1.25rem',
            margin: '1.5rem 0',
            textAlign: 'center',
            fontFamily: '"Georgia", serif',
            fontSize: '1rem',
            color: 'rgba(255, 255, 255, 0.92)',
            fontStyle: 'italic'
          }}>
            {mathLines.join('\n')}
          </div>
        );
        continue;
      }

      // Default: paragraph - collect consecutive non-special lines
      const paraLines: string[] = [];
      while (i < lines.length) {
        const l = lines[i].trim();
        if (!l || l.startsWith('#') || l.startsWith('- ') || l.startsWith('* ') || l.startsWith('> ') || l.startsWith('|') || l.startsWith('$$') || /^\d+\.\s/.test(l) || /^-{3,}$/.test(l) || l.startsWith('---callout')) break;
        paraLines.push(l);
        i++;
      }
      if (paraLines.length > 0) {
        const joined = paraLines.join(' ');
        const isFullyBold = joined.startsWith('**') && joined.endsWith('**') && !joined.slice(2, -2).includes('**');
        elements.push(
          <p key={key++} style={{
            fontFamily: isFullyBold ? 'NeueMontreal-Medium, sans-serif' : 'NeueMontreal-Light, sans-serif',
            color: isFullyBold ? 'white' : 'rgba(255, 255, 255, 0.92)',
            fontSize: isFullyBold ? '1.35rem' : '0.9rem',
            lineHeight: isFullyBold ? '1.4' : '1.8',
            margin: isFullyBold ? '2.5rem 0 1rem' : '1rem 0',
            fontWeight: isFullyBold ? 500 : undefined
          }}>
            {isFullyBold ? joined.slice(2, -2) : renderInline(joined)}
          </p>
        );
      }
    }
  }

  return <>{elements}</>;
};

export default MarkdownRenderer;
