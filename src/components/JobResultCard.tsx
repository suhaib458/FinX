import React from "react";
import { ExternalLink, MapPin, Building2, Briefcase } from "lucide-react";

export interface JobData {
  title: string;
  company: string;
  location: string;
  url: string;
  summary?: string;
  matchScore?: string | number;
  whyMatches?: string;
  missingSkills?: string;
  source?: string;
}

interface JobResultCardProps {
  job: JobData;
  extractMetadata?: any[]; // groundingChunks Array
  isRtl?: boolean;
}

export default function JobResultCard({ job, extractMetadata, isRtl }: JobResultCardProps) {
  let finalUrl = job.url;
  
  const isVertexRedirect = job.url?.includes("vertexaisearch.cloud.google.com/grounding-api-redirect");
  
  if (isVertexRedirect) {
    if (extractMetadata && extractMetadata.length > 0) {
      // Find the best match
      console.log(`[Job Diagnostics] Original Grounding URL: ${job.url}`);
      
      const realUrls = extractMetadata.map((c: any) => c.web?.uri).filter(Boolean);
      console.log(`[Job Diagnostics] Extracted Public URLs from Grounding:`, realUrls);
      
      // Match by company name, linkedin, indeed, glassdoor, or fallback
      const c = (job.company || "").toLowerCase().split(" ")[0] || "unknown"; // basic match word
      const bestMatch = realUrls.find(u => {
         const lu = u.toLowerCase();
         return lu.includes("linkedin.com") || lu.includes("indeed.com") || lu.includes("glassdoor.com") || lu.includes("wellfound.com") || lu.includes(c);
      }) || realUrls[0]; 
      
      if (bestMatch) {
         finalUrl = bestMatch;
         console.log(`[Job Diagnostics] URL Validation Result: Replaced with Original Source URL`);
      } else {
         finalUrl = `https://www.google.com/search?q=${encodeURIComponent((job.title || "") + " " + (job.company || "") + " job")}`;
         console.log(`[Job Diagnostics] URL Validation Result: Failed to extract public URL. Using fallback.`);
      }
    } else {
      finalUrl = `https://www.google.com/search?q=${encodeURIComponent((job.title || "") + " " + (job.company || "") + " job")}`;
      console.log(`[Job Diagnostics] URL Validation Result: Missing grounding metadata. Using fallback.`);
    }
  } else {
     if (!finalUrl || finalUrl === "#") {
        console.log(`[Job Diagnostics] URL Validation Result: No valid URL. Using fallback.`);
        finalUrl = `https://www.google.com/search?q=${encodeURIComponent((job.title || "") + " " + (job.company || "") + " job")}`;
     }
     console.log(`[Job Diagnostics] Final URL sent to UI: ${finalUrl}`);
  }

  let hostname = "View Source";
  try {
     hostname = new URL(finalUrl).hostname.replace('www.', '');
  } catch (e) {
     // Fallback
  }

  return (
    <div className="bg-surface-primary border border-border-primary/80 hover:border-slate-300 dark:hover:border-slate-700 rounded-xl p-3.5 my-1.5 transition-all shadow-sm hover:shadow flex flex-col w-full relative group rtl:text-right gap-2.5">
      
      {/* Top Header: Title, Company, Location & Match Score */}
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm sm:text-[15px] leading-tight mb-1 transition-colors truncate">
            {job.title}
          </h3>
          
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[12px] text-text-secondary font-medium">
            {job.company && (
              <div className="flex items-center gap-1 shrink-0">
                <Building2 className="w-3 h-3 text-text-secondary" />
                <span className="truncate max-w-[130px] sm:max-w-[160px] text-text-primary">{job.company}</span>
              </div>
            )}
            {job.location && (
              <div className="flex items-center gap-1 shrink-0">
                <MapPin className="w-3 h-3 text-text-secondary" />
                <span className="truncate max-w-[110px] sm:max-w-[140px]">{job.location}</span>
              </div>
            )}
          </div>
        </div>

        {job.matchScore && (
          <div className="shrink-0 flex flex-col items-center justify-center bg-indigo-50/50 dark:bg-indigo-500/10 border border-indigo-100/50 dark:border-indigo-500/20 rounded-md px-2 py-1 min-w-[42px] shadow-sm">
            <span className={`text-[12px] font-bold ${
              Number(job.matchScore) >= 80 ? 'text-accent-green' :
              Number(job.matchScore) >= 60 ? 'text-accent-orange' :
              'text-text-secondary'
            }`}>
              {job.matchScore}%
            </span>
          </div>
        )}
      </div>
      
      {/* Short Match Reason */}
      {(job.whyMatches || job.summary) && (
        <div className="mt-0.5">
          <p className="text-[12px] text-text-secondary leading-snug line-clamp-1">
             <span className="font-bold text-indigo-500 dark:text-indigo-400 mr-1.5 rtl:ml-1.5 rtl:mr-0 inline-block align-middle pb-0.5">✦</span>
             <span className="align-middle">{job.whyMatches || job.summary}</span>
          </p>
        </div>
      )}

      {/* Action Footer */}
      <div className="flex items-center justify-between mt-1 pt-2.5 border-t border-border-primary/60 gap-3">
        <div className="text-[11px] text-text-secondary dark:text-text-secondary flex items-center gap-1.5 font-medium min-w-0">
          <Briefcase className="w-3 h-3 shrink-0" />
          <span className="truncate">{job.source || hostname}</span>
        </div>

        <a
          href={finalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-900 font-medium rounded-lg transition-colors shadow-sm text-[11px]"
        >
          <span>{isRtl ? "التقديم الآن" : "Apply Now"}</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
}
