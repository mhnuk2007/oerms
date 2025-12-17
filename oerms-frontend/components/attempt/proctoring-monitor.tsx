// components/attempt/proctoring-monitor.tsx - Exam Proctoring Features
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { AlertTriangle, Eye, EyeOff, Monitor, MonitorOff } from 'lucide-react';
import { attemptService } from '@/lib/api/attempt';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

interface ProctoringViolation {
  type: 'tab_switch' | 'webcam_blocked' | 'window_minimized' | 'suspicious_activity';
  timestamp: Date;
  description: string;
  severity: 'low' | 'medium' | 'high';
}

interface ProctoringMonitorProps {
  attemptId: string;
  enabled?: boolean;
  onViolation?: (violation: ProctoringViolation) => void;
}

export function ProctoringMonitor({
  attemptId,
  enabled = false,
  onViolation
}: ProctoringMonitorProps) {
  const [violations, setViolations] = useState<ProctoringViolation[]>([]);
  const [tabSwitches, setTabSwitches] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [webcamAccess, setWebcamAccess] = useState<boolean | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  // Track tab switches
  useEffect(() => {
    if (!enabled) return;

    const handleVisibilityChange = async () => {
      if (document.hidden) {
        const violation: ProctoringViolation = {
          type: 'tab_switch',
          timestamp: new Date(),
          description: 'User switched tabs or minimized window',
          severity: 'medium'
        };

        setViolations(prev => [...prev, violation]);
        setTabSwitches(prev => prev + 1);

        // Record violation on server
        try {
          await attemptService.recordTabSwitch(attemptId);
        } catch (error) {
          console.error('Failed to record tab switch:', error);
        }

        onViolation?.(violation);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [enabled, attemptId, onViolation]);

  // Webcam monitoring (optional)
  const requestWebcamAccess = useCallback(async () => {
    if (!enabled) return;

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false
      });

      setStream(mediaStream);
      setWebcamAccess(true);

      // Monitor webcam stream
      const track = mediaStream.getVideoTracks()[0];
      if (track) {
        track.onended = () => {
          const violation: ProctoringViolation = {
            type: 'webcam_blocked',
            timestamp: new Date(),
            description: 'Webcam access was blocked or interrupted',
            severity: 'high'
          };

          setViolations(prev => [...prev, violation]);
          setWebcamAccess(false);

          try {
            attemptService.recordWebcamViolation(attemptId);
          } catch (error) {
            console.error('Failed to record webcam violation:', error);
          }

          onViolation?.(violation);
        };
      }
    } catch (error) {
      console.error('Webcam access denied:', error);
      setWebcamAccess(false);

      const violation: ProctoringViolation = {
        type: 'webcam_blocked',
        timestamp: new Date(),
        description: 'Webcam access was denied by user',
        severity: 'high'
      };

      setViolations(prev => [...prev, violation]);
      onViolation?.(violation);
    }
  }, [enabled, attemptId, onViolation]);

  // Fullscreen monitoring
  useEffect(() => {
    const checkFullscreen = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', checkFullscreen);

    // Warn if user exits fullscreen
    const handleFullscreenExit = () => {
      if (!document.fullscreenElement && enabled) {
        const violation: ProctoringViolation = {
          type: 'window_minimized',
          timestamp: new Date(),
          description: 'User exited fullscreen mode',
          severity: 'low'
        };

        setViolations(prev => [...prev, violation]);
        onViolation?.(violation);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenExit);

    return () => {
      document.removeEventListener('fullscreenchange', checkFullscreen);
      document.removeEventListener('fullscreenchange', handleFullscreenExit);
    };
  }, [enabled, onViolation]);

  // Copy/paste prevention
  useEffect(() => {
    if (!enabled) return;

    const preventCopyPaste = (e: ClipboardEvent) => {
      e.preventDefault();

      const violation: ProctoringViolation = {
        type: 'suspicious_activity',
        timestamp: new Date(),
        description: `Attempted to ${e.type === 'copy' ? 'copy' : e.type === 'paste' ? 'paste' : 'use clipboard'}`,
        severity: 'medium'
      };

      setViolations(prev => [...prev, violation]);
      onViolation?.(violation);
    };

    document.addEventListener('copy', preventCopyPaste);
    document.addEventListener('paste', preventCopyPaste);
    document.addEventListener('cut', preventCopyPaste);

    return () => {
      document.removeEventListener('copy', preventCopyPaste);
      document.removeEventListener('paste', preventCopyPaste);
      document.removeEventListener('cut', preventCopyPaste);
    };
  }, [enabled, onViolation]);

  // Context menu prevention
  useEffect(() => {
    if (!enabled) return;

    const preventContextMenu = (e: MouseEvent) => {
      e.preventDefault();

      const violation: ProctoringViolation = {
        type: 'suspicious_activity',
        timestamp: new Date(),
        description: 'Right-click context menu accessed',
        severity: 'low'
      };

      setViolations(prev => [...prev, violation]);
      onViolation?.(violation);
    };

    document.addEventListener('contextmenu', preventContextMenu);

    return () => {
      document.removeEventListener('contextmenu', preventContextMenu);
    };
  }, [enabled, onViolation]);

  // Cleanup webcam stream
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high': return <AlertTriangle className="w-4 h-4" />;
      case 'medium': return <Eye className="w-4 h-4" />;
      case 'low': return <Monitor className="w-4 h-4" />;
      default: return <MonitorOff className="w-4 h-4" />;
    }
  };

  if (!enabled) {
    return null; // Proctoring disabled
  }

  return (
    <div className="space-y-4">
      {/* Proctoring Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Exam Proctoring Active
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{tabSwitches}</div>
              <div className="text-gray-600">Tab Switches</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${isFullscreen ? 'text-green-600' : 'text-red-600'}`}>
                {isFullscreen ? '✓' : '✗'}
              </div>
              <div className="text-gray-600">Fullscreen</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${webcamAccess === true ? 'text-green-600' : webcamAccess === false ? 'text-red-600' : 'text-gray-600'}`}>
                {webcamAccess === true ? '✓' : webcamAccess === false ? '✗' : '?'}
              </div>
              <div className="text-gray-600">Webcam</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{violations.length}</div>
              <div className="text-gray-600">Violations</div>
            </div>
          </div>

          {/* Webcam Controls */}
          <div className="mt-4 flex gap-2">
            <Button
              size="sm"
              variant={webcamAccess ? "secondary" : "primary"}
              onClick={webcamAccess ? () => {
                if (stream) {
                  stream.getTracks().forEach(track => track.stop());
                  setStream(null);
                  setWebcamAccess(null);
                }
              } : requestWebcamAccess}
            >
              {webcamAccess ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
              {webcamAccess ? 'Stop Webcam' : 'Enable Webcam'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Violations Log */}
      {violations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-600">
              <AlertTriangle className="w-5 h-5" />
              Proctoring Violations ({violations.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {violations.slice(-5).map((violation, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-3 p-3 rounded-lg border ${getSeverityColor(violation.severity)}`}
                >
                  {getSeverityIcon(violation.severity)}
                  <div className="flex-1">
                    <div className="font-medium">{violation.description}</div>
                    <div className="text-xs opacity-75">
                      {violation.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded text-xs font-medium uppercase ${getSeverityColor(violation.severity)}`}>
                    {violation.severity}
                  </div>
                </div>
              ))}
            </div>

            {violations.length > 5 && (
              <div className="mt-2 text-sm text-gray-600 text-center">
                Showing last 5 violations. Total: {violations.length}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Proctoring Warning */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Monitor className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-blue-900">Exam Proctoring Active</h3>
            <p className="text-sm text-blue-700 mt-1">
              This exam is being monitored. Tab switching, copying/pasting, and other activities are tracked.
              Stay in fullscreen mode and avoid suspicious behavior.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Hook for using proctoring in exam components
export function useProctoring(attemptId: string, enabled = false) {
  const [violations, setViolations] = useState<ProctoringViolation[]>([]);

  const recordViolation = useCallback((violation: ProctoringViolation) => {
    setViolations(prev => [...prev, violation]);
  }, []);

  return {
    violations,
    recordViolation,
    ProctoringMonitor: (props: Omit<ProctoringMonitorProps, 'attemptId' | 'enabled' | 'onViolation'>) => (
      <ProctoringMonitor
        attemptId={attemptId}
        enabled={enabled}
        onViolation={recordViolation}
        {...props}
      />
    )
  };
}
