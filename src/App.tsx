import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, 
  GraduationCap, 
  CheckCircle2, 
  XCircle, 
  ChevronRight, 
  ChevronLeft, 
  RotateCcw,
  Globe,
  Briefcase,
  MessageSquare,
  User,
  Info,
  Volume2,
  Play,
  Check,
  X,
  Keyboard
} from 'lucide-react';
import { VOCABULARY, Word } from './data';
import { generateSpeech, generateImage } from './services/geminiService';

type View = 'home' | 'vocab' | 'grammar' | 'quiz' | 'practice';

export default function App() {
  const [view, setView] = useState<View>('home');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<boolean[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [practiceIndex, setPracticeIndex] = useState(0);
  const [practiceAnswer, setPracticeAnswer] = useState('');
  const [practiceFeedback, setPracticeFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [quizFeedback, setQuizFeedback] = useState<{ isCorrect: boolean, explanation: string } | null>(null);
  const [wordImages, setWordImages] = useState<Record<string, string>>({});
  const [isLoadingImage, setIsLoadingImage] = useState(false);

  const categories = useMemo(() => Array.from(new Set(VOCABULARY.map(w => w.category))), []);

  const filteredVocab = useMemo(() => {
    return selectedCategory 
      ? VOCABULARY.filter(w => w.category === selectedCategory)
      : VOCABULARY;
  }, [selectedCategory]);

  const fetchWordImage = async (word: Word) => {
    if (wordImages[word.korean]) return;
    setIsLoadingImage(true);
    try {
      const imageUrl = await generateImage(word.english);
      if (imageUrl) {
        setWordImages(prev => ({ ...prev, [word.korean]: imageUrl }));
      }
    } catch (error) {
      console.error("Failed to fetch image", error);
    } finally {
      setIsLoadingImage(false);
    }
  };

  // Fetch image for current word in vocab view
  React.useEffect(() => {
    if (view === 'vocab' && filteredVocab[currentWordIndex]) {
      fetchWordImage(filteredVocab[currentWordIndex]);
    }
  }, [view, currentWordIndex, filteredVocab]);

  // Fetch image for current word in practice view
  const grammarPracticeWords = useMemo(() => {
    return VOCABULARY.filter(w => w.hasBatchim !== undefined).sort(() => Math.random() - 0.5);
  }, []);

  React.useEffect(() => {
    if (view === 'practice' && grammarPracticeWords[practiceIndex]) {
      fetchWordImage(grammarPracticeWords[practiceIndex]);
    }
  }, [view, practiceIndex, grammarPracticeWords]);

  const quizWords = useMemo(() => {
    return [...VOCABULARY].sort(() => Math.random() - 0.5).slice(0, 10);
  }, [view === 'quiz']);

  const handleNextWord = () => {
    setIsFlipped(false);
    setCurrentWordIndex((prev) => (prev + 1) % filteredVocab.length);
  };

  const handlePrevWord = () => {
    setIsFlipped(false);
    setCurrentWordIndex((prev) => (prev - 1 + filteredVocab.length) % filteredVocab.length);
  };

  const playAudio = async (text: string) => {
    if (isPlaying) return;
    setIsPlaying(true);
    try {
      const audioUrl = await generateSpeech(text);
      if (audioUrl) {
        const audio = new Audio(audioUrl);
        audio.onended = () => setIsPlaying(false);
        await audio.play();
      } else {
        setIsPlaying(false);
      }
    } catch (error) {
      console.error("Playback failed", error);
      setIsPlaying(false);
    }
  };

  const handleQuizAnswer = (isCorrect: boolean) => {
    const current = quizWords[quizIndex];
    const explanation = `${current.korean}의 뜻은 '${current.english}'입니다.`;
    
    setQuizFeedback({ isCorrect, explanation });
    
    const newAnswers = [...quizAnswers, isCorrect];
    setQuizAnswers(newAnswers);
    if (isCorrect) setQuizScore(prev => prev + 1);
    
    setTimeout(() => {
      setQuizFeedback(null);
      if (quizIndex + 1 < quizWords.length) {
        setQuizIndex(prev => prev + 1);
      } else {
        setQuizFinished(true);
      }
    }, 2000);
  };

  const resetQuiz = () => {
    setQuizScore(0);
    setQuizIndex(0);
    setQuizFinished(false);
    setQuizAnswers([]);
  };

  const handlePracticeSubmit = () => {
    const current = grammarPracticeWords[practiceIndex];
    const correctAnswer = current.hasBatchim ? '이에요' : '예요';
    
    if (practiceAnswer === correctAnswer) {
      setPracticeFeedback('correct');
      setShowExplanation(true);
      setTimeout(() => {
        setPracticeFeedback(null);
        setShowExplanation(false);
        setPracticeAnswer('');
        if (practiceIndex + 1 < grammarPracticeWords.length) {
          setPracticeIndex(prev => prev + 1);
        } else {
          setPracticeIndex(0);
        }
      }, 3000);
    } else {
      setPracticeFeedback('incorrect');
      setShowExplanation(true);
      setTimeout(() => {
        setPracticeFeedback(null);
        setShowExplanation(false);
      }, 2000);
    }
  };

  const renderHome = () => (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <header className="text-center space-y-4">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold text-slate-900 tracking-tight"
        >
          사회통합프로그램 (KIIP)
        </motion.h1>
        <p className="text-slate-500 text-lg">초급 1단계 1과: 안녕하세요?</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MenuCard 
          title="단어 학습" 
          description="주제별 카드 & 발음" 
          icon={<BookOpen className="w-6 h-6 text-indigo-500" />}
          onClick={() => setView('vocab')}
        />
        <MenuCard 
          title="기초 문법" 
          description="-이에요 / -예요 규칙" 
          icon={<GraduationCap className="w-6 h-6 text-emerald-500" />}
          onClick={() => setView('grammar')}
        />
        <MenuCard 
          title="문법 연습" 
          description="빈칸 채우기 연습" 
          icon={<Keyboard className="w-6 h-6 text-blue-500" />}
          onClick={() => setView('practice')}
        />
        <MenuCard 
          title="퀴즈" 
          description="학습 내용 확인" 
          icon={<CheckCircle2 className="w-6 h-6 text-orange-500" />}
          onClick={() => setView('quiz')}
        />
      </div>

      <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Info className="w-5 h-5 text-slate-400" />
          오늘의 학습 팁
        </h2>
        <ul className="space-y-3 text-slate-600">
          <li className="flex gap-3">
            <span className="font-bold text-indigo-500">1.</span>
            국가 이름 뒤에 '사람'을 붙이면 국적이 됩니다. (예: 한국 + 사람 = 한국 사람)
          </li>
          <li className="flex gap-3">
            <span className="font-bold text-indigo-500">2.</span>
            받침이 있으면 '-이에요', 받침이 없으면 '-예요'를 사용합니다.
          </li>
        </ul>
      </div>
    </div>
  );

  const renderVocab = () => (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <button 
        onClick={() => setView('home')}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" /> 홈으로
      </button>

      <div className="flex flex-wrap gap-2">
        <button 
          onClick={() => { setSelectedCategory(null); setCurrentWordIndex(0); }}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${!selectedCategory ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
        >
          전체
        </button>
        {categories.map(cat => (
          <button 
            key={cat}
            onClick={() => { setSelectedCategory(cat); setCurrentWordIndex(0); }}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedCategory === cat ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="relative h-80 perspective-1000">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentWordIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="w-full h-full cursor-pointer"
            onClick={() => setIsFlipped(!isFlipped)}
          >
            <motion.div 
              className="w-full h-full relative preserve-3d transition-transform duration-500"
              animate={{ rotateY: isFlipped ? 180 : 0 }}
            >
              {/* Front */}
              <div className="absolute inset-0 backface-hidden bg-white rounded-3xl shadow-xl border border-slate-100 flex flex-col items-center justify-center p-6 text-center overflow-hidden">
                <div className="w-full h-32 mb-4 rounded-xl overflow-hidden bg-slate-100 flex items-center justify-center relative">
                  {isLoadingImage && !wordImages[filteredVocab[currentWordIndex].korean] ? (
                    <div className="animate-pulse flex flex-col items-center gap-2">
                      <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                      <span className="text-[10px] text-slate-400">이미지 생성 중...</span>
                    </div>
                  ) : wordImages[filteredVocab[currentWordIndex].korean] ? (
                    <img 
                      src={wordImages[filteredVocab[currentWordIndex].korean]} 
                      alt={filteredVocab[currentWordIndex].korean}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-slate-300 flex flex-col items-center">
                      <Globe className="w-10 h-10 mb-1" />
                      <span className="text-[10px]">이미지 없음</span>
                    </div>
                  )}
                </div>
                <span className="text-xs font-bold text-indigo-500 uppercase tracking-widest mb-2">
                  {filteredVocab[currentWordIndex].category}
                </span>
                <h2 className="text-4xl font-bold text-slate-900 mb-1">
                  {filteredVocab[currentWordIndex].korean}
                </h2>
                <button 
                  onClick={(e) => { e.stopPropagation(); playAudio(filteredVocab[currentWordIndex].korean); }}
                  disabled={isPlaying}
                  className={`mt-2 p-2 rounded-full transition-all ${isPlaying ? 'bg-slate-100 text-slate-300' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'}`}
                >
                  <Volume2 className="w-5 h-5" />
                </button>
                <p className="text-slate-400 text-xs mt-4">클릭해서 뜻 확인하기</p>
              </div>

              {/* Back */}
              <div 
                className="absolute inset-0 backface-hidden bg-indigo-600 rounded-3xl shadow-xl flex flex-col items-center justify-center p-8 text-center text-white"
                style={{ transform: 'rotateY(180deg)' }}
              >
                <h2 className="text-4xl font-medium mb-4">
                  {filteredVocab[currentWordIndex].english}
                </h2>
                <div className="mt-4 p-3 bg-white/10 rounded-xl text-sm">
                  {filteredVocab[currentWordIndex].hasBatchim !== undefined && (
                    <p>받침: {filteredVocab[currentWordIndex].hasBatchim ? '있음 (O)' : '없음 (X)'}</p>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-between px-4">
        <button 
          onClick={handlePrevWord}
          className="p-3 rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <span className="text-slate-500 font-medium">
          {currentWordIndex + 1} / {filteredVocab.length}
        </span>
        <button 
          onClick={handleNextWord}
          className="p-3 rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );

  const renderGrammar = () => (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      <button 
        onClick={() => setView('home')}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" /> 홈으로
      </button>

      <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-slate-900">문법: -이에요 / -예요</h2>
          <p className="text-slate-500">명사 뒤에 붙어 '이다'의 의미를 나타냅니다.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
            <h3 className="font-bold text-indigo-600 mb-2">받침이 있을 때 (O)</h3>
            <p className="text-2xl font-bold mb-2">-이에요</p>
            <p className="text-sm text-slate-500">예: 학생 + 이에요 = 학생이에요.</p>
          </div>
          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
            <h3 className="font-bold text-emerald-600 mb-2">받침이 없을 때 (X)</h3>
            <p className="text-2xl font-bold mb-2">-예요</p>
            <p className="text-sm text-slate-500">예: 의사 + 예요 = 의사예요.</p>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100">
          <h3 className="font-bold text-slate-800 mb-4">연습해 보세요!</h3>
          <div className="space-y-4">
            {VOCABULARY.filter(w => w.hasBatchim !== undefined).slice(0, 5).map(word => (
              <div key={word.korean} className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl">
                <span className="text-lg font-medium">{word.korean}</span>
                <span className="text-indigo-600 font-bold">
                  {word.korean}{word.hasBatchim ? '이에요' : '예요'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderPractice = () => {
    const current = grammarPracticeWords[practiceIndex];
    return (
      <div className="max-w-2xl mx-auto p-6 space-y-8">
        <button 
          onClick={() => setView('home')}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> 홈으로
        </button>

        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold">문법 연습: 빈칸 채우기</h2>
            <p className="text-slate-500">알맞은 종결 어미(-이에요/예요)를 입력하세요.</p>
          </div>

          <div className="flex flex-col items-center justify-center p-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-6">
            <div className="w-48 h-32 rounded-xl overflow-hidden shadow-sm bg-white flex items-center justify-center relative">
              {isLoadingImage && !wordImages[current.korean] ? (
                <div className="animate-pulse flex flex-col items-center gap-2">
                  <div className="w-6 h-6 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : wordImages[current.korean] ? (
                <img src={wordImages[current.korean]} alt={current.korean} className="w-full h-full object-cover" />
              ) : (
                <Globe className="w-8 h-8 text-slate-200" />
              )}
            </div>
            <div className="flex items-center gap-4 text-4xl font-bold">
              <span>{current.korean}</span>
              <div className="relative">
                <input 
                  type="text"
                  value={practiceAnswer}
                  onChange={(e) => setPracticeAnswer(e.target.value)}
                  placeholder="......"
                  disabled={showExplanation}
                  className={`w-32 text-center border-b-4 focus:outline-none transition-colors ${
                    practiceFeedback === 'correct' ? 'border-emerald-500 text-emerald-600' : 
                    practiceFeedback === 'incorrect' ? 'border-rose-500 text-rose-600' : 
                    'border-slate-300 focus:border-indigo-500'
                  }`}
                />
                <AnimatePresence>
                  {practiceFeedback === 'correct' && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -right-10 top-1 text-emerald-500">
                      <Check className="w-8 h-8" />
                    </motion.div>
                  )}
                  {practiceFeedback === 'incorrect' && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -right-10 top-1 text-rose-500">
                      <X className="w-8 h-8" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <span>.</span>
            </div>

            <div className="flex gap-2">
              <button 
                onClick={() => setPracticeAnswer('이에요')}
                disabled={showExplanation}
                className="px-4 py-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all text-sm font-medium disabled:opacity-50"
              >
                -이에요
              </button>
              <button 
                onClick={() => setPracticeAnswer('예요')}
                disabled={showExplanation}
                className="px-4 py-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all text-sm font-medium disabled:opacity-50"
              >
                -예요
              </button>
            </div>

            <button 
              onClick={handlePracticeSubmit}
              disabled={showExplanation}
              className="w-full max-w-xs py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg hover:bg-indigo-700 transition-all disabled:opacity-50"
            >
              확인
            </button>
          </div>

          <AnimatePresence>
            {showExplanation && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                className={`p-6 rounded-2xl border ${practiceFeedback === 'correct' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-rose-50 border-rose-100 text-rose-800'}`}
              >
                <h4 className="font-bold mb-2 flex items-center gap-2">
                  {practiceFeedback === 'correct' ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                  {practiceFeedback === 'correct' ? '정답입니다!' : '다시 생각해 보세요.'}
                </h4>
                <p className="text-sm">
                  <strong>해설:</strong> '{current.korean}'은(는) 마지막 글자에 받침이 {current.hasBatchim ? '있으므로(O)' : '없으므로(X)'} 
                  <strong> '-{current.hasBatchim ? '이에요' : '예요'}'</strong>를 사용하는 것이 맞습니다.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="bg-indigo-50 p-4 rounded-xl flex gap-3 items-start">
            <Info className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
            <div className="text-sm text-indigo-700">
              <p className="font-bold">힌트:</p>
              <p>'{current.korean}'은(는) 받침이 {current.hasBatchim ? '있습니다' : '없습니다'}.</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderQuiz = () => {
    if (quizFinished) {
      return (
        <div className="max-w-md mx-auto p-6 text-center space-y-8">
          <div className="space-y-4">
            <div className="w-24 h-24 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-12 h-12" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900">참 잘했어요!</h2>
            <p className="text-slate-500 text-lg">점수: {quizScore} / {quizWords.length}</p>
          </div>
          
          <div className="grid grid-cols-5 gap-2">
            {quizAnswers.map((ans, i) => (
              <div key={i} className={`h-2 rounded-full ${ans ? 'bg-emerald-500' : 'bg-rose-500'}`} />
            ))}
          </div>

          <div className="flex gap-4">
            <button 
              onClick={resetQuiz}
              className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-5 h-5" /> 다시 하기
            </button>
            <button 
              onClick={() => setView('home')}
              className="flex-1 py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl font-bold hover:bg-slate-50 transition-all"
            >
              홈으로
            </button>
          </div>
        </div>
      );
    }

    const currentQuizWord = quizWords[quizIndex];
    const options = [...VOCABULARY]
      .filter(w => w.korean !== currentQuizWord.korean)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .concat(currentQuizWord)
      .sort(() => Math.random() - 0.5);

    return (
      <div className="max-w-2xl mx-auto p-6 space-y-8">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => setView('home')}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> 그만하기
          </button>
          <span className="text-slate-500 font-medium">문제 {quizIndex + 1} / {quizWords.length}</span>
        </div>

        <div className="bg-white rounded-3xl p-10 shadow-sm border border-slate-100 text-center space-y-8 relative overflow-hidden">
          <AnimatePresence>
            {quizFeedback && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`absolute inset-0 z-20 flex flex-col items-center justify-center p-8 ${quizFeedback.isCorrect ? 'bg-emerald-500/95 text-white' : 'bg-rose-500/95 text-white'}`}
              >
                {quizFeedback.isCorrect ? <CheckCircle2 className="w-20 h-20 mb-4" /> : <XCircle className="w-20 h-20 mb-4" />}
                <h3 className="text-3xl font-bold mb-2">{quizFeedback.isCorrect ? '정답입니다!' : '틀렸습니다'}</h3>
                <p className="text-lg opacity-90">{quizFeedback.explanation}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <span className="px-4 py-1 bg-slate-100 text-slate-500 rounded-full text-xs font-bold uppercase tracking-widest">
            뜻을 맞혀보세요
          </span>
          
          <div className="w-64 h-40 mx-auto rounded-2xl overflow-hidden shadow-md bg-slate-50 flex items-center justify-center">
            {wordImages[currentQuizWord.korean] ? (
              <img src={wordImages[currentQuizWord.korean]} alt={currentQuizWord.korean} className="w-full h-full object-cover" />
            ) : (
              <div className="text-slate-200 flex flex-col items-center">
                <Globe className="w-12 h-12" />
                <span className="text-[10px]">이미지 준비 중</span>
              </div>
            )}
          </div>

          <h2 className="text-6xl font-bold text-slate-900">{currentQuizWord.korean}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-8">
            {options.map((opt, i) => (
              <button
                key={i}
                onClick={() => handleQuizAnswer(opt.korean === currentQuizWord.korean)}
                disabled={!!quizFeedback}
                className="p-5 text-lg font-medium bg-white border-2 border-slate-100 rounded-2xl hover:border-indigo-500 hover:bg-indigo-50 transition-all text-slate-700 disabled:opacity-50"
              >
                {opt.english}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <nav className="bg-white border-b border-slate-200 py-4 px-6 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('home')}>
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">
              K
            </div>
            <span className="font-bold text-xl tracking-tight hidden sm:block">KIIP Study</span>
          </div>
          <div className="flex gap-6">
            <NavIcon icon={<Globe />} label="국가" active={selectedCategory === '국가'} onClick={() => { setView('vocab'); setSelectedCategory('국가'); }} />
            <NavIcon icon={<Briefcase />} label="직업" active={selectedCategory === '직업'} onClick={() => { setView('vocab'); setSelectedCategory('직업'); }} />
            <NavIcon icon={<MessageSquare />} label="인사" active={selectedCategory === '인사말'} onClick={() => { setView('vocab'); setSelectedCategory('인사말'); }} />
            <NavIcon icon={<User />} label="명사" active={selectedCategory === '명사/대명사'} onClick={() => { setView('vocab'); setSelectedCategory('명사/대명사'); }} />
          </div>
        </div>
      </nav>

      <main className="py-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {view === 'home' && renderHome()}
            {view === 'vocab' && renderVocab()}
            {view === 'grammar' && renderGrammar()}
            {view === 'practice' && renderPractice()}
            {view === 'quiz' && renderQuiz()}
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="py-10 text-center text-slate-400 text-sm">
        <p>© 2026 KIIP 초급 1단계 학습 도우미</p>
      </footer>

      <style>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .preserve-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
      `}</style>
    </div>
  );
}

function MenuCard({ title, description, icon, onClick }: { title: string, description: string, icon: React.ReactNode, onClick: () => void }) {
  return (
    <motion.button
      whileHover={{ y: -5 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 text-left space-y-4 hover:shadow-md transition-all group"
    >
      <div className="p-3 bg-slate-50 rounded-2xl w-fit group-hover:bg-indigo-50 transition-colors">
        {icon}
      </div>
      <div>
        <h3 className="text-xl font-bold text-slate-900">{title}</h3>
        <p className="text-slate-500">{description}</p>
      </div>
    </motion.button>
  );
}

function NavIcon({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center gap-1 transition-colors ${active ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
    >
      {React.cloneElement(icon as React.ReactElement, { className: 'w-5 h-5' })}
      <span className="text-[10px] font-bold uppercase tracking-tighter">{label}</span>
    </button>
  );
}
