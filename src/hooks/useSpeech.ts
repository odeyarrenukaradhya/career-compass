import { useState, useCallback, useRef, useEffect } from 'react';

export const useSpeechSynthesis = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const speak = useCallback((text: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1;
      utterance.volume = 1;

      // Try to pick a natural English voice
      const voices = window.speechSynthesis.getVoices();
      const preferred = voices.find(
        (v) => v.lang.startsWith('en') && v.name.toLowerCase().includes('google')
      ) || voices.find((v) => v.lang.startsWith('en'));
      if (preferred) utterance.voice = preferred;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => { setIsSpeaking(false); resolve(); };
      utterance.onerror = (e) => { setIsSpeaking(false); reject(e); };
      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    });
  }, []);

  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  useEffect(() => {
    // Preload voices
    window.speechSynthesis.getVoices();
    return () => { window.speechSynthesis.cancel(); };
  }, []);

  return { speak, stop, isSpeaking };
};

export const useSpeechRecognition = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const recognitionRef = useRef<any>(null);

  const startListening = useCallback((): Promise<string> => {
    return new Promise((resolve, reject) => {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        reject(new Error('Speech recognition not supported in this browser.'));
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      recognitionRef.current = recognition;

      let finalText = '';

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        let interim = '';
        finalText = '';
        for (let i = 0; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalText += event.results[i][0].transcript + ' ';
          } else {
            interim += event.results[i][0].transcript;
          }
        }
        setTranscript(finalText.trim());
        setInterimTranscript(interim);
      };
      recognition.onerror = (event: any) => {
        if (event.error !== 'aborted') {
          setIsListening(false);
          reject(new Error(event.error));
        }
      };
      recognition.onend = () => {
        setIsListening(false);
        setInterimTranscript('');
        resolve(finalText.trim());
      };

      recognition.start();
    });
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  }, []);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  return { startListening, stopListening, isListening, transcript, interimTranscript, setTranscript };
};
