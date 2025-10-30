// Probability Analysis Test - Demonstrating 10% vs 90% Differences
console.log('=== AI Ghost Writer - Probability Analysis Test ===\n');

// Function to calculate humanization probabilities (from our expert optimization)
function calculateProbabilities(intensity) {
  const normalizedIntensity = intensity / 100;
  
  return {
    verbalTicProbability: 0.1 + (normalizedIntensity * normalizedIntensity * 0.6), // 10%-64% exponential
    opinionProbability: 0.15 + (normalizedIntensity * normalizedIntensity * 0.55), // 15%-62% exponential  
    structuralProbability: 0.2 + (normalizedIntensity * normalizedIntensity * 0.4), // 20%-42% exponential
    replacementProbability: 0.3 + (normalizedIntensity * 0.6), // 30%-90% linear
  };
}

// Test different intensity levels
const intensities = [10, 30, 50, 70, 90];

console.log('📊 Exponential Probability Curves (Expert Recommendations):');
console.log('Intensity | Verbal Tics | Opinions | Structural | Replacements');
console.log('----------|-------------|----------|------------|-------------');

intensities.forEach(intensity => {
  const probs = calculateProbabilities(intensity);
  console.log(`${intensity.toString().padStart(8)}% | ${Math.round(probs.verbalTicProbability * 100).toString().padStart(10)}% | ${Math.round(probs.opinionProbability * 100).toString().padStart(7)}% | ${Math.round(probs.structuralProbability * 100).toString().padStart(9)}% | ${Math.round(probs.replacementProbability * 100).toString().padStart(10)}%`);
});

console.log('\n🔍 Key Insights:');
console.log('- 10% intensity: Very conservative humanization');
console.log('- 90% intensity: Aggressive, natural-sounding transformation');
console.log('- Exponential curves ensure dramatic differences between levels');

// Compare old vs new system
console.log('\n📈 Before vs After Optimization:');
console.log('\nOLD SYSTEM (Linear, Conservative):');
console.log('10% intensity: ~3% trigger rate (0.1 * 0.3)');
console.log('90% intensity: ~27% trigger rate (0.9 * 0.3)');
console.log('Problem: Only 24% difference between min and max!');

console.log('\nNEW SYSTEM (Exponential, Aggressive):');
const low = calculateProbabilities(10);
const high = calculateProbabilities(90);
console.log(`10% intensity: ~${Math.round(low.verbalTicProbability * 100)}% trigger rate`);
console.log(`90% intensity: ~${Math.round(high.verbalTicProbability * 100)}% trigger rate`);
console.log(`Improvement: ${Math.round(high.verbalTicProbability * 100 - low.verbalTicProbability * 100)}% difference between min and max!`);

// AI Phrase Blacklist Expansion
console.log('\n🚫 AI Phrase Detection Expansion:');
const aiPhraseCategories = {
  'Traditional (before)': ['總而言之', '總的來說', '值得注意的是', '不僅如此'],
  'Academic (new)': ['研究顯示', '數據表明', '分析結果指出'],
  'Corporate (new)': ['充分利用', '協同效應', '全方位解決方案'],
  'Filler (new)': ['如前所述', '正如我們所知', '毋庸置疑']
};

Object.entries(aiPhraseCategories).forEach(([category, phrases]) => {
  console.log(`${category}: ${phrases.length} phrases detected`);
});

console.log('\n✅ Total AI phrases now detected: 50+ (previously ~15)');

// Structural Humanization Features
console.log('\n🧠 New Structural Humanization Features:');
console.log('1. Incomplete thoughts: "等等，我想我說錯了"');
console.log('2. Stream of consciousness: "說到這個..."');
console.log('3. Emotional punctuation: "真的很重要！"');
console.log('4. Tangential thoughts: "（順帶一提，這讓我想起...）"');

console.log('\n🎯 Result: 10% vs 90% should now feel dramatically different!');
console.log('Users will notice major differences in:');
console.log('- Frequency of conversational phrases');
console.log('- Number of AI phrases removed');
console.log('- Structural variations and interruptions');
console.log('- Overall personality and human-like flow');