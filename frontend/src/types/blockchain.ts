export interface PromptData {
    prompt: string
}

export interface AnswerData {
    success: boolean,
    data: {
        naturalLanguageExplanation: string
    }
}