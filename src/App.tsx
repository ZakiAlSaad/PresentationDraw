import { useState } from "react";
import confetti from "canvas-confetti";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { SpinningWheel, WheelItem } from "./components/SpinningWheel";
import { playSpinningSound, playWinnerSound } from "./lib/audio";

const NAMES = [
  "Iffat Jahan Ruba",
  "Istiak Mahmud",
  "Safika Haque",
  "Roman Islam Ovi",
  "Sadia Akter",
  "S M Zaki Al Saad Marjan",
];

const TOPICS = [
  "১. ঐতিহাসিক প্রেক্ষাপট ও নির্বাচন পরিচিতি",
  "২. নির্বাচনী ফলাফল বিশ্লেষণ: জাতীয় ও প্রাদেশিক পরিষদ",
  "৩. নির্বাচনের তাৎপর্য: বাঙালি জাতীয়তাবাদ ও ৬ দফার স্বীকৃতি",
  "৪. নির্বাচনের তাৎপর্য: পশ্চিমাদের পরাজয় ও অধিকার আদায়",
  "৫. রাজনৈতিক প্রভাব ও সংবিধান প্রণয়নের পথরেখা",
  "৬. নির্বাচন পরবর্তী ষড়যন্ত্র ও স্বাধীনতার অভ্যুদয়",
];

const NAME_COLORS = ["#1a1a1a", "#222222", "#1a1a1a", "#222222", "#1a1a1a", "#222222"];
const TOPIC_COLORS = ["#222222", "#1a1a1a", "#222222", "#1a1a1a", "#222222", "#1a1a1a"];

const INITIAL_NAME_ITEMS: WheelItem[] = NAMES.map((name, i) => ({
  id: `name-${i}`,
  primary: name,
  color: NAME_COLORS[i],
}));

const INITIAL_TOPIC_ITEMS: WheelItem[] = TOPICS.map((topic, i) => {
  const firstSpace = topic.indexOf(" ");
  const primary = topic.substring(0, firstSpace).trim();
  const secondary = topic.substring(firstSpace + 1).trim();
  return {
    id: `topic-${i}`,
    primary,
    secondary,
    color: TOPIC_COLORS[i],
    originalValue: topic,
  };
});

interface Assignment {
  nameId: string;
  topicId: string;
  nameVal: string;
  topicVal: string;
}

