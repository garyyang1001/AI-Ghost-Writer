// Simple test for humanization system
import { HumanizeService } from './services/humanizeService.js';

const testConfig = {
  enabled: true,
  intensity: 70,
  logicStyle: 'spiral',
  verbalTics: ['說實話', '我跟你講', '重點來了'],
  personalPhrases: ['真的', '其實', '確實'],
  rhythmPattern: 'varied',
  emphasisStrategy: 'strategic',
  removeAIPhrases: true,
  addOpinions: true,
  varyParagraphLength: true,
  useConversationalTone: true
};

const sampleAIContent = `
在當今世界中，人工智慧技術的發展已經達到了前所未有的高度。總而言之，AI不僅如此改變了我們的工作方式，此外還深入探討了教育、醫療等各個領域。值得注意的是，這些強大的技術正在革命性地改變我們的生活。

研究表明，AI在提升效率方面具有至關重要的作用。更重要的是，先進的機器學習算法能夠處理大量數據。因此，我們可以得出結論，人工智慧將繼續在未來發揮重要作用。

總結來說，AI技術的進步為人類社會帶來了巨大的變革。綜觀全文，我們必須認真思考如何更好地利用這些創新技術。
`;

async function testHumanization() {
  console.log('🧪 Testing AI Flavor Removal System...\n');
  
  try {
    const humanizer = new HumanizeService(testConfig);
    const result = await humanizer.humanize(sampleAIContent);
    
    console.log('📊 Humanity Score:', Math.round(result.humanityScore.overall) + '%');
    console.log('');
    
    console.log('📝 Score Breakdown:');
    console.log(`- Logic Variance: ${result.humanityScore.breakdown.logicVariance}%`);
    console.log(`- Vocabulary Naturalness: ${result.humanityScore.breakdown.vocabularyNaturalness}%`);
    console.log(`- Rhythm Variation: ${result.humanityScore.breakdown.rhythmVariation}%`);
    console.log(`- Emotional Content: ${result.humanityScore.breakdown.emotionalContent}%`);
    console.log(`- Personality Strength: ${result.humanityScore.breakdown.personalityStrength}%`);
    console.log('');
    
    console.log('🔄 Transformations Applied:', result.transformations.length);
    result.transformations.forEach((transform, idx) => {
      console.log(`  ${idx + 1}. ${transform.type}: "${transform.original}" → "${transform.transformed}"`);
    });
    console.log('');
    
    console.log('💡 Suggestions:');
    result.humanityScore.suggestions.forEach(suggestion => {
      console.log(`  - ${suggestion}`);
    });
    console.log('');
    
    console.log('📋 BEFORE (AI味濃厚):');
    console.log('─'.repeat(50));
    console.log(result.originalContent);
    console.log('');
    
    console.log('✨ AFTER (人性化):');
    console.log('─'.repeat(50));
    console.log(result.humanizedContent);
    console.log('');
    
    console.log('✅ Test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Export for use in other contexts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { testHumanization, testConfig, sampleAIContent };
} else {
  // Run test if called directly
  testHumanization();
}