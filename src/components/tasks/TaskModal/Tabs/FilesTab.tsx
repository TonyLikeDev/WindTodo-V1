"use client";

import React from "react";
import { 
  File, 
  Upload, 
  Trash2, 
  Download,
  Image as ImageIcon,
  FileCode,
  FileText
} from "lucide-react";

export default function FilesTab({ task }: { task: any }) {
  const attachments = task?.attachments || [];

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <ImageIcon size={20} className="text-pink-500" />;
    if (type.includes('javascript') || type.includes('typescript')) return <FileCode size={20} className="text-blue-500" />;
    return <FileText size={20} className="text-muted-foreground" />;
  };

  return (
    <div className="space-y-8">
      {/* Upload Zone */}
      <div className="glass p-10 rounded-[2.5rem] border-2 border-dashed border-white/60 bg-white/20 hover:bg-white/40 transition-all flex flex-col items-center justify-center gap-4 cursor-pointer group">
         <div className="w-16 h-16 rounded-3xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
            <Upload size={32} />
         </div>
         <div className="text-center">
            <p className="text-sm font-black text-foreground">Click to upload or drag and drop</p>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Maximum file size: 10MB</p>
         </div>
      </div>

      {/* File List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {attachments.map((file: any) => (
          <div key={file.id} className="glass p-4 rounded-2xl border-white/60 bg-white/40 flex items-center gap-4 group">
            <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm border border-white/60">
              {getFileIcon(file.type)}
            </div>
            <div className="flex-1 min-w-0">
               <p className="text-xs font-black text-foreground truncate">{file.name}</p>
               <p className="text-[10px] font-bold text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
            </div>
            <div className="opacity-0 group-hover:opacity-100 flex items-center gap-2">
               <button className="p-2 hover:bg-white rounded-lg text-muted-foreground transition-all">
                  <Download size={16} />
               </button>
               <button className="p-2 hover:bg-red-50 rounded-lg text-red-500 transition-all">
                  <Trash2 size={16} />
               </button>
            </div>
          </div>
        ))}
      </div>

      {attachments.length === 0 && (
        <div className="text-center py-20 opacity-30">
          <File size={48} className="mx-auto mb-4" />
          <p className="text-xs font-black uppercase tracking-widest">No files attached yet</p>
        </div>
      )}
    </div>
  );
}
