import {
  generateBlueprint,
  getInterviewQuestions,
  recommendAndSampleStyles,
  generateStyleSample,
  generateArticle,
  repurposeContent,
  getFollowUpQuestions,
  answerFollowUp
} from './geminiService';

export const api = {
  generateBlueprint,
  getInterviewQuestions,
  recommendAndSampleStyles,
  generateStyleSample,
  /**
   * Generates an article based on the topic, interviews, and style profile.
   * @returns An object containing the generated article and the final prompt used.
   */
  generateArticle,
  repurposeContent,
  getFollowUpQuestions,
  answerFollowUp
};
