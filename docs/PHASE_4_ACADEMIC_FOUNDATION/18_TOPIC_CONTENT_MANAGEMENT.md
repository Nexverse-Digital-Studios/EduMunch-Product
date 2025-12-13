# Topic & Content Management

---

## 🎯 Development Rules for This Document

> **Rule 1:** Do NOT create any additional documentation when a prompt is given. Code and implementation are the priority.
>
> **Rule 2:** For database changes - If SQL code is needed, provide it in chat and the developer can run it directly in Supabase SQL editor. Only create SQL files if they need to be saved for future reference. Follow the folder structure: `database/migrations/[batch_number]_[feature].sql`
>
> **Rule 3:** When creating any files (SQL, components, services, etc.), follow the complete folder structure planned in `04_PROJECT_STRUCTURE.md`. No exceptions.

---

## Overview

Topic & Content Management handles the breakdown of subjects into topics and the creation of learning materials including videos, documents, and interactive content.

---

## Database Schema

### Content Tables

```sql
-- Content Files (Videos, Documents, etc.)
CREATE TABLE content_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  
  file_name VARCHAR(255),
  file_type VARCHAR(50),                            -- 'video', 'document', 'image', 'audio'
  file_size BIGINT,
  file_url TEXT NOT NULL,                           -- Supabase Storage URL
  
  -- Video Specific
  duration_seconds INTEGER,                         -- Video duration
  thumbnail_url TEXT,
  transcription TEXT,                               -- Auto-generated transcription
  
  -- Document Specific
  page_count INTEGER,
  is_searchable BOOLEAN DEFAULT true,
  
  -- Metadata
  uploaded_by UUID,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_org FOREIGN KEY (org_id) 
    REFERENCES organizations(id) ON DELETE CASCADE,
  CONSTRAINT fk_uploaded_by FOREIGN KEY (uploaded_by) 
    REFERENCES users(id) ON DELETE SET NULL
);

-- Topic Content (Links topics to learning materials)
CREATE TABLE topic_contents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID NOT NULL,
  content_file_id UUID NOT NULL,
  
  content_type VARCHAR(50),                         -- 'theory', 'example', 'practice', 'reference'
  position INTEGER DEFAULT 0,                       -- Order of content in topic
  
  description TEXT,
  is_mandatory BOOLEAN DEFAULT true,
  estimated_time_minutes INTEGER,                   -- Time to complete
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_topic FOREIGN KEY (topic_id) 
    REFERENCES subject_topics(id) ON DELETE CASCADE,
  CONSTRAINT fk_content FOREIGN KEY (content_file_id) 
    REFERENCES content_files(id) ON DELETE CASCADE
);

-- Learning Notes & Resources
CREATE TABLE topic_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID NOT NULL,
  
  resource_type VARCHAR(50),                        -- 'reading', 'link', 'download', 'interactive'
  resource_title VARCHAR(255),
  resource_url TEXT,
  description TEXT,
  
  created_by UUID,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_topic FOREIGN KEY (topic_id) 
    REFERENCES subject_topics(id) ON DELETE CASCADE,
  CONSTRAINT fk_created_by FOREIGN KEY (created_by) 
    REFERENCES users(id) ON DELETE SET NULL
);

-- Student Learning Progress
CREATE TABLE student_content_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL,
  content_file_id UUID NOT NULL,
  
  view_count INTEGER DEFAULT 0,
  total_time_spent_seconds INTEGER DEFAULT 0,
  last_watched_at TIMESTAMP,
  
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP,
  
  -- Video Progress
  last_watched_position_seconds INTEGER,
  watch_percentage DECIMAL(5, 2),
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_student FOREIGN KEY (student_id) 
    REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_content FOREIGN KEY (content_file_id) 
    REFERENCES content_files(id) ON DELETE CASCADE,
  UNIQUE(student_id, content_file_id)
);

CREATE INDEX idx_content_files_org ON content_files(org_id);
CREATE INDEX idx_topic_contents_topic ON topic_contents(topic_id);
CREATE INDEX idx_topic_resources_topic ON topic_resources(topic_id);
CREATE INDEX idx_student_progress_student ON student_content_progress(student_id);
CREATE INDEX idx_student_progress_content ON student_content_progress(content_file_id);
CREATE INDEX idx_student_progress_completion ON student_content_progress(is_completed);
```

