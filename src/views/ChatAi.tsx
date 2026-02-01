import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faMicrophone, 
  faMicrophoneSlash, 
  faPaperPlane, 
  faRobot, 
  faUserCircle 
} from "@fortawesome/free-solid-svg-icons";
import { apiService } from "../services/services";

interface Message {
  role: "user" | "model";
  content: string;
}

// Interfaces de tipos (se mantienen igual)
interface IWindow extends Window {
  SpeechRecognition: any;
  webkitSpeechRecognition: any;
}
interface SpeechRecognitionEvent extends Event {
  results: { [key: number]: { [key: number]: { transcript: string } } };
}

const ChatIA: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: "model", content: "¡Hola! Soy FitLog AI. ¿En qué puedo ayudarte con el gimnasio hoy?" },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    const preguntaUsuario = input;
    setInput("");
    setIsTyping(true);

    try {
      const response = await apiService.sendMessageIA(preguntaUsuario);
      const aiResponse = response.data?.respuesta || response.data?.response || response.data?.message || "No pude procesar tu solicitud.";
      
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        { role: "model", content: aiResponse },
      ]);
    } catch (error) {
      console.error("Error al enviar mensaje a IA:", error);
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        { role: "model", content: "Lo siento, ocurrió un error al procesar tu solicitud. Por favor intenta de nuevo." },
      ]);
    }
  };

  const handleVoiceInput = () => {
    const { SpeechRecognition, webkitSpeechRecognition } = window as unknown as IWindow;
    const SpeechRec = SpeechRecognition || webkitSpeechRecognition;
    if (!SpeechRec) return alert("Navegador no compatible");

    const recognition = new SpeechRec();
    recognition.lang = "es-ES";
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      setInput(event.results[0][0].transcript);
      setIsListening(false);
    };
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  return (
    <div className="flex flex-col h-[calc(100vh-130px)] w-full border border-gray-200 rounded-3xl bg-white shadow-2xl overflow-hidden mb-4">
      
      {/* HEADER DEL CHAT */}
      <div className="bg-white border-b p-5 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-teal-100 text-teal-600 p-2.5 rounded-2xl">
            <FontAwesomeIcon icon={faRobot} className="size-5" />
          </div>
          <div>
            <h2 className="font-bold text-gray-800 leading-tight">FitLog AI</h2>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-[11px] text-gray-400 font-medium uppercase tracking-wider">En línea</span>
            </div>
          </div>
        </div>
      </div>

      {/* ÁREA DE MENSAJES */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#f8fafc]">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start animate-in slide-in-from-left-2"}`}>
            <div className={`flex gap-3 max-w-[85%] ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
              
              {/* Avatar Icon */}
              <div className={`mt-auto mb-1 text-2xl ${msg.role === "user" ? "text-teal-600" : "text-gray-300"}`}>
                <FontAwesomeIcon icon={msg.role === "user" ? faUserCircle : faRobot} className="size-6" />
              </div>

              {/* Burbuja */}
              <div className={`p-4 rounded-3xl shadow-sm text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-teal-600 text-white rounded-br-none"
                  : "bg-white text-gray-700 border border-gray-100 rounded-bl-none"
              }`}>
                {msg.content}
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start animate-pulse">
            <div className="bg-white border border-gray-100 p-4 rounded-3xl rounded-bl-none flex gap-2 items-center shadow-sm">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:0.4s]"></div>
              </div>
              <span className="text-xs text-gray-400 font-medium">FitLog pensando...</span>
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* INPUT / ÁREA DE ESCRITURA */}
      <div className="p-4 bg-white border-t border-gray-100">
        <form 
          onSubmit={handleSend} 
          className="flex items-end gap-3 bg-gray-50 p-2 rounded-2xl border border-gray-200 focus-within:border-teal-400 focus-within:ring-2 focus-within:ring-teal-400/20 focus-within:bg-white transition-all outline-none"
        >
          
          <button
            type="button"
            onClick={handleVoiceInput}
            className={`flex items-center justify-center size-10 rounded-xl transition-all mb-0.5 ${
              isListening ? "bg-red-500 text-white shadow-lg shadow-red-200" : "text-gray-400 hover:bg-gray-200 hover:text-gray-600"
            }`}
          >
            <FontAwesomeIcon icon={isListening ? faMicrophoneSlash : faMicrophone} />
          </button>

          <textarea
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              // Auto-resize
              e.target.style.height = 'inherit';
              e.target.style.height = `${Math.min(e.target.scrollHeight, 150)}px`;
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend(e as any);
                // Reset height
                (e.target as HTMLTextAreaElement).style.height = 'inherit';
              }
            }}
            placeholder={isListening ? "Escuchando tu voz..." : "Escribe un comando o usa el micrófono..."}
            className="flex-1 bg-transparent border-none focus:ring-0 text-sm text-gray-700 placeholder:text-gray-400 resize-none py-2.5 min-h-[40px] max-h-[150px] outline-none"
            rows={1}
          />

          <button
            type="submit"
            disabled={!input.trim()}
            className="flex items-center justify-center size-10 bg-teal-600 text-white rounded-xl hover:bg-teal-700 disabled:bg-gray-300 disabled:shadow-none shadow-lg shadow-teal-100 transition-all mb-0.5"
          >
            <FontAwesomeIcon icon={faPaperPlane} className="size-4" />
          </button>
        </form>
        <p className="text-[10px] text-center text-gray-400 mt-3 font-medium uppercase tracking-tighter">
          FitLog AI puede cometer errores. Verifica la información importante.
        </p>
      </div>
    </div>
  );
};

export default ChatIA;