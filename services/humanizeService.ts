import {
  HumanizationConfig,
  HumanizationResult,
  TransformationLog,
  HumanityScore,
  LogicStyle,
  RhythmPattern,
  EmphasisStrategy
} from '../types';

// AI phrases to remove - these make content sound robotic
const AI_BLACKLIST = {
  transitions: [
    '總而言之', '總的來說', '值得注意的是', '不僅如此', '此外',
    '綜上所述', '另一方面', '首先', '其次', '最後', '總結來說',
    '換句話說', '更重要的是', '與此同時', '因此', '所以說',
    'In conclusion', 'Furthermore', 'Moreover', 'Additionally',
    'It is worth noting', 'It should be noted'
  ],
  qualifiers: [
    '深入探討', '至關重要', '強大的', '先進的', '革命性的',
    '創新的', '顛覆性的', '前所未有的', '極其重要的', '顯著的',
    'powerful', 'revolutionary', 'cutting-edge', 'state-of-the-art'
  ],
  openers: [
    '本文將探討', '在當今世界', '隨著科技發展', '眾所周知',
    '不可否認的是', '在這個時代', '近年來', '研究表明',
    'In today\'s world', 'It is well known that', 'Studies show'
  ],
  conclusions: [
    '總結', '最後', '綜觀全文', '由此可見', '結論是',
    'In summary', 'To conclude', 'In closing'
  ]
};

// Human phrases to inject for more natural feel
const HUMAN_PHRASES = {
  conversational: [
    '說實話', '我跟你講', '重點來了', '有趣的是', '你知道嗎',
    '老實說', '坦白講', '說真的', '其實啊', '話說回來',
    '對了', '順帶一提', '說到這個', '想想看', '說起來'
  ],
  emphasis: [
    '真的', '其實', '確實', '說真的', '沒錯', '對吧',
    '是不是', '你說呢', '想想也是', '就是說'
  ],
  transitions: [
    '而且啊', '更棒的是', '我還發現', '接著說', '那麼',
    '這樣說吧', '換個角度看', '不過話說', '再說了', '關鍵是'
  ]
};

export class HumanizeService {
  private config: HumanizationConfig;
  private transformations: TransformationLog[] = [];

  constructor(config: HumanizationConfig) {
    this.config = config;
  }

  public async humanize(content: string): Promise<HumanizationResult> {
    this.transformations = [];
    let humanizedContent = content;

    if (!this.config.enabled) {
      return {
        originalContent: content,
        humanizedContent: content,
        transformations: [],
        humanityScore: this.calculateHumanityScore(content)
      };
    }

    // Apply transformations based on intensity
    const intensity = this.config.intensity / 100;

    // Step 1: Remove AI phrases
    if (this.config.removeAIPhrases) {
      humanizedContent = this.removeAIPhrases(humanizedContent, intensity);
    }

    // Step 2: Inject human verbal tics
    humanizedContent = this.injectVerbalTics(humanizedContent, intensity);

    // Step 3: Transform logic structure
    humanizedContent = this.transformLogicStructure(humanizedContent);

    // Step 4: Add opinions and emotional content
    if (this.config.addOpinions) {
      humanizedContent = this.injectOpinions(humanizedContent, intensity);
    }

    // Step 5: Vary paragraph rhythm
    if (this.config.varyParagraphLength) {
      humanizedContent = this.varyParagraphRhythm(humanizedContent);
    }

    // Step 6: Apply strategic emphasis
    humanizedContent = this.applyStrategicEmphasis(humanizedContent);

    // Step 7: Add personality touches
    humanizedContent = this.addPersonalityTouches(humanizedContent, intensity);

    return {
      originalContent: content,
      humanizedContent,
      transformations: this.transformations,
      humanityScore: this.calculateHumanityScore(humanizedContent)
    };
  }

  private removeAIPhrases(content: string, intensity: number): string {
    let modified = content;
    
    // Remove AI transitions
    AI_BLACKLIST.transitions.forEach(phrase => {
      const regex = new RegExp(`${phrase}[，,。.]?\\s*`, 'gi');
      if (modified.match(regex)) {
        const replacement = this.getReplacementPhrase('transition', intensity);
        const original = modified.match(regex)?.[0] || phrase;
        modified = modified.replace(regex, replacement ? `${replacement} ` : '');
        
        this.transformations.push({
          type: 'phrase_removal',
          original,
          transformed: replacement || '[removed]',
          reason: `Removed AI cliché phrase "${phrase}"`
        });
      }
    });

    // Remove AI qualifiers
    AI_BLACKLIST.qualifiers.forEach(phrase => {
      const regex = new RegExp(phrase, 'gi');
      if (modified.match(regex)) {
        modified = modified.replace(regex, '');
        this.transformations.push({
          type: 'phrase_removal',
          original: phrase,
          transformed: '[removed]',
          reason: `Removed overused AI qualifier "${phrase}"`
        });
      }
    });

    return modified;
  }

