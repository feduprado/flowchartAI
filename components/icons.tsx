import React from 'react';

const Icon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    {props.children}
  </svg>
);

export const StartIcon: React.FC = () => <Icon><ellipse cx="12" cy="12" rx="10" ry="6" /></Icon>;
export const ProcessIcon: React.FC = () => <Icon><rect x="3" y="7" width="18" height="10" rx="2" ry="2" /></Icon>;
export const DecisionIcon: React.FC = () => <Icon><path d="M12 2L2 12l10 10 10-12z" /></Icon>;
export const EndIcon: React.FC = () => <Icon><ellipse cx="12" cy="12" rx="10" ry="6" strokeDasharray="4 4" /></Icon>;
export const TrashIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Icon {...props}><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></Icon>;
export const UndoIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Icon {...props}><path d="M3 10v6h6" /><path d="M21 10a9 9 0 0 0-14.49-5.49L3 10" /></Icon>;
export const RedoIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Icon {...props}><path d="M21 10v6h-6" /><path d="M3 10a9 9 0 0 1 14.49-5.49L21 10" /></Icon>;
export const ClearIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Icon {...props}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="M12 2L3.5 6.5l8.5 4 8.5-4L12 2z" /><line x1="3.5" y1="6.5" x2="12" y2="10.5" /><line x1="20.5" y1="6.5" x2="12" y2="10.5" /></Icon>;
export const MoonIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Icon {...props}><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></Icon>;
export const SunIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Icon {...props}><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></Icon>;
export const HelpIcon: React.FC = () => <Icon><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" /></Icon>;
export const SparklesIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Icon {...props}><path d="M12 2L9.5 9.5 2 12l7.5 2.5L12 22l2.5-7.5L22 12l-7.5-2.5z" /></Icon>;
export const ExportIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Icon {...props}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></Icon>;
export const ImportIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Icon {...props}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></Icon>;
export const ArrowUpIcon: React.FC = () => <Icon><line x1="12" y1="19" x2="12" y2="5" /><polyline points="5 12 12 5 19 12" /></Icon>;
export const ArrowDownIcon: React.FC = () => <Icon><line x1="12" y1="5" x2="12" y2="19" /><polyline points="19 12 12 19 5 12" /></Icon>;
export const ArrowLeftIcon: React.FC = () => <Icon><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></Icon>;
export const ArrowRightIcon: React.FC = () => <Icon><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></Icon>;
export const FigmaIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Icon {...props}><path d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"/><path d="M12 9a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/><path d="M6 9a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/><path d="M9 21a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"/><path d="M9 15a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/></Icon>;
export const ZoomInIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Icon {...props}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></Icon>;
export const ZoomOutIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Icon {...props}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="8" y1="11" x2="14" y2="11"/></Icon>;
export const CenterIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Icon {...props}><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/><path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 6c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/><path d="M3 12h2M19 12h2M12 3v2M12 19v2"/></Icon>;

export const CheckCircleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Icon {...props}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></Icon>;
export const AlertTriangleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Icon {...props}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></Icon>;
export const XCircleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Icon {...props}><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></Icon>;
export const InfoIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Icon {...props}><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></Icon>;