export default function App() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [nameRotation, setNameRotation] = useState(0);
  const [topicRotation, setTopicRotation] = useState(0);
  const [currentWinner, setCurrentWinner] = useState<{ name: WheelItem; topic: WheelItem } | null>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const isCompleted = assignments.length === INITIAL_NAME_ITEMS.length;

  const downloadPDF = async () => {
    const element = document.getElementById("pdf-report-content");
    if (!element) return;
    
    setIsGeneratingPDF(true);
    try {
      const canvas = await html2canvas(element, { 
        scale: 2, 
        useCORS: true, 
        backgroundColor: "#ffffff",
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save("BAN0001_Presentation_Draw_Results.pdf");
    } catch (e) {
      console.error("Failed to generate PDF", e);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleSpin = () => {
    if (isSpinning || isCompleted) return;

    setIsSpinning(true);
    setCurrentWinner(null);

    // Filter unassigned
    const unassignedNames = INITIAL_NAME_ITEMS.filter((n) => !assignments.some((a) => a.nameId === n.id));
    const unassignedTopics = INITIAL_TOPIC_ITEMS.filter((t) => !assignments.some((a) => a.topicId === t.id));

    // Choose randomly
    const chosenName = unassignedNames[Math.floor(Math.random() * unassignedNames.length)];
    const chosenTopic = unassignedTopics[Math.floor(Math.random() * unassignedTopics.length)];

    const nameIndex = INITIAL_NAME_ITEMS.findIndex((n) => n.id === chosenName.id);
    const topicIndex = INITIAL_TOPIC_ITEMS.findIndex((t) => t.id === chosenTopic.id);

    // Calculate angles
    const calculateTargetRotation = (prevRotation: number, targetIndex: number, length: number) => {
      const sliceDegree = 360 / length;
      const targetCenterAngle = (targetIndex + 0.5) * sliceDegree;
      // Wheel must be spun so the target center lands at Top (0 degrees).
      const absoluteTargetAngle = 360 - targetCenterAngle;

      const currentMod = prevRotation % 360;
      const neededRotation = (absoluteTargetAngle - currentMod + 360) % 360;

      const fullSpins = 4 + Math.floor(Math.random() * 3); // 4 to 6 full spins
      return prevRotation + fullSpins * 360 + neededRotation;
    };

    const newNameRot = calculateTargetRotation(nameRotation, nameIndex, INITIAL_NAME_ITEMS.length);
    const newTopicRot = calculateTargetRotation(topicRotation, topicIndex, INITIAL_TOPIC_ITEMS.length);

    setNameRotation(newNameRot);
    setTopicRotation(newTopicRot);

    const spinDurationSeconds = 6; // Spin matches ease duration

    playSpinningSound(spinDurationSeconds);

    setTimeout(() => {
      setIsSpinning(false);
      playWinnerSound();
      setCurrentWinner({ name: chosenName, topic: chosenTopic });
      setAssignments((prev) => [
        ...prev,
        {
          nameId: chosenName.id,
          topicId: chosenTopic.id,
          nameVal: chosenName.primary,
          topicVal: (chosenTopic as any).originalValue || chosenTopic.primary, // Type coercion fallback
        },
      ]);

      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#d4af37", "#f59e0b", "#ffffff", "#0a0a0a"],
      });
    }, spinDurationSeconds * 1000);
  };

  const nameItemsWithAssignedStatus = INITIAL_NAME_ITEMS.map((n) => ({
    ...n,
    isAssigned: assignments.some((a) => a.nameId === n.id),
  }));

  const topicItemsWithAssignedStatus = INITIAL_TOPIC_ITEMS.map((t) => ({
    ...t,
    isAssigned: assignments.some((a) => a.topicId === t.id),
  }));

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#e0e0e0] font-sans flex flex-col overflow-x-hidden selection:bg-amber-900/30">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_center,_#1a1a1a_0%,_#0a0a0a_70%)] pointer-events-none" />
      
      <main className="relative flex-1 z-10 container mx-auto px-4 py-8 md:py-16 flex flex-col items-center">
        <header className="mb-12 text-center max-w-3xl mx-auto border-b border-white/10 pb-8 pt-4">
          <h1 className="text-3xl md:text-5xl font-serif italic tracking-wide text-amber-100 mb-2">
            BAN0001 <span className="text-amber-500">Presentation</span> Draw
          </h1>
          <p className="text-sm md:text-base font-serif text-amber-200/80 mb-2">
            History of the Emergence of Bangladesh
          </p>
          <p className="text-[10px] md:text-xs font-mono text-zinc-500 uppercase tracking-[0.2em]">
            Historical Analysis & Prediction System v2.0
          </p>
        </header>

        {/* Wheels Area */}
        <div className="flex flex-col xl:flex-row items-center justify-center gap-12 xl:gap-24 mb-16">
          <SpinningWheel
            title="Participants"
            items={nameItemsWithAssignedStatus}
            rotation={nameRotation}
            duration={6}
          />
          <SpinningWheel
            title="Topics"
            items={topicItemsWithAssignedStatus}
            rotation={topicRotation}
            duration={6}
          />
        </div>

        {/* Controls */}
        <div className="flex flex-col items-center mb-24">
          {!isCompleted ? (
            <button
              onClick={handleSpin}
              disabled={isSpinning}
              className="px-10 py-4 bg-[#0d0d0d] border border-amber-500/30 hover:bg-amber-500/10 text-amber-500 transition-all font-mono tracking-[0.2em] uppercase text-sm md:text-base disabled:opacity-50 shadow-[0_0_15px_rgba(245,158,11,0.1)] hover:shadow-[0_0_25px_rgba(245,158,11,0.2)] disabled:cursor-not-allowed"
            >
              {isSpinning ? "SYSTEM_BUSY..." : "INITIALIZE_DRAW"}
            </button>
          ) : (
            <div className="text-center animate-in slide-in-from-bottom flex flex-col items-center gap-4">
              <h2 className="text-2xl font-serif italic text-amber-100 tracking-wide">
                All Topics Assigned!
              </h2>
              <div className="flex flex-col md:flex-row gap-4 mt-4">
                <button
                  onClick={downloadPDF}
                  disabled={isGeneratingPDF}
                  className="px-6 py-2 border border-amber-500 hover:border-amber-400 hover:bg-amber-500/20 text-amber-500 transition-all font-mono uppercase text-xs tracking-widest disabled:opacity-50 shadow-[0_0_10px_rgba(245,158,11,0.1)]"
                >
                  {isGeneratingPDF ? "GENERATING..." : "DOWNLOAD_LOG_PDF"}
                </button>
                <button
                  onClick={() => {
                    setAssignments([]);
                    setNameRotation(0);
                    setTopicRotation(0);
                  }}
                  className="px-6 py-2 border border-zinc-700 hover:border-red-500/50 hover:bg-red-500/10 text-zinc-400 hover:text-red-500 transition-all font-mono uppercase text-xs tracking-widest"
                >
                  RESET_QUEUE
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Results Timeline */}
        {assignments.length > 0 && (
          <div className="w-full max-w-4xl animate-in fade-in duration-500">
            <h2 className="text-[10px] md:text-xs font-bold text-zinc-500 uppercase tracking-widest border-b border-white/5 pb-2 mb-6 text-center md:text-left">
              Final Assignments
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {assignments.map((assignment, i) => (
                <div
                  key={i}
                  className="bg-white/[0.03] border border-white/5 p-4 rounded flex flex-col items-start gap-4 hover:border-amber-600/50 transition-colors border-l-amber-600 border-l-2"
                >
                  <div className="flex justify-between items-start w-full">
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] font-mono text-amber-500">PROCESSED</span>
                        <span className="text-[9px] font-mono text-zinc-600">UID: 00{i + 1}-M</span>
                      </div>
                      <p className="font-serif text-amber-100 text-lg truncate mb-1">
                        {assignment.nameVal}
                      </p>
                      <p className="text-[11px] text-zinc-400 font-mono tracking-tight leading-snug break-words">
                        {assignment.topicVal}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Hidden PDF Report Content */}
        <div 
          id="pdf-report-content" 
          className="absolute -left-[9999px] top-0 p-10 w-[800px] font-sans"
          style={{ backgroundColor: '#ffffff', color: '#000000' }}
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl font-serif font-bold mb-2">BAN0001 Presentation Draw Results</h1>
            <h2 className="text-xl font-serif mb-1" style={{ color: '#374151' }}>History of the Emergence of Bangladesh</h2>
            <p className="text-sm" style={{ color: '#6b7280' }}>Generated on {new Date().toLocaleDateString()}</p>
          </div>
          <table className="w-full text-left" style={{ borderCollapse: 'collapse', border: '1px solid #d1d5db' }}>
            <thead>
              <tr style={{ backgroundColor: '#f3f4f6', color: '#1f2937' }}>
                <th className="font-bold text-center" style={{ border: '1px solid #d1d5db', padding: '12px' }}>UID</th>
                <th className="font-bold" style={{ border: '1px solid #d1d5db', padding: '12px' }}>Participant</th>
                <th className="font-bold" style={{ border: '1px solid #d1d5db', padding: '12px' }}>Assigned Topic</th>
              </tr>
            </thead>
            <tbody>
              {assignments.map((a, i) => (
                <tr key={i} style={{ color: '#1f2937' }}>
                  <td className="font-mono text-sm" style={{ border: '1px solid #d1d5db', padding: '12px', width: '80px', textAlign: 'center' }}>00{i + 1}-M</td>
                  <td className="font-semibold" style={{ border: '1px solid #d1d5db', padding: '12px' }}>{a.nameVal}</td>
                  <td className="text-sm" style={{ border: '1px solid #d1d5db', padding: '12px' }}>{a.topicVal}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-12 text-center text-xs" style={{ color: '#9ca3af' }}>
            Generated by Historical Analysis & Prediction System v2.0
          </div>
        </div>
      </main>

      {/* Winner Modal overlays onto the screen */}
      {currentWinner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-[#0a0a0a] border border-amber-500/30 rounded w-full max-w-2xl overflow-hidden shadow-[0_0_50px_rgba(245,158,11,0.1)] flex flex-col relative animate-in zoom-in-95 duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-900/10 to-transparent pointer-events-none" />
            
            <div className="p-8 md:p-10 border-t border-white/5">
              <h2 className="text-2xl md:text-4xl font-serif italic text-amber-100 text-center mb-8 tracking-wide">
                ALLOCATION SUCCESSFUL
              </h2>
              
              <div className="flex flex-col md:flex-row gap-6 bg-white/[0.02] border border-white/5 p-6 mb-8 rounded">
                <div className="flex-1 flex flex-col">
                  <p className="text-[10px] text-zinc-500 uppercase font-mono tracking-widest mb-1">Subjected To:</p>
                  <p className="text-xl text-amber-500 font-serif">{currentWinner.name.primary}</p>
                </div>
                <div className="w-px bg-white/5 hidden md:block"></div>
                <div className="flex-1 flex flex-col">
                  <p className="text-[10px] text-zinc-500 uppercase font-mono tracking-widest mb-1">Allocated Directive:</p>
                  <p className="text-lg text-amber-100 font-serif leading-relaxed">
                    {(currentWinner.topic as any).originalValue || currentWinner.topic.primary}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setCurrentWinner(null)}
                className="w-full py-4 border border-amber-500/50 hover:bg-amber-500/10 text-amber-500 font-mono text-xs md:text-sm uppercase tracking-[0.2em] transition-colors"
              >
                CONFIRM_LOG
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Micro-Bar */}
      <footer className="h-8 border-t border-white/10 px-4 md:px-8 flex items-center justify-between text-[10px] font-mono text-zinc-600 bg-black relative z-10 w-full">
        <div className="flex gap-4">
          <span className="hidden sm:inline">TERM_EMU: ACTIVATED</span>
          <span className="hidden sm:inline text-zinc-800">|</span>
          <span>LATENCY: 14ms</span>
        </div>
        <div className="flex gap-4 items-center">
          <span className="text-amber-500 animate-pulse">●</span>
          <span>SYSTEM_ONLINE</span>
        </div>
      </footer>
    </div>
  );
}