  private injectVerbalTics(content: string, intensity: number): string {
    const sentences = content.split(/([。！？!?.]\s*)/);
    const processedSentences: string[] = [];
    
    for (let i = 0; i < sentences.length; i++) {
      let sentence = sentences[i];
      
      // Randomly inject conversational phrases based on intensity
      if (Math.random() < intensity * 0.3 && sentence.length > 20) {
        const phrase = this.getRandomPhrase('conversational');
        if (phrase && i > 0) {
          sentence = `${phrase}，${sentence}`;
          this.transformations.push({
            type: 'phrase_injection',
            original: sentences[i],
            transformed: sentence,
            reason: `Added conversational phrase "${phrase}" for natural flow`
          });
        }
      }
      
      processedSentences.push(sentence);
    }
    
    return processedSentences.join('');
  }

  private transformLogicStructure(content: string): string {
    if (this.config.logicStyle === 'linear') {
      return content;
    }

    const paragraphs = content.split('\n\n');
    let transformed = [...paragraphs];

    switch (this.config.logicStyle) {
      case 'spiral':
        // Start with the second most important point, circle back
        if (paragraphs.length > 3) {
          transformed = [
            paragraphs[1],
            paragraphs[0],
            ...paragraphs.slice(2)
          ];
          this.transformations.push({
            type: 'structure_change',
            original: 'Linear paragraph order',
            transformed: 'Spiral structure',
            reason: 'Rearranged paragraphs for spiral narrative flow'
          });
        }
        break;

      case 'conversational':
        // Add conversational asides
        transformed = paragraphs.map(para => {
          if (Math.random() < 0.3 && para.length > 100) {
            const aside = this.generateConversationalAside(para);
            return `${para}\n\n（${aside}）`;
          }
          return para;
        });
        break;

      case 'storytelling':
        // Add narrative hooks between sections
        const newParagraphs: string[] = [];
        paragraphs.forEach((para, index) => {
          newParagraphs.push(para);
          if (index < paragraphs.length - 1 && Math.random() < 0.4) {
            const hook = this.generateNarrativeHook();
            newParagraphs.push(hook);
          }
        });
        transformed = newParagraphs;
        break;
    }

    return transformed.join('\n\n');
  }

  private injectOpinions(content: string, intensity: number): string {
    const sentences = content.split(/([。！？!?.]\s*)/);
    const processedSentences: string[] = [];
    
    for (let i = 0; i < sentences.length; i += 2) {
      processedSentences.push(sentences[i]);
      if (sentences[i + 1]) processedSentences.push(sentences[i + 1]);
      
      // Add opinion after factual statements
      if (Math.random() < intensity * 0.4 && this.isFact(sentences[i])) {
        const opinion = this.generateOpinion(sentences[i]);
        if (opinion) {
          processedSentences.push(` ${opinion}`);
          this.transformations.push({
            type: 'opinion_added',
            original: sentences[i],
            transformed: `${sentences[i]} ${opinion}`,
            reason: 'Added subjective opinion after factual statement'
          });
        }
      }
    }
    
    return processedSentences.join('');
  }

  private varyParagraphRhythm(content: string): string {
    const paragraphs = content.split('\n\n');
    const varied: string[] = [];
    
    paragraphs.forEach((para, index) => {
      const sentences = para.split(/([。！？!?.]\s*)/);
      
      // Create rhythm variation
      if (this.config.rhythmPattern === 'varied') {
        // Sometimes use very short paragraphs for emphasis
        if (Math.random() < 0.2 && sentences.length > 2) {
          // Split into shorter paragraph
          const midPoint = Math.floor(sentences.length / 2);
          varied.push(sentences.slice(0, midPoint).join(''));
          varied.push(sentences.slice(midPoint).join(''));
        } else if (Math.random() < 0.1 && para.length > 50) {
          // Create single-sentence paragraph for impact
          varied.push(sentences[0] + (sentences[1] || ''));
          if (sentences.length > 2) {
            varied.push(sentences.slice(2).join(''));
          }
        } else {
          varied.push(para);
        }
      } else {
        varied.push(para);
      }
    });
    
    return varied.join('\n\n');
  }

