import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './css/Onboarding.css';
import { useAuth } from './context/AuthContext';
import type { Question, FormData } from './types';
import { checkOnboardingStatus, finishOnboarding } from './data/onboardingData';




const Onboarding = () => {
    const { user } = useAuth();
    const [step, setStep] = useState(0);
    const [formData, setFormData] = useState<FormData>({
        portfolioIntro: '',
        investmentGoal: '',
        riskTolerance: '',
        experience: '',
        portfolioName: ''
    });
    const [isAnimating, setIsAnimating] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        setTimeout(() => setIsAnimating(true), 100);
    }, []);
    useEffect(() => {
    const checkStatus = async () => {
        try {
        const { isNewUser } = await checkOnboardingStatus();
        
        if (!isNewUser) {
            navigate('/dashboard');
        }
        } catch (error) {
            console.error('Failed to check onboarding status:', error);
        }
    };

    checkStatus();
    }, [navigate]);
    const questions: Question[] = [
    {
        id: 'portfolioIntro',
        question: `Hey ${user?.name}!`,
        type: "intro",
    },
    {
        id: 'investmentGoal',
        question: "What's your primary investment goal?",
        type: 'question',
        options: [
        { value: 'wealth-building', label: 'Wealth Building', icon: '', desc: 'Long-term growth and capital appreciation' },
        { value: 'retirement', label: 'Retirement Planning', icon: '', desc: 'Building a secure financial future' },
        { value: 'passive-income', label: 'Passive Income', icon: '', desc: 'Generate regular dividend income' },
        { value: 'learning', label: 'Learning & Exploring', icon: '', desc: 'Understanding markets and investing' }
        ]
    },
    {
        id: 'riskTolerance',
        question: "How do you feel about risk?",
        type: 'question',
        options: [
        { value: 'conservative', label: 'Conservative', icon: '', desc: 'I prefer stability and lower volatility' },
        { value: 'moderate', label: 'Moderate', icon: '', desc: 'Balanced approach with calculated risks' },
        { value: 'aggressive', label: 'Aggressive', icon: '', desc: 'Higher risk for potential higher returns' }
        ]
    },
    {
        id: 'experience',
        question: "What's your investing experience?",
        type: 'question',
        options: [
        { value: 'beginner', label: 'Just Starting', icon: '', desc: 'New to investing and learning the basics' },
        { value: 'intermediate', label: 'Some Experience', icon: '', desc: 'Familiar with markets and basic strategies' },
        { value: 'advanced', label: 'Very Experienced', icon: '', desc: 'Active investor with deep market knowledge' }
        ]
    },
    {
        id: 'portfolioName',
        question: "Name your first portfolio",
        type: 'text',
        placeholder: 'e.g., Growth Portfolio, Retirement Fund...'
    },
    ];
    const currentQuestion = questions[step];

    const handleSelect = (value: string) => {
        setFormData({ ...formData, [currentQuestion.id]: value });
        
        if (currentQuestion.type !== 'text') {
        setTimeout(() => {
            if (step < questions.length - 1) {
            setStep(step + 1);
            }
        }, 400);
        }
    };

    const handleTextSubmit = (e: { preventDefault: () => void; }) => {
        e.preventDefault();
        if (formData.portfolioName.trim()) {
        handleFinish();
        }
    };

    const handleFinish = async () => {
        try {
        const res = await finishOnboarding(formData);
        if(res){
            setIsAnimating(false);
            setTimeout(() => navigate('/dashboard'), 300);
        }
        } catch (error) {
        console.error('Onboarding error:', error);
        }
    };

    const progress = ((step+1) / questions.length) * 100;

    return (
        <div className="onboarding-container">
        <div className="onboarding-background">
            <div className="gradient-orb orb-1"></div>
            <div className="gradient-orb orb-2"></div>
            <div className="gradient-orb orb-3"></div>
        </div>

        <div className={`onboarding-content ${isAnimating ? 'animate-in' : ''}`}>
            <div className="onboarding-header">
            <div className="logo gap-0">
                <img src="/logo.png" className="text-primary nav-bar-logo"/>
                <span className="ps-0 logo-text">quorix+</span>
            </div>
            <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${progress}%` }}></div>
            </div>
            <p className="step-indicator">Step {step} of {questions.length - 1}</p>
            </div>

            <div className="question-container" key={step}>
            <h1 className="question-text">{currentQuestion.question}</h1>

            {currentQuestion.type === 'text' ? (
                <form onSubmit={handleTextSubmit} className="text-input-form">
                <input
                    type="text"
                    className="portfolio-name-input"
                    placeholder={currentQuestion.placeholder}
                    value={formData.portfolioName}
                    onChange={(e) => setFormData({ ...formData, portfolioName: e.target.value })}
                    autoFocus
                />
                <button 
                    type="submit" 
                    className="continue-btn"
                    disabled={!formData.portfolioName.trim()}
                >
                    Complete Setup <span className="arrow">→</span>
                </button>
                </form>
            ) : currentQuestion.type === 'intro'? <>
                <button className='back-btn'
                    onClick={()=>setStep(step+1)}
                >&#8594;</button>
            </>:(
                <div className="options-grid">
                {currentQuestion.options?.map((option, idx) => (
                    <button
                    key={option.value}
                    className={`text-white option-card ${formData[currentQuestion.id] === option.value ? 'selected' : ''}`}
                    onClick={() => handleSelect(option.value)}
                    style={{ animationDelay: `${idx * 0.1}s` }}
                    >
                    <span className="option-icon">{option.icon}</span>
                    <span className="option-label">{option.label}</span>
                    {option.desc && <span className="option-desc">{option.desc}</span>}
                    </button>
                ))}
                </div>
            )}
            </div>

            {step > 0 && (
            <button className="back-btn" onClick={() => setStep(step - 1)}>
                ← Back
            </button>
            )}
        </div>
        </div>
    );
};

export default Onboarding;