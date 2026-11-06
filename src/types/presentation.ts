export interface PresenterInfo {
  name: string;
  classGrade: string;
  school: string;
  academicYear: string;
  advisorName?: string;
  projectUrl?: string;
}

export interface SlideData {
  id: number;
  slideNumber: string;
  tag: string;
  title: string;
  subtitle: string;
  category: 'intro' | 'problem' | 'solution' | 'features' | 'design' | 'tech' | 'architecture' | 'challenges' | 'roadmap' | 'closing';
  bulletPoints?: {
    title: string;
    description: string;
    icon?: string;
    badge?: string;
  }[];
  quote?: string;
  highlights?: {
    label: string;
    value: string;
    detail: string;
  }[];
  speakerNotes: string; // Indonesian notes for student defense
}
