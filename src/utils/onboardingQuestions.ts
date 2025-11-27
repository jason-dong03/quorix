import type { Question } from "../types";

    export function getOnboardingQuestions(name: string | undefined){

    const questions: Question[] = [
    {
        id: 'portfolioIntro',
        question: `Hey ${name}!`,
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

    return questions;
}