import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  ShieldCheck,
  ExternalLink,
  BookOpen,
  Code2,
  Video,
  FileText,
  Clock,
} from 'lucide-react';
import { api } from '../api/client';

interface SkillDetailPanelProps {
  skillId: string | null;
  onClose: () => void;
}

export const SkillDetailPanel: React.FC<SkillDetailPanelProps> = ({ skillId, onClose }) => {
  const navigate = useNavigate();
  const [resources, setResources] = useState<any[]>([]);
  const [skillInfo, setSkillInfo] = useState<any>(null);
  const [, setIsLoading] = useState(false);

  useEffect(() => {
    if (!skillId) return;

    const fetchSkillData = async () => {
      setIsLoading(true);
      try {
        const [resList, allSkills] = await Promise.all([
          api.getResources(skillId),
          api.getSkills(),
        ]);
        setResources(resList);
        const match = allSkills.find((s) => s.skill_id === skillId || s.name.toLowerCase() === skillId.toLowerCase());
        setSkillInfo(match || { name: skillId.replace('-', ' ').toUpperCase(), category: 'Engineering', description: 'Technical competency in curriculum.' });
      } catch (err) {
        console.warn('Failed loading skill details', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSkillData();
  }, [skillId]);

  if (!skillId) return null;

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="w-3.5 h-3.5 text-rose-500" />;
      case 'doc':
        return <FileText className="w-3.5 h-3.5 text-blue-500" />;
      case 'exercise':
        return <Code2 className="w-3.5 h-3.5 text-emerald-500" />;
      default:
        return <BookOpen className="w-3.5 h-3.5 text-indigo-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
              {skillInfo?.category || 'Skill Detail'}
            </span>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-2">
              {skillInfo?.name || skillId}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              {skillInfo?.description}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Button: Take assessment */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800">
          <button
            onClick={() => {
              onClose();
              navigate(`/assessments?skill=${skillId}`);
            }}
            className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all hover:scale-102"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Launch Verified Assessment for {skillInfo?.name || skillId}</span>
          </button>
        </div>

        {/* Curated Resources List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400 uppercase font-bold tracking-wider">
            <span>Curated Learning Materials ({resources.length})</span>
          </div>

          {resources.length > 0 ? (
            resources.map((res) => (
              <div
                key={res.id}
                className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="p-1 rounded-md bg-slate-100 dark:bg-slate-800">
                      {getItemIcon(res.type)}
                    </span>
                    <span className="text-[10px] uppercase font-bold text-slate-400">
                      {res.type}
                    </span>
                    <span className="text-[10px] text-slate-400">• {res.provider}</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-snug">
                    {res.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                    {res.description}
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400 text-[11px] flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {res.estimated_hours}h
                  </span>
                  <a
                    href={res.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                  >
                    <span>View Resource</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-xs text-slate-400">
              No specific resources found in catalog.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