  private applyStrategicEmphasis(content: string): string {
    if (this.config.emphasisStrategy === 'minimal') {
      return content;
    }

    let emphasized = content;

    // Bold key verbs and concrete nouns
    const keyWords = this.extractKeyWords(content);
    keyWords.forEach(word => {
      // Only bold some instances, not all
      const regex = new RegExp(`\\b${word}\\b`, 'g');
      let count = 0;
      emphasized = emphasized.replace(regex, (match) => {
        count++;
        // Bold every 3rd instance or based on strategy
        if (this.shouldEmphasize(count, this.config.emphasisStrategy)) {
          this.transformations.push({
            type: 'emphasis_added',
            original: match,
            transformed: `**${match}**`,
            reason: `Strategic emphasis on key word "${match}"`
          });
          return `**${match}**`;
        }
        return match;
      });
    });

    return emphasized;
  }

  private addPersonalityTouches(content: string, intensity: number): string {
    let personalized = content;

    // Add parenthetical asides
    if (Math.random() < intensity) {
      const paragraphs = personalized.split('\n\n');
      paragraphs.forEach((para, index) => {
        if (Math.random() < 0.2 && para.length > 100) {
          const aside = this.generatePersonalityAside(para);
          paragraphs[index] = para.replace(/。/, `。（${aside}）`);
        }
      });
      personalized = paragraphs.join('\n\n');
    }

    // Add occasional ellipsis for unfinished thoughts
    if (Math.random() < intensity * 0.5) {
      personalized = personalized.replace(
        /([^。！？!?.]{50,}[。])/g,
        (match) => {
          if (Math.random() < 0.1) {
            return match.replace(/。$/, '...');
          }
          return match;
        }
      );
    }

    return personalized;
  }

  private calculateHumanityScore(content: string): HumanityScore {
    const score: HumanityScore = {
      overall: 0,
      breakdown: {
        logicVariance: 0,
        vocabularyNaturalness: 0,
        rhythmVariation: 0,
        emotionalContent: 0,
        personalityStrength: 0
      },
      suggestions: []
    };

    // Check for AI phrases
    let aiPhraseCount = 0;
    [...AI_BLACKLIST.transitions, ...AI_BLACKLIST.qualifiers, ...AI_BLACKLIST.openers].forEach(phrase => {
      if (content.includes(phrase)) {
        aiPhraseCount++;
      }
    });
    score.breakdown.vocabularyNaturalness = Math.max(0, 100 - (aiPhraseCount * 10));

    // Check for human phrases
    let humanPhraseCount = 0;
    [...HUMAN_PHRASES.conversational, ...HUMAN_PHRASES.emphasis].forEach(phrase => {
      if (content.includes(phrase)) {
        humanPhraseCount++;
      }
    });
    score.breakdown.personalityStrength = Math.min(100, humanPhraseCount * 15);

    // Check paragraph variation
    const paragraphs = content.split('\n\n');
    const paragraphLengths = paragraphs.map(p => p.length);
    const avgLength = paragraphLengths.reduce((a, b) => a + b, 0) / paragraphLengths.length;
    const variance = paragraphLengths.reduce((sum, len) => sum + Math.pow(len - avgLength, 2), 0) / paragraphLengths.length;
    score.breakdown.rhythmVariation = Math.min(100, Math.sqrt(variance) / avgLength * 100);

    // Check for emotional/opinion markers
    const emotionalMarkers = ['我認為', '我覺得', '說實話', '其實', '真的', '！', '...'];
    let emotionalCount = 0;
    emotionalMarkers.forEach(marker => {
      emotionalCount += (content.match(new RegExp(marker, 'g')) || []).length;
    });
    score.breakdown.emotionalContent = Math.min(100, emotionalCount * 5);

    // Logic variance (check for non-linear structures)
    score.breakdown.logicVariance = this.assessLogicVariance(content);

    // Calculate overall score
    score.overall = Object.values(score.breakdown).reduce((a, b) => a + b, 0) / 5;

    // Generate suggestions
    if (score.breakdown.vocabularyNaturalness < 70) {
      score.suggestions.push('Remove more AI cliché phrases');
    }
    if (score.breakdown.personalityStrength < 50) {
      score.suggestions.push('Add more conversational phrases and personal touches');
    }
    if (score.breakdown.rhythmVariation < 60) {
      score.suggestions.push('Vary paragraph lengths more dramatically');
    }
    if (score.breakdown.emotionalContent < 40) {
      score.suggestions.push('Include more opinions and emotional reactions');
    }

    return score;
  }

