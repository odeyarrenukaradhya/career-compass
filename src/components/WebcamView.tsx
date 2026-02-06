import { useEffect, useRef, useState } from 'react';
import { Video, VideoOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

interface WebcamViewProps {
  autoStart?: boolean;
  className?: string;
}

const WebcamView = ({ autoStart = false, className = '' }: WebcamViewProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [active, setActive] = useState(false);
  const [loading, setLoading] = useState(false);

  const startCamera = async () => {
    setLoading(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setActive(true);
    } catch {
      toast({ title: 'Camera access denied', description: 'Please allow camera access to use the self-view.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setActive(false);
  };

  useEffect(() => {
    if (autoStart) startCamera();
    return () => stopCamera();
  }, []);

  return (
    <div className={`relative rounded-xl overflow-hidden bg-muted border border-border ${className}`}>
      {active ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover mirror"
          style={{ transform: 'scaleX(-1)' }}
        />
      ) : (
        <div className="flex flex-col items-center justify-center h-full min-h-[180px] gap-3 p-4">
          <VideoOff className="w-10 h-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground text-center">Camera is off</p>
        </div>
      )}

      <Button
        size="icon"
        variant={active ? 'destructive' : 'secondary'}
        className="absolute bottom-2 right-2 rounded-full w-9 h-9"
        onClick={active ? stopCamera : startCamera}
        disabled={loading}
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : active ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
      </Button>
    </div>
  );
};

export default WebcamView;