---

## Topic & Content Components

### 1. Topic Builder

```typescript
// src/components/admin/ContentManagement/TopicBuilder.tsx
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { contentService } from '@/services/academic/content.service';
import { Button } from '@/components/common/buttons/Button';
import { FormInput } from '@/components/common/forms/FormInput';
import { Plus, Trash2 } from 'lucide-react';

const topicSchema = z.object({
  topic_name: z.string().min(1, 'Topic name required'),
  topic_description: z.string().optional(),
  difficulty_level: z.enum(['Basic', 'Intermediate', 'Advanced']),
  learning_hours: z.number().min(0),
});

type TopicFormData = z.infer<typeof topicSchema>;

interface TopicBuilderProps {
  subjectId: string;
  onSuccess: () => void;
}

export const TopicBuilder: React.FC<TopicBuilderProps> = ({
  subjectId,
  onSuccess,
}) => {
  const { register, handleSubmit, formState: { errors } } = useForm<TopicFormData>({
    resolver: zodResolver(topicSchema),
  });
  
  const { mutate: createTopic, isPending } = useMutation({
    mutationFn: (data: TopicFormData) =>
      contentService.createTopic(subjectId, data),
    onSuccess,
  });
  
  const onSubmit = (data: TopicFormData) => {
    createTopic(data);
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-6 bg-white rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold">Create Topic</h3>
      
      <FormInput
        label="Topic Name"
        placeholder="Introduction to Algebra"
        {...register('topic_name')}
        error={errors.topic_name?.message}
      />
      
      <FormInput
        label="Description"
        as="textarea"
        placeholder="Brief description..."
        {...register('topic_description')}
      />
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Difficulty Level</label>
          <select
            {...register('difficulty_level')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="Basic">Basic</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
        </div>
        
        <FormInput
          label="Learning Hours"
          type="number"
          step="0.5"
          {...register('learning_hours', { valueAsNumber: true })}
        />
      </div>
      
      <Button type="submit" isLoading={isPending} className="w-full">
        Create Topic
      </Button>
    </form>
  );
};
```

### 2. Content Upload Component

```typescript
// src/components/admin/ContentManagement/ContentUpload.tsx
import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { contentService } from '@/services/academic/content.service';
import { Button } from '@/components/common/buttons/Button';
import { Upload as UploadIcon, Loader, Check, X } from 'lucide-react';

interface ContentUploadProps {
  topicId: string;
  onSuccess: () => void;
}

export const ContentUpload: React.FC<ContentUploadProps> = ({
  topicId,
  onSuccess,
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [uploads, setUploads] = useState<Record<string, {
    status: 'pending' | 'uploading' | 'completed' | 'failed';
    progress: number;
  }>>({});
  
  const { mutate: uploadFiles, isPending } = useMutation({
    mutationFn: (filesToUpload: File[]) =>
      contentService.uploadContent(topicId, filesToUpload),
    onSuccess: () => {
      setFiles([]);
      onSuccess();
    },
  });
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };
  
  const handleUpload = () => {
    if (files.length > 0) {
      // Initialize upload tracking
      const uploadMap: Record<string, any> = {};
      files.forEach((file) => {
        uploadMap[file.name] = {
          status: 'pending',
          progress: 0,
        };
      });
      setUploads(uploadMap);
      uploadFiles(files);
    }
  };
  
  return (
    <div className="space-y-4 p-6 bg-white rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold">Upload Learning Materials</h3>
      
      {/* File Input */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
        <input
          type="file"
          multiple
          onChange={handleFileChange}
          className="hidden"
          id="file-input"
          accept="video/*,application/pdf,.doc,.docx,image/*"
        />
        <label htmlFor="file-input" className="cursor-pointer">
          <UploadIcon size={48} className="mx-auto text-gray-400 mb-2" />
          <p className="font-medium">Click to upload or drag and drop</p>
          <p className="text-sm text-gray-500">MP4, PDF, DOCX, PNG up to 500MB</p>
        </label>
      </div>
      
      {/* Selected Files */}
      {files.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium">Selected Files ({files.length})</h4>
          {files.map((file) => (
            <div
              key={file.name}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
            >
              <div className="flex-1">
                <p className="font-medium text-sm">{file.name}</p>
                <p className="text-xs text-gray-500">
                  {(file.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
              
              {/* Status */}
              {uploads[file.name]?.status === 'uploading' && (
                <div className="flex items-center gap-2">
                  <Loader size={16} className="animate-spin" />
                  <span className="text-sm">{uploads[file.name].progress}%</span>
                </div>
              )}
              {uploads[file.name]?.status === 'completed' && (
                <Check size={16} className="text-green-600" />
              )}
              {uploads[file.name]?.status === 'failed' && (
                <X size={16} className="text-red-600" />
              )}
            </div>
          ))}
        </div>
      )}
      
      {/* Upload Button */}
      <Button
        onClick={handleUpload}
        isLoading={isPending}
        disabled={files.length === 0 || isPending}
        className="w-full"
      >
        <UploadIcon size={16} className="mr-2" />
        Upload Materials
      </Button>
    </div>
  );
};
```