  // Helper methods
  private getReplacementPhrase(type: string, intensity: number): string {
    if (Math.random() > intensity) return '';
    
    switch (type) {
      case 'transition':
        return this.getRandomPhrase('transitions');
      case 'emphasis':
        return this.getRandomPhrase('emphasis');
      default:
        return this.getRandomPhrase('conversational');
    }
  }

  private getRandomPhrase(category: keyof typeof HUMAN_PHRASES): string {
    const phrases = HUMAN_PHRASES[category];
    return phrases[Math.floor(Math.random() * phrases.length)];
  }

  private isFact(sentence: string): boolean {
    // Simple heuristic: contains numbers, percentages, or factual indicators
    return /\d+|百分|研究|數據|統計|報告|顯示/.test(sentence);
  }

  private generateOpinion(factSentence: string): string {
    const opinions = [
      '這真的很值得思考',
      '說真的，這點蠻重要的',
      '我覺得這是關鍵',
      '這讓人印象深刻',
      '有意思的是這個現象',
      '這確實說明了問題'
    ];
    return opinions[Math.floor(Math.random() * opinions.length)];
  }

  private generateConversationalAside(context: string): string {
    const asides = [
      '說真的，我當初也是這麼想的',
      '這讓我想起了一件事',
      '順帶一提，這很有意思',
      '對了，你可能也發現了',
      '其實仔細想想也是'
    ];
    return asides[Math.floor(Math.random() * asides.length)];
  }

  private generateNarrativeHook(): string {
    const hooks = [
      '但故事還沒結束。',
      '接下來的發展更有意思。',
      '然後事情開始變得複雜了。',
      '這只是開始。',
      '重點來了。'
    ];
    return hooks[Math.floor(Math.random() * hooks.length)];
  }

  private generatePersonalityAside(context: string): string {
    const asides = [
      '沒錯，就是這樣',
      '你懂我意思吧',
      '這很重要',
      '記住這點',
      '想想看'
    ];
    return asides[Math.floor(Math.random() * asides.length)];
  }

  private extractKeyWords(content: string): string[] {
    // Extract important nouns and verbs
    // This is a simplified version - in production, use NLP library
    const words = content.match(/[\u4e00-\u9fa5]+|[a-zA-Z]+/g) || [];
    const filtered = words.filter(word => 
      word.length > 2 && 
      !AI_BLACKLIST.transitions.includes(word) &&
      !AI_BLACKLIST.qualifiers.includes(word)
    );
    
    // Return top 10 most frequent words
    const frequency: { [key: string]: number } = {};
    filtered.forEach(word => {
      frequency[word] = (frequency[word] || 0) + 1;
    });
    
    return Object.entries(frequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word]) => word);
  }

  private shouldEmphasize(count: number, strategy: EmphasisStrategy): boolean {
    switch (strategy) {
      case 'minimal':
        return false;
      case 'strategic':
        return count % 3 === 0;
      case 'emotional':
        return count === 1 || count % 2 === 0;
      default:
        return false;
    }
  }

  private assessLogicVariance(content: string): number {
    // Check for non-linear indicators
    let score = 50; // baseline
    
    if (content.includes('但') || content.includes('然而')) score += 10;
    if (content.includes('...')) score += 10;
    if (content.includes('（') && content.includes('）')) score += 10;
    if (/^[^。]{1,20}。$/m.test(content)) score += 10; // short sentences
    if (content.includes('？')) score += 10;
    
    return Math.min(100, score);
  }
}

// Default configuration
export const defaultHumanizationConfig: HumanizationConfig = {
  enabled: true,
  intensity: 70,
  logicStyle: 'spiral',
  verbalTics: [...HUMAN_PHRASES.conversational],
  personalPhrases: [...HUMAN_PHRASES.emphasis],
  rhythmPattern: 'varied',
  emphasisStrategy: 'strategic',
  removeAIPhrases: true,
  addOpinions: true,
  varyParagraphLength: true,
  useConversationalTone: true
};