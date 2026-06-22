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
    <div className="bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800 hover:border-emerald-500/40 dark:hover:border-emerald-500/40 rounded-2xl p-4 my-2 transition-all shadow-sm hover:shadow-md flex flex-col w-full relative group rtl:text-right">
      
      {/* Top Header: Title, Company, Location & Match Score */}
      <div className="flex justify-between items-start gap-4 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-slate-900 dark:text-white text-[15px] sm:text-[16px] leading-tight mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors break-words">
            {job.title}
          </h3>
          
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[12.5px] text-slate-600 dark:text-slate-400 font-medium">
            <div className="flex items-center gap-1 shrink-0">
              <Building2 className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
              <span className="truncate max-w-[150px] sm:max-w-[200px]">{job.company}</span>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <MapPin className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
              <span className="truncate max-w-[120px] sm:max-w-[180px]">{job.location}</span>
            </div>
          </div>
        </div>

        {job.matchScore && (
          <div className="shrink-0 flex flex-col items-center justify-center bg-slate-50 dark:bg-[#1e293b]/50 border border-slate-100 dark:border-slate-800 rounded-xl px-2.5 py-1.5 shadow-sm min-w-[54px]">
            <span className={`text-[14px] font-extrabold ${
              Number(job.matchScore) >= 80 ? 'text-emerald-600 dark:text-emerald-400' :
              Number(job.matchScore) >= 60 ? 'text-yellow-600 dark:text-yellow-400' :
              'text-slate-600 dark:text-slate-400'
            }`}>
              {job.matchScore}%
            </span>
            <span className="text-[8px] font-bold text-slate-500 dark:text-slate-500 uppercase tracking-widest mt-0.5">
              Match
            </span>
          </div>
        )}
      </div>
      
      {/* Short Match Reason */}
      {(job.whyMatches || job.summary) && (
        <div className="mb-3.5">
          <p className="text-[12px] text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-1">
             <span className="font-bold text-emerald-600 dark:text-emerald-500 mr-1.5 rtl:ml-1.5 rtl:mr-0">✦</span>
             {job.whyMatches || job.summary}
          </p>
        </div>
      )}

      {/* Action Footer */}
      <div className="flex flex-row justify-between items-center mt-auto pt-3 border-t border-slate-100 dark:border-slate-800/80 gap-3">
        {job.source ? (
          <div className="flex bg-slate-100 dark:bg-slate-800/80 px-2 py-1 rounded text-slate-600 dark:text-slate-400 text-[11px] font-medium items-center gap-1.5 shrink min-w-0">
            <Briefcase className="w-3 h-3 shrink-0 text-slate-500" />
            <span className="truncate">{job.source}</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[11px] shrink min-w-0">
            <ExternalLink className="w-3 h-3 shrink-0" />
            <span className="truncate">{hostname}</span>
          </div>
        )}

        <div className="flex items-center gap-2">
          <a
             href={`https://www.google.com/search?q=${encodeURIComponent((job.title || "") + " " + (job.company || "") + " job")}`}
             target="_blank"
             rel="noopener noreferrer"
             className="shrink-0 flex items-center justify-center gap-1.5 px-3 py-1.5 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium rounded-lg transition-colors text-[12px]"
          >
             {isRtl ? "عرض التفاصيل" : "Job Details"}
          </a>
          <a
            href={finalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 flex items-center justify-center gap-1.5 px-4 py-1.5 bg-slate-900 dark:bg-white hover:bg-emerald-600 dark:hover:bg-emerald-500 text-white dark:text-slate-900 dark:hover:text-white font-semibold rounded-lg transition-colors shadow-sm text-[12px]"
          >
            <span>{isRtl ? "التقديم الآن" : "Apply Now"}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
