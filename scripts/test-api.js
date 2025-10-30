#!/usr/bin/env node

/**
 * API Key 測試腳本
 * 用於驗證 Google Gemini API Key 是否正確配置
 */

import { GoogleGenAI } from '@google/genai';
import * as dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 載入環境變數
dotenv.config({ path: path.join(__dirname, '../.env') });

async function testApiKey() {
  console.log('🧪 Testing Google Gemini API Key Configuration...\n');

  // 檢查環境變數
  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
  
  if (!apiKey) {
    console.error('❌ No API key found!');
    console.error('Please set GEMINI_API_KEY in your .env file');
    console.error('Example: GEMINI_API_KEY=your_api_key_here');
    process.exit(1);
  }

  console.log('✅ API Key found in environment variables');
  console.log(`📝 API Key: ${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 4)}`);
  
  try {
    // 初始化 Gemini AI
    const genAI = new GoogleGenAI(apiKey);
    console.log('✅ GoogleGenAI client initialized');

    // 測試 API 調用
    console.log('🔄 Testing API call...');
    
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const prompt = 'Hello! Please respond with "API test successful" if you receive this message.';
    
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    console.log('✅ API call successful!');
    console.log(`📤 Sent: ${prompt}`);
    console.log(`📥 Received: ${text}`);
    console.log('\n🎉 Your Google Gemini API Key is working correctly!');
    console.log('Ready for local development and cloud deployment.');

  } catch (error) {
    console.error('❌ API call failed:');
    console.error(error.message);
    
    if (error.message.includes('API_KEY_INVALID')) {
      console.error('\n💡 Suggestions:');
      console.error('1. Check if your API key is correct');
      console.error('2. Ensure the API key is active in Google AI Studio');
      console.error('3. Verify API key permissions');
    } else if (error.message.includes('PERMISSION_DENIED')) {
      console.error('\n💡 Suggestions:');
      console.error('1. Enable the Generative AI API in Google Cloud Console');
      console.error('2. Check API key permissions and quotas');
    } else if (error.message.includes('QUOTA_EXCEEDED')) {
      console.error('\n💡 Suggestions:');
      console.error('1. Check your API usage quotas');
      console.error('2. Wait for quota reset or upgrade your plan');
    }
    
    process.exit(1);
  }
}

// 運行測試
testApiKey().catch(console.error);