import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface MarkdownContentProps {
  content: string;
}

export const MarkdownContent: React.FC<MarkdownContentProps> = ({ content }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = (code: string, index: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Parse lines into structured blocks
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeLanguage = '';
  let codeBuffer: string[] = [];
  let codeBlockIndex = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Code block boundaries
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        // Closing code block
        const fullCode = codeBuffer.join('\n');
        const currentIndex = codeBlockIndex++;
        const isCopied = copiedIndex === currentIndex;

        elements.push(
          <div key={`code-${currentIndex}`} className="my-3 rounded-xl overflow-hidden border border-slate-700/60 bg-slate-950 text-slate-100 text-xs font-mono shadow-sm">
            <div className="px-3.5 py-1.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
              <span className="font-semibold uppercase tracking-wider">{codeLanguage || 'code'}</span>
              <button
                onClick={() => handleCopy(fullCode, currentIndex)}
                className="flex items-center gap-1 hover:text-slate-200 transition-colors"
                title="Copy code"
              >
                {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{isCopied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
            <pre className="p-3.5 overflow-x-auto leading-relaxed">
              <code>{fullCode}</code>
            </pre>
          </div>
        );

        codeBuffer = [];
        inCodeBlock = false;
      } else {
        // Opening code block
        inCodeBlock = true;
        codeLanguage = line.trim().replace(/^```/, '').trim();
      }
      continue;
    }

    if (inCodeBlock) {
      codeBuffer.push(line);
      continue;
    }

    // Headings
    if (line.startsWith('### ')) {
      elements.push(
        <h3 key={`h3-${i}`} className="text-sm font-bold text-slate-900 dark:text-white mt-3.5 mb-1.5 font-heading">
          {formatInline(line.replace('### ', ''))}
        </h3>
      );
      continue;
    }

    if (line.startsWith('#### ')) {
      elements.push(
        <h4 key={`h4-${i}`} className="text-xs font-bold text-slate-800 dark:text-slate-100 mt-2.5 mb-1 font-heading">
          {formatInline(line.replace('#### ', ''))}
        </h4>
      );
      continue;
    }

    // Blockquote
    if (line.startsWith('> ')) {
      elements.push(
        <blockquote key={`quote-${i}`} className="my-2 pl-3 border-l-2 border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/30 p-2 rounded-r-lg text-xs text-slate-700 dark:text-slate-300 italic">
          {formatInline(line.replace(/^>\s*/, ''))}
        </blockquote>
      );
      continue;
    }

    // Bullet points
    if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
      elements.push(
        <li key={`li-${i}`} className="ml-4 list-disc text-xs text-slate-800 dark:text-slate-200 my-1 leading-relaxed">
          {formatInline(line.trim().replace(/^[-*]\s*/, ''))}
        </li>
      );
      continue;
    }

    // Numbered list
    const numMatch = line.trim().match(/^(\d+)\.\s*(.*)/);
    if (numMatch) {
      elements.push(
        <div key={`num-${i}`} className="ml-2 flex items-start gap-2 text-xs text-slate-800 dark:text-slate-200 my-1 leading-relaxed">
          <span className="font-bold text-indigo-600 dark:text-indigo-400 shrink-0">{numMatch[1]}.</span>
          <span>{formatInline(numMatch[2])}</span>
        </div>
      );
      continue;
    }

    // Tables or standard paragraph
    if (line.trim() === '') {
      elements.push(<div key={`sp-${i}`} className="h-2" />);
      continue;
    }

    elements.push(
      <p key={`p-${i}`} className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed my-1">
        {formatInline(line)}
      </p>
    );
  }

  // Handle unclosed code block if stream cut off
  if (inCodeBlock && codeBuffer.length > 0) {
    elements.push(
      <div key="unclosed-code" className="my-2 p-3 rounded-xl bg-slate-950 text-slate-100 text-xs font-mono">
        <pre className="overflow-x-auto">
          <code>{codeBuffer.join('\n')}</code>
        </pre>
      </div>
    );
  }

  return <div className="space-y-1">{elements}</div>;
};

// Helper for inline bold, italic, and inline code formatting
function formatInline(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  let keyIdx = 0;

  // Split by inline code `...`
  const codeRegex = /`([^`]+)`/g;
  let match;
  let lastIndex = 0;

  while ((match = codeRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(...formatBoldItalic(text.slice(lastIndex, match.index), keyIdx++));
    }
    parts.push(
      <code key={`code-${keyIdx++}`} className="px-1.5 py-0.5 mx-0.5 rounded-md bg-slate-200 dark:bg-slate-750 text-indigo-600 dark:text-indigo-300 font-mono text-[11px] font-semibold">
        {match[1]}
      </code>
    );
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(...formatBoldItalic(text.slice(lastIndex), keyIdx++));
  }

  return parts.length > 0 ? parts : text;
}

function formatBoldItalic(text: string, baseKey: number): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  // Bold **text**
  const boldRegex = /\*\*([^*]+)\*\*/g;
  let match;
  let lastIndex = 0;
  let k = 0;

  while ((match = boldRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    parts.push(
      <strong key={`b-${baseKey}-${k++}`} className="font-bold text-slate-900 dark:text-white">
        {match[1]}
      </strong>
    );
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts;
}
