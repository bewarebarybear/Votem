import React, { useState, useEffect } from 'react';

interface QuestionItem {
  date: string;
  question: string;
  yesVotes: number;
  noVotes: number;
}

export default function App() {
  // Master list of scheduled questions
  const questionsList: QuestionItem[] = [
    {
      date: '2026-08-03',
      question: 'Have you ever stolen something in your life?',
      yesVotes: 0,
      noVotes: 0,
    },
    {
      date: '2026-08-02',
      question: 'Do you pee in the public swimming pool?',
      yesVotes: 0,
      noVotes: 0,
    },
    {
      date: '2026-08-01',
      question: 'Do you pee in the shower or bath?',
      yesVotes: 21,
      noVotes: 57,
    },
    {
      date: '2026-07-31',
      question: 'Should space exploration be prioritized over earth climate recovery?',
      yesVotes: 95,
      noVotes: 110,
    },
    {
      date: '2026-07-30',
      question: 'Is artificial intelligence a net positive for humanity?',
      yesVotes: 142,
      noVotes: 89,
    },
    {
      date: '2026-07-29',
      question: 'Should remote work become the permanent global standard?',
      yesVotes: 310,
      noVotes: 145,
    },
  ];

  // Helper to determine today's active question safely by sorting dates
  const getActiveQuestion = () => {
    const todayStr = new Date().toLocaleDateString('en-CA'); // Local YYYY-MM-DD format
    const sorted = [...questionsList].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const found = sorted.find((q) => q.date === todayStr);
    return found || sorted.find((q) => q.date <= todayStr) || sorted[0];
  };

  const activeQ = getActiveQuestion();

  const [currentData, setCurrentData] = useState<QuestionItem>(activeQ);
  const [hasVoted, setHasVoted] = useState<boolean>(false);
  const [userChoice, setUserChoice] = useState<'yes' | 'no' | null>(null);

  useEffect(() => {
    const votedState = localStorage.getItem(`voted_${currentData.date}`);
    if (votedState) {
      setHasVoted(true);
      setUserChoice(votedState as 'yes' | 'no');
    }
  }, [currentData.date]);

  const handleVote = (choice: 'yes' | 'no') => {
    if (hasVoted) return;

    if (choice === 'yes') {
      setCurrentData((prev) => ({ ...prev, yesVotes: prev.yesVotes + 1 }));
    } else {
      setCurrentData((prev) => ({ ...prev, noVotes: prev.noVotes + 1 }));
    }

    setHasVoted(true);
    setUserChoice(choice);
    localStorage.setItem(`voted_${currentData.date}`, choice);
  };

  const totalVotes = currentData.yesVotes + currentData.noVotes;
  const yesPercent = totalVotes > 0 ? Math.round((currentData.yesVotes / totalVotes) * 100) : 50;
  const noPercent = totalVotes > 0 ? 100 - yesPercent : 50;

  const formattedDate = new Date(currentData.date + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).toUpperCase();

  // Archive ONLY questions with dates strictly older than the current active question
  const archiveList = questionsList
    .filter((q) => q.date < currentData.date)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="min-h-screen bg-black text-white font-mono p-4 max-w-md mx-auto flex flex-col justify-between">
      <div>
        <header className="flex justify-between items-center border-b border-white pb-3 mb-6">
          <h1 className="text-xl font-black tracking-widest">VOTEM</h1>
          <span className="text-xs tracking-wider text-neutral-400">{formattedDate}</span>
        </header>

        <main className="mb-8">
          <h2 className="text-2xl font-bold leading-snug mb-6">{currentData.question}</h2>

          {!hasVoted ? (
            <div className="grid grid-cols-2 gap-4 h-64">
              <button
                onClick={() => handleVote('yes')}
                className="bg-green-500 hover:bg-green-400 text-black font-black text-3xl rounded flex flex-col items-center justify-center transition-transform active:scale-95 border-2 border-white shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]"
              >
                YES
                <span className="text-xs mt-2 font-normal tracking-wider opacity-80">TAP TO VOTE</span>
              </button>
              <button
                onClick={() => handleVote('no')}
                className="bg-red-600 hover:bg-red-500 text-white font-black text-3xl rounded flex flex-col items-center justify-center transition-transform active:scale-95 border-2 border-white shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]"
              >
                NO
                <span className="text-xs mt-2 font-normal tracking-wider opacity-80">TAP TO VOTE</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 border-2 border-white bg-neutral-900 rounded">
                <div className="flex justify-between text-sm mb-2 font-bold">
                  <span className="text-green-400">YES ({yesPercent}%)</span>
                  <span className="text-red-500">NO ({noPercent}%)</span>
                </div>
                <div className="w-full bg-neutral-800 h-6 rounded overflow-hidden flex border border-white">
                  <div style={{ width: `${yesPercent}%` }} className="bg-green-500 h-full transition-all duration-500"></div>
                  <div style={{ width: `${noPercent}%` }} className="bg-red-600 h-full transition-all duration-500"></div>
                </div>
                <p className="text-center text-xs text-neutral-400 mt-3">
                  TOTAL VOTES: {totalVotes} • YOU VOTED <span className="uppercase font-bold text-white">{userChoice}</span>
                </p>
              </div>
            </div>
          )}
        </main>

        <section className="border-t border-neutral-800 pt-6">
          <h3 className="text-sm font-bold tracking-widest text-neutral-400 mb-4">ARCHIVE</h3>
          <div className="space-y-4">
            {archiveList.map((item, index) => {
              const computedOutcome =
                item.yesVotes > item.noVotes
                  ? 'YES WINS'
                  : item.noVotes > item.yesVotes
                  ? 'NO WINS'
                  : 'TIE';

              return (
                <div key={index} className="p-4 border border-neutral-800 rounded bg-neutral-950">
                  <div className="flex justify-between items-center text-xs text-neutral-500 mb-2">
                    <span>{item.date}</span>
                    <span className="text-green-400 border border-green-900 px-2 py-0.5 rounded text-[10px]">
                      {computedOutcome} ({item.yesVotes} / {item.noVotes})
                    </span>
                  </div>
                  <p className="text-sm font-medium">{item.question}</p>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      <footer className="mt-12 text-center text-xs text-neutral-600">
        Votem Protocol • Decentralized Web Management
      </footer>
    </div>
  );
}
