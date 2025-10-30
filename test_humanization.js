// Test script to verify 10% vs 90% humanization differences
import { HumanizeService } from './services/humanizeService.js';

// Sample AI-generated content to test
const sampleContent = `
總而言之，人工智慧技術的發展確實帶來了革命性的變化。值得注意的是，這項技術不僅改變了我們的工作方式，更重要的是，它正在深入探討人類與機器協作的新模式。

研究表明，AI技術在各個領域都展現出了強大的潛力。數據顯示，超過70%的企業已經開始採用AI解決方案。此外，專家預測未來五年內，AI將成為推動經濟增長的關鍵因素。

綜上所述，我們必須認真思考如何在擁抱這項創新技術的同時，確保它能夠為人類社會帶來最大的福祉。不可否認的是，這將是一個需要持續探索和完善的過程。
`;

console.log('=== AI Ghost Writer Humanization Test ===\n');

// Test with 10% intensity (low humanization)
console.log('🔸 Testing 10% Intensity (Low Humanization)');
const lowConfig = {
  enabled: true,
  intensity: 10,
  logicStyle: 'spiral',
  verbalTics: ['說實話', '其實'],
  personalPhrases: ['真的', '確實'],
  rhythmPattern: 'varied',
  emphasisStrategy: 'strategic',
  removeAIPhrases: true,
  addOpinions: true,
  varyParagraphLength: true,
  useConversationalTone: true
};

const lowHumanizer = new HumanizeService(lowConfig);
const lowResult = await lowHumanizer.humanize(sampleContent);

console.log('Original AI Content:');
console.log(sampleContent);
console.log('\n10% Humanized Content:');
console.log(lowResult.humanizedContent);
console.log('\n10% Transformations Applied:', lowResult.transformations.length);
console.log('10% Humanity Score:', Math.round(lowResult.humanityScore.overall));

// Test with 90% intensity (high humanization)
console.log('\n\n🔸 Testing 90% Intensity (High Humanization)');
const highConfig = {
  enabled: true,
  intensity: 90,
  logicStyle: 'conversational',
  verbalTics: ['說實話', '我跟你講', '重點來了', '其實啊'],
  personalPhrases: ['真的', '說真的', '你懂我意思吧'],
  rhythmPattern: 'varied',
  emphasisStrategy: 'emotional',
  removeAIPhrases: true,
  addOpinions: true,
  varyParagraphLength: true,
  useConversationalTone: true
};

const highHumanizer = new HumanizeService(highConfig);
const highResult = await highHumanizer.humanize(sampleContent);

console.log('90% Humanized Content:');
console.log(highResult.humanizedContent);
console.log('\n90% Transformations Applied:', highResult.transformations.length);
console.log('90% Humanity Score:', Math.round(highResult.humanityScore.overall));

// Compare the differences
console.log('\n\n📊 Comparison Analysis:');
console.log(`Transformation Count Difference: ${highResult.transformations.length - lowResult.transformations.length}`);
console.log(`Humanity Score Difference: ${Math.round(highResult.humanityScore.overall - lowResult.humanityScore.overall)}`);

console.log('\n🔍 Key Probability Rates at Different Intensities:');
console.log('10% Intensity:');
console.log(`  - Verbal Tic Probability: ${Math.round((0.1 + (0.1 * 0.1 * 0.6)) * 100)}%`);
console.log(`  - Opinion Injection: ${Math.round((0.15 + (0.1 * 0.1 * 0.55)) * 100)}%`);
console.log(`  - Structural Changes: ${Math.round((0.2 + (0.1 * 0.1 * 0.4)) * 100)}%`);

console.log('\n90% Intensity:');
console.log(`  - Verbal Tic Probability: ${Math.round((0.1 + (0.9 * 0.9 * 0.6)) * 100)}%`);
console.log(`  - Opinion Injection: ${Math.round((0.15 + (0.9 * 0.9 * 0.55)) * 100)}%`);
console.log(`  - Structural Changes: ${Math.round((0.2 + (0.9 * 0.9 * 0.4)) * 100)}%`);

console.log('\n✅ Test completed! The dramatic differences should now be visible.');