### 3. Topic Content Manager

```typescript
// src/components/admin/ContentManagement/TopicContentManager.tsx
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { contentService } from '@/services/academic/content.service';
import { ContentUpload } from './ContentUpload';
import { GripVertical, Trash2, Eye } from 'lucide-react';

interface TopicContentManagerProps {
  topicId: string;
}

export const TopicContentManager: React.FC<TopicContentManagerProps> = ({
  topicId,
}) => {
  const { data: contents = [], isLoading, refetch } = useQuery({
    queryKey: ['topic-contents', topicId],
    queryFn: () => contentService.getTopicContents(topicId),
    enabled: !!topicId,
  });
  
  return (
    <div className="space-y-6">
      <ContentUpload topicId={topicId} onSuccess={() => refetch()} />
      
      {/* Content List */}
      <div className="p-6 bg-white rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold mb-4">Content Materials</h3>
        
        {isLoading ? (
          <p className="text-gray-500">Loading...</p>
        ) : contents.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No content uploaded yet</p>
        ) : (
          <div className="space-y-3">
            {contents.map((content, idx) => (
              <div
                key={content.id}
                className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200"
              >
                <GripVertical size={20} className="text-gray-400 cursor-move" />
                
                <div className="flex-1">
                  <p className="font-medium">{content.file_name}</p>
                  <p className="text-sm text-gray-600">
                    {content.file_type} • {content.file_size && (content.file_size / (1024 * 1024)).toFixed(1)} MB
                  </p>
                  {content.duration_seconds && (
                    <p className="text-sm text-gray-500">
                      Duration: {Math.floor(content.duration_seconds / 60)}:{(content.duration_seconds % 60).toString().padStart(2, '0')}
                    </p>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  <button className="p-2 hover:bg-gray-200 rounded">
                    <Eye size={16} />
                  </button>
                  <button className="p-2 hover:bg-red-200 rounded text-red-600">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
```

---

## Content Service

