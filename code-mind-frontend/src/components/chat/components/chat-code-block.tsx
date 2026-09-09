import { useState, useMemo } from "react";
import { Check, Copy, Code2 } from "lucide-react";
import Prism from "prismjs";
import "prismjs/components/prism-java";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-json";
import "prismjs/components/prism-yaml";
import "prismjs/components/prism-sql";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-python";
import "prismjs/components/prism-markdown";
import { Button } from "@/components/ui/button";

interface ChatCodeBlockProps {
  language?: string;
  code: string;
}

export function ChatCodeBlock({ language = "text", code }: ChatCodeBlockProps) {
  const [copied, setCopied] = useState(false);

  // Normalize language name (e.g., "language-java" -> "java")
  const cleanLang = useMemo(() => {
    const l = language.replace(/^language-/, "").toLowerCase();
    if (l === "ts") return "typescript";
    if (l === "js") return "javascript";
    if (l === "py") return "python";
    if (l === "sh") return "bash";
    if (l === "yml") return "yaml";
    return l;
  }, [language]);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const highlightedHtml = useMemo(() => {
    const grammar = Prism.languages[cleanLang];
    if (grammar) {
      try {
        return Prism.highlight(code, grammar, cleanLang);
      } catch {
        return null;
      }
    }
    return null;
  }, [code, cleanLang]);

  return (
    <div className="my-3 rounded-lg border border-border/80 overflow-hidden bg-zinc-950 dark:bg-zinc-900/90 shadow-sm text-zinc-100">
      {/* Header bar with language label & Copy button */}
      <div className="flex items-center justify-between px-3.5 py-1.5 bg-zinc-900/90 dark:bg-zinc-900 border-b border-zinc-800 text-xs">
        <div className="flex items-center gap-1.5 text-zinc-400 font-mono text-[11px]">
          <Code2 className="h-3.5 w-3.5 text-primary" />
          <span className="uppercase font-semibold tracking-wider text-zinc-300">
            {cleanLang}
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="h-6 px-2 text-[11px] text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/80 gap-1.5 cursor-pointer font-sans"
        >
          {copied ? (
            <>
              <Check className="h-3 w-3 text-emerald-400" />
              <span className="text-emerald-400 font-medium">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" />
              <span>Copy</span>
            </>
          )}
        </Button>
      </div>

      {/* Code contents with horizontal scrolling */}
      <pre className="p-3.5 overflow-x-auto text-xs font-mono leading-relaxed select-text">
        {highlightedHtml ? (
          <code
            className={`language-${cleanLang}`}
            dangerouslySetInnerHTML={{ __html: highlightedHtml }}
          />
        ) : (
          <code>{code}</code>
        )}
      </pre>
    </div>
  );
}
