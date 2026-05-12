import { google } from '@ai-sdk/google';
import { customProvider } from 'ai';
import { isTestEnvironment } from '../constants';

export const myProvider = isTestEnvironment
  ? (() => {
      const { chatModel, titleModel } = require('./models.mock');
      return customProvider({
        languageModels: {
          'chat-model': chatModel,
          'title-model': titleModel,
        },
      });
    })()
  : customProvider({
      languageModels: {
        'chat-model': google('gemini-2.0-flash'),
        'title-model': google('gemini-2.0-flash'),
      },
    });

export function getLanguageModel(modelId: string) {
  if (isTestEnvironment && myProvider) {
    return myProvider.languageModel(modelId);
  }
  return myProvider.languageModel(modelId);
}

export function getTitleModel() {
  if (isTestEnvironment && myProvider) {
    return myProvider.languageModel('title-model');
  }
  return myProvider.languageModel('title-model');
}