```typescript
// src/services/academic/content.service.ts
import { supabase } from '@/services/api/client';

export const contentService = {
  async createTopic(subjectId: string, topicData: any) {
    const { data, error } = await supabase
      .from('subject_topics')
      .insert({
        subject_id: subjectId,
        ...topicData,
      })
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },
  
  async uploadContent(topicId: string, files: File[]) {
    const uploadedFiles = [];
    
    for (const file of files) {
      // Upload file to storage
      const filePath = `content/${topicId}/${Date.now()}_${file.name}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('learning-materials')
        .upload(filePath, file);
      
      if (uploadError) throw new Error(uploadError.message);
      
      // Get public URL
      const { data: urlData } = supabase.storage
        .from('learning-materials')
        .getPublicUrl(uploadData.path);
      
      // Create content file record
      const { data: contentData, error: contentError } = await supabase
        .from('content_files')
        .insert({
          file_name: file.name,
          file_type: file.type.split('/')[0] || 'document',
          file_size: file.size,
          file_url: urlData.publicUrl,
        })
        .select()
        .single();
      
      if (contentError) throw new Error(contentError.message);
      
      // Link to topic
      await supabase
        .from('topic_contents')
        .insert({
          topic_id: topicId,
          content_file_id: contentData.id,
          content_type: 'theory',
        });
      
      uploadedFiles.push(contentData);
    }
    
    return uploadedFiles;
  },
  
  async getTopicContents(topicId: string) {
    const { data, error } = await supabase
      .from('topic_contents')
      .select('*, content_files(*)')
      .eq('topic_id', topicId)
      .order('position');
    
    if (error) throw new Error(error.message);
    
    return data?.map((tc) => tc.content_files) || [];
  },
  
  async trackViewProgress(
    studentId: string,
    contentFileId: string,
    progressData: {
      view_count: number;
      time_spent_seconds: number;
      watch_percentage: number;
      last_position_seconds?: number;
    }
  ) {
    const { data, error } = await supabase
      .from('student_content_progress')
      .upsert({
        student_id: studentId,
        content_file_id: contentFileId,
        view_count: progressData.view_count,
        total_time_spent_seconds: progressData.time_spent_seconds,
        watch_percentage: progressData.watch_percentage,
        last_watched_position_seconds: progressData.last_position_seconds,
        last_watched_at: new Date(),
      })
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },
};
```

---

## Video Player with Progress Tracking

```typescript
// src/components/student/VideoPlayer/VideoPlayer.tsx
import React, { useRef, useEffect, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { contentService } from '@/services/academic/content.service';
import { useUserStore } from '@/store/user.store';

interface VideoPlayerProps {
  contentFileId: string;
  videoUrl: string;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  contentFileId,
  videoUrl,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { user } = useUserStore();
  const [duration, setDuration] = useState(0);
  const [viewCount, setViewCount] = useState(0);
  
  const { mutate: trackProgress } = useMutation({
    mutationFn: (progress: any) =>
      contentService.trackViewProgress(user!.id, contentFileId, progress),
  });
  
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    
    let timeSpent = 0;
    let lastTrackedTime = 0;
    
    const handleMetadata = () => {
      setDuration(video.duration);
    };
    
    const handleTimeUpdate = () => {
      timeSpent = video.currentTime;
      
      // Track every 30 seconds
      if (timeSpent - lastTrackedTime >= 30) {
        const watchPercentage = (timeSpent / video.duration) * 100;
        trackProgress({
          view_count: viewCount,
          time_spent_seconds: Math.floor(timeSpent),
          watch_percentage: Math.round(watchPercentage),
          last_position_seconds: Math.floor(timeSpent),
        });
        lastTrackedTime = timeSpent;
      }
    };
    
    const handleEnded = () => {
      trackProgress({
        view_count: viewCount + 1,
        time_spent_seconds: Math.floor(duration),
        watch_percentage: 100,
      });
      setViewCount((prev) => prev + 1);
    };
    
    video.addEventListener('loadedmetadata', handleMetadata);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleEnded);
    
    return () => {
      video.removeEventListener('loadedmetadata', handleMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleEnded);
    };
  }, [contentFileId, user, viewCount]);
  
  return (
    <video
      ref={videoRef}
      src={videoUrl}
      controls
      className="w-full aspect-video bg-black rounded-lg"
    />
  );
};
```

---

## Next Steps

1. ✅ Create content and progress tables
2. ✅ Implement topic builder
3. ✅ Create content upload UI
4. ✅ Build video player with tracking
5. ✅ Proceed to `19_BATCH_MANAGEMENT.md`

---

**Document Updated:** December 13, 2025  
**Status:** ✅ Topic & Content Complete  
**Next Phase:** 19_BATCH_MANAGEMENT.md
