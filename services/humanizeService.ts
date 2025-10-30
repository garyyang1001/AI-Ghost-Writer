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
    '有鑑於此', '基於上述', '據此可知', '由上可見', // 專家新增：中文正式用語
    'In conclusion', 'Furthermore', 'Moreover', 'Additionally',
    'It is worth noting', 'It should be noted', 'It is evident that'
  ],
  qualifiers: [
    '深入探討', '至關重要', '強大的', '先進的', '革命性的',
    '創新的', '顛覆性的', '前所未有的', '極其重要的', '顯著的',
    '全面性的', '整體性的', '策略性的', '系統性的', // 專家新增：常見修飾詞
    'powerful', 'revolutionary', 'cutting-edge', 'state-of-the-art',
    'leveraging', 'synergies', 'paradigm shift', 'holistic approach', // 專家新增：企業用語
    'game-changing', 'next-generation', 'world-class' // 專家新增：科技用語
  ],
  openers: [
    '本文將探討', '在當今世界', '隨著科技發展', '眾所周知',
    '不可否認的是', '在這個時代', '近年來', '研究表明',
    '在現代社會中', '隨著時代進步', '基於現況分析', // 專家新增：常見開頭
    'In today\'s world', 'It is well known that', 'Studies show',
    'the findings suggest', 'further research indicates' // 專家新增：學術用語
  ],
  conclusions: [
    '總結', '最後', '綜觀全文', '由此可見', '結論是',
    '綜合以上所述', '歸納而言', '簡言之', // 專家新增：結尾用語
    'In summary', 'To conclude', 'In closing'
  ],
  // 專家新增：其他AI慣用模式
  academic: [
    'it is evident that', 'the findings suggest', 'further research indicates',
    '研究顯示', '數據表明', '分析結果指出'
  ],
  corporate: [
    'leveraging', 'synergies', 'paradigm shift', 'holistic approach',
    '充分利用', '協同效應', '全方位解決方案'
  ],
  filler: [
    '如前所述', '正如我們所知', '毋庸置疑',
    'as previously mentioned', 'as we all know', 'without a doubt'
  ]
};

// Human phrases to inject for more natural feel - 擴展版本
const HUMAN_PHRASES = {
  conversational: [
    // 原有短語
    '說實話', '我跟你講', '重點來了', '有趣的是', '你知道嗎',
    '老實說', '坦白講', '說真的', '其實啊', '話說回來',
    '對了', '順帶一提', '說到這個', '想想看', '說起來',
    // 新增：參考朋友範例的自然表達
    '你有沒有想過', '我發現一個很有意思的現象', '讓我分享一個真實經驗',
    '從我的觀察來看', '你猜怎麼著', '我最近才理解到',
    '換個角度想', '你算過嗎', '但更深層的問題是', '可是你有想過嗎',
    '這就是問題所在', '讓我拆解給你看', '舉個例子', '但問題來了',
    '我想說的是', '關鍵在於', '這讓我想起', '忽然想到',
    '你應該也發現了', '不瞞你說', '我一直覺得', '坦白說'
  ],
  emphasis: [
    // 原有短語
    '真的', '其實', '確實', '說真的', '沒錯', '對吧',
    '是不是', '你說呢', '想想也是', '就是說',
    // 新增：更強的情感表達
    '超級重要', '完全同意', '絕對是這樣', '太對了',
    '沒錯吧', '就是這個意思', '你懂我意思吧', '真心不騙',
    '我保證', '絕對沒錯', '百分之百', '毫無疑問',
    '這個太重要了', '關鍵重點', '劃重點'
  ],
  transitions: [
    // 原有短語
    '而且啊', '更棒的是', '我還發現', '接著說', '那麼',
    '這樣說吧', '換個角度看', '不過話說', '再說了', '關鍵是',
    // 新增：更自然的轉折
    '接下來更有趣了', '然後事情變得複雜了', '故事還沒結束',
    '重點來了', '這只是開始', '但等等', '先別急', 
    '讓我們回到正題', '說到這裡', '順便提一下', '對了差點忘了'
  ],
  // 新增：問句開頭
  questions: [
    '你知道嗎', '你有沒有發現', '你想過這個問題嗎', '你猜會怎樣',
    '為什麼會這樣呢', '這合理嗎', '你覺得呢', '這是巧合嗎',
    '你注意到了嗎', '難道不是這樣嗎', '你同意嗎'
  ],
  // 新增：情感表達
  emotional: [
    '真的很誇張', '超級驚人', '完全無法想像', '太不可思議了',
    '讓人傻眼', '真的假的', '不會吧', '天啊', '我的天'
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

    // 專家新增：Step 8: 結構性人性化模式
    humanizedContent = this.addStructuralHumanization(humanizedContent, intensity);

    return {
      originalContent: content,
      humanizedContent,
      transformations: this.transformations,
      humanityScore: this.calculateHumanityScore(humanizedContent)
    };
  }

  private removeAIPhrases(content: string, intensity: number): string {
    let modified = content;
    
    // 專家建議：處理所有AI慣用語分類
    const allCategories = [
      { name: 'transitions', phrases: AI_BLACKLIST.transitions },
      { name: 'qualifiers', phrases: AI_BLACKLIST.qualifiers },
      { name: 'openers', phrases: AI_BLACKLIST.openers },
      { name: 'conclusions', phrases: AI_BLACKLIST.conclusions },
      { name: 'academic', phrases: AI_BLACKLIST.academic },
      { name: 'corporate', phrases: AI_BLACKLIST.corporate },
      { name: 'filler', phrases: AI_BLACKLIST.filler }
    ];

    allCategories.forEach(category => {
      category.phrases.forEach(phrase => {
        const regex = new RegExp(`${phrase}[，,。.]?\\s*`, 'gi');
        if (modified.match(regex)) {
          const replacement = this.getReplacementPhrase(category.name, intensity);
          const original = modified.match(regex)?.[0] || phrase;
          modified = modified.replace(regex, replacement ? `${replacement} ` : '');
          
          this.transformations.push({
            type: 'phrase_removal',
            original,
            transformed: replacement || '[removed]',
            reason: `Removed AI ${category.name} phrase "${phrase}"`
          });
        }
      });
    });

    return modified;
  }

  private injectVerbalTics(content: string, intensity: number): string {
    const sentences = content.split(/([。！？!?.]\s*)/);
    const processedSentences: string[] = [];
    
    // 專家建議：指數曲線確保戲劇性差異
    const verbalTicProbability = 0.1 + (intensity * intensity * 0.6); // 10%-64% 指數增長
    
    for (let i = 0; i < sentences.length; i++) {
      let sentence = sentences[i];
      
      // 使用新的指數機率計算
      if (Math.random() < verbalTicProbability && sentence.length > 20) {
        const phrase = this.getRandomPhrase('conversational');
        if (phrase && i > 0) {
          sentence = `${phrase}，${sentence}`;
          this.transformations.push({
            type: 'phrase_injection',
            original: sentences[i],
            transformed: sentence,
            reason: `Added conversational phrase "${phrase}" (probability: ${Math.round(verbalTicProbability * 100)}%)`
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
    
    // 專家建議：指數曲線確保戲劇性差異
    const opinionProbability = 0.15 + (intensity * intensity * 0.55); // 15%-62% 指數增長
    
    for (let i = 0; i < sentences.length; i += 2) {
      processedSentences.push(sentences[i]);
      if (sentences[i + 1]) processedSentences.push(sentences[i + 1]);
      
      // 使用新的指數機率計算添加意見
      if (Math.random() < opinionProbability && this.isFact(sentences[i])) {
        const opinion = this.generateOpinion(sentences[i]);
        if (opinion) {
          processedSentences.push(` ${opinion}`);
          this.transformations.push({
            type: 'opinion_added',
            original: sentences[i],
            transformed: `${sentences[i]} ${opinion}`,
            reason: `Added opinion after fact (probability: ${Math.round(opinionProbability * 100)}%)`
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
      
      // Apply rhythm patterns based on configuration
      switch (this.config.rhythmPattern) {
        case 'uniform':
          // Keep all paragraphs similar length (3-4 sentences)
          if (sentences.length > 8) {
            const midPoint = Math.floor(sentences.length / 2);
            varied.push(sentences.slice(0, midPoint).join(''));
            varied.push(sentences.slice(midPoint).join(''));
          } else {
            varied.push(para);
          }
          break;
          
        case 'varied':
          // Mix of short and long paragraphs for dynamic reading
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
          break;
          
        case 'staccato':
          // Short, punchy paragraphs - split into single sentences
          for (let i = 0; i < sentences.length; i += 2) {
            const sentence = sentences[i] + (sentences[i + 1] || '');
            if (sentence.trim()) {
              varied.push(sentence.trim());
            }
          }
          break;
          
        case 'flowing':
          // Long, flowing paragraphs - combine adjacent paragraphs sometimes
          if (index > 0 && Math.random() < 0.3 && para.length < 200) {
            // Combine with previous paragraph for flowing effect
            const lastIndex = varied.length - 1;
            if (lastIndex >= 0) {
              varied[lastIndex] = varied[lastIndex] + ' ' + para;
            } else {
              varied.push(para);
            }
          } else {
            varied.push(para);
          }
          break;
          
        default:
          varied.push(para);
      }
    });
    
    return varied.filter(p => p.trim()).join('\n\n');
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

    // Check for human phrases (including user-defined ones)
    let humanPhraseCount = 0;
    const allHumanPhrases = [
      ...HUMAN_PHRASES.conversational, 
      ...HUMAN_PHRASES.emphasis,
      ...this.config.verbalTics,
      ...this.config.personalPhrases
    ].filter(phrase => phrase && phrase.trim().length > 0);
    
    allHumanPhrases.forEach(phrase => {
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

    // Check for emotional/opinion markers (including user-defined ones)
    const emotionalMarkers = [
      '我認為', '我覺得', '說實話', '其實', '真的', '！', '...',
      ...this.config.personalPhrases,
      ...this.config.verbalTics.filter(phrase => /真的|覺得|認為|說實話/.test(phrase))
    ].filter(marker => marker && marker.trim().length > 0);
    
    let emotionalCount = 0;
    emotionalMarkers.forEach(marker => {
      emotionalCount += (content.match(new RegExp(marker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
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
    // 專家建議：使用更積極的替換機率
    const replacementProbability = 0.3 + (intensity * 0.6); // 30%-90% 線性增長
    if (Math.random() > replacementProbability) return '';
    
    switch (type) {
      case 'transition':
        return this.getRandomPhrase('transitions');
      case 'emphasis':
        return this.getRandomPhrase('emphasis');
      default:
        return this.getRandomPhrase('conversational');
    }
  }

  private getRandomPhrase(category: keyof typeof HUMAN_PHRASES | 'any'): string {
    let phrases: string[] = [];
    
    // Combine built-in phrases with user-defined ones
    switch (category) {
      case 'conversational':
        phrases = [
          ...HUMAN_PHRASES.conversational,
          ...this.config.verbalTics
        ];
        break;
      case 'emphasis':
        phrases = [
          ...HUMAN_PHRASES.emphasis,
          ...this.config.personalPhrases
        ];
        break;
      case 'transitions':
        phrases = [
          ...HUMAN_PHRASES.transitions,
          // Use verbal tics as transition alternatives
          ...this.config.verbalTics.slice(0, 3)
        ];
        break;
      case 'questions':
        phrases = [
          ...HUMAN_PHRASES.questions,
          // Mix in some conversational questions
          ...this.config.verbalTics.filter(phrase => phrase.includes('嗎') || phrase.includes('呢'))
        ];
        break;
      case 'emotional':
        phrases = [
          ...HUMAN_PHRASES.emotional,
          // Mix in emotional personal phrases
          ...this.config.personalPhrases.filter(phrase => phrase.includes('真的') || phrase.includes('超級'))
        ];
        break;
      case 'any':
        // 隨機從所有分類中選擇
        phrases = [
          ...HUMAN_PHRASES.conversational,
          ...HUMAN_PHRASES.emphasis,
          ...HUMAN_PHRASES.transitions,
          ...HUMAN_PHRASES.questions,
          ...HUMAN_PHRASES.emotional,
          ...this.config.verbalTics,
          ...this.config.personalPhrases
        ];
        break;
      default:
        phrases = HUMAN_PHRASES[category] || [];
    }
    
    // Filter out empty strings and ensure we have phrases to choose from
    phrases = phrases.filter(phrase => phrase && phrase.trim().length > 0);
    
    if (phrases.length === 0) {
      // Fallback to built-in phrases if no valid phrases available
      phrases = HUMAN_PHRASES.conversational || [''];
    }
    
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

  // 專家新增：結構性人性化模式
  private addStructuralHumanization(content: string, intensity: number): string {
    let modified = content;
    const structuralProbability = 0.2 + (intensity * intensity * 0.4); // 20%-42% 指數增長

    // 1. 未完成思考和自我糾正
    modified = this.addIncompleteThoughts(modified, structuralProbability);
    
    // 2. 意識流式分割
    modified = this.addStreamOfConsciousness(modified, structuralProbability);
    
    // 3. 情感標點
    modified = this.addEmotionalPunctuation(modified, structuralProbability);
    
    // 4. 切題偏離
    modified = this.addTangentialThoughts(modified, structuralProbability);

    return modified;
  }

  private addIncompleteThoughts(content: string, probability: number): string {
    const incompletePatterns = [
      '等等，我想我說錯了',
      '其實不對，應該是說',
      '我剛才想了想',
      '糾正一下我剛才的說法',
      '這樣對嗎？',
      '嗯...讓我想想',
      '話說回來'
    ];

    const sentences = content.split(/([。！？!?.]\s*)/);
    const processedSentences: string[] = [];

    for (let i = 0; i < sentences.length; i++) {
      processedSentences.push(sentences[i]);
      
      if (Math.random() < probability && sentences[i].length > 30 && i < sentences.length - 2) {
        const pattern = incompletePatterns[Math.floor(Math.random() * incompletePatterns.length)];
        processedSentences.push(`${pattern}。`);
        
        this.transformations.push({
          type: 'structure_change',
          original: sentences[i],
          transformed: `${sentences[i]} ${pattern}。`,
          reason: `Added incomplete thought "${pattern}" for human-like self-correction`
        });
      }
    }

    return processedSentences.join('');
  }

  private addStreamOfConsciousness(content: string, probability: number): string {
    const streamMarkers = [
      '說到這個...',
      '對了',
      '順帶一提',
      '忽然想到',
      '這讓我想起',
      '話說'
    ];

    const paragraphs = content.split('\n\n');
    const processedParagraphs: string[] = [];

    paragraphs.forEach((para, index) => {
      if (Math.random() < probability && para.length > 100 && index > 0) {
        const marker = streamMarkers[Math.floor(Math.random() * streamMarkers.length)];
        // 在段落中間插入意識流標記
        const sentences = para.split('。');
        if (sentences.length > 2) {
          const insertPoint = Math.floor(sentences.length / 2);
          sentences[insertPoint] = `${sentences[insertPoint]}。${marker}，`;
          para = sentences.join('。');
          
          this.transformations.push({
            type: 'structure_change',
            original: 'Linear paragraph flow',
            transformed: `Stream of consciousness with "${marker}"`,
            reason: 'Added stream-of-consciousness marker for natural flow'
          });
        }
      }
      processedParagraphs.push(para);
    });

    return processedParagraphs.join('\n\n');
  }

  private addEmotionalPunctuation(content: string, probability: number): string {
    let modified = content;

    // 將一些句號替換為省略號
    if (Math.random() < probability) {
      modified = modified.replace(/([^。！？]{30,})。/g, (match) => {
        if (Math.random() < 0.3) {
          return match.replace(/。$/, '...');
        }
        return match;
      });
    }

    // 添加感嘆號表達強烈情感
    if (Math.random() < probability) {
      const emotionalWords = ['真的', '確實', '太', '非常', '超級'];
      emotionalWords.forEach(word => {
        const regex = new RegExp(`(${word}[^。]{1,20})。`, 'g');
        modified = modified.replace(regex, (match, group) => {
          if (Math.random() < 0.4) {
            this.transformations.push({
              type: 'emphasis_added',
              original: match,
              transformed: match.replace(/。$/, '！'),
              reason: `Added emotional punctuation for emphasis`
            });
            return match.replace(/。$/, '！');
          }
          return match;
        });
      });
    }

    return modified;
  }

  private addTangentialThoughts(content: string, probability: number): string {
    const tangentialMarkers = [
      '（順帶一提，這讓我想起...）',
      '（說到這個，我突然想到...）',
      '（離題一下，但這很重要）',
      '（這讓我想到另一件事）',
      '（等等，這個很有趣）'
    ];

    const sentences = content.split(/([。！？!?.]\s*)/);
    const processedSentences: string[] = [];

    for (let i = 0; i < sentences.length; i++) {
      processedSentences.push(sentences[i]);
      
      if (Math.random() < probability && sentences[i].length > 40 && i < sentences.length - 3) {
        const tangent = tangentialMarkers[Math.floor(Math.random() * tangentialMarkers.length)];
        processedSentences.push(` ${tangent}`);
        
        this.transformations.push({
          type: 'structure_change',
          original: sentences[i],
          transformed: `${sentences[i]} ${tangent}`,
          reason: `Added tangential thought for natural digression`
        });
      }
    }

    return processedSentences.join('');
  }

  // 新增：AI味檢測和自動調整機制
  public detectAIFlavor(content: string): { score: number; issues: string[]; suggestions: string[] } {
    const issues: string[] = [];
    const suggestions: string[] = [];
    let aiScore = 0; // 越高越有AI味

    // 檢測AI常用短語
    const aiPhraseMatches = this.detectAIPhrases(content);
    if (aiPhraseMatches.length > 0) {
      aiScore += aiPhraseMatches.length * 10;
      issues.push(`發現 ${aiPhraseMatches.length} 個AI制式用語：${aiPhraseMatches.slice(0, 3).join('、')}${aiPhraseMatches.length > 3 ? '等' : ''}`);
      suggestions.push('開啟「移除AI慣用語」功能並提高人性化強度');
    }

    // 檢測過於正式的語調
    const formalPhrases = ['基於', '鑑於', '據此', '茲', '為此', '因而', '綜觀', '據悉'];
    const formalMatches = formalPhrases.filter(phrase => content.includes(phrase));
    if (formalMatches.length > 0) {
      aiScore += formalMatches.length * 8;
      issues.push(`語調過於正式，發現：${formalMatches.join('、')}`);
      suggestions.push('選擇「對話」或「故事」邏輯風格，使用更多口語化表達');
    }

    // 檢測缺乏情感表達
    const emotionalMarkers = ['！', '？', '...', '真的', '說實話', '你知道嗎'];
    const emotionalCount = emotionalMarkers.reduce((count, marker) => 
      count + (content.match(new RegExp(marker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length, 0
    );
    
    const sentences = content.split(/[。！？]/).length;
    const emotionalRatio = emotionalCount / sentences;
    
    if (emotionalRatio < 0.1) {
      aiScore += 15;
      issues.push('缺乏情感表達和個人化語調');
      suggestions.push('開啟「加入個人觀點」和「對話式語氣」功能');
    }

    // 檢測段落單調性
    const paragraphs = content.split('\n\n').filter(p => p.trim());
    const paragraphLengths = paragraphs.map(p => p.length);
    const lengthVariance = this.calculateVariance(paragraphLengths);
    const avgLength = paragraphLengths.reduce((a, b) => a + b, 0) / paragraphLengths.length;
    const coefficientOfVariation = Math.sqrt(lengthVariance) / avgLength;
    
    if (coefficientOfVariation < 0.3) {
      aiScore += 10;
      issues.push('段落長度過於一致，缺乏自然變化');
      suggestions.push('開啟「段落長短變化」功能，選擇「變化」節奏模式');
    }

    // 檢測結構化程度（過於完美的結構也是AI特徵）
    const structureWords = ['首先', '其次', '最後', '第一', '第二', '第三'];
    const structureCount = structureWords.reduce((count, word) => 
      count + (content.match(new RegExp(word, 'g')) || []).length, 0
    );
    
    if (structureCount > 2) {
      aiScore += structureCount * 5;
      issues.push('結構過於規整，像學術報告');
      suggestions.push('選擇「螺旋」邏輯風格，增加隨意性和自然流動');
    }

    // 生成總評分和建議
    const finalScore = Math.min(100, aiScore);
    
    if (finalScore > 60) {
      suggestions.push('🚨 強烈建議將人性化強度調至80%以上');
    } else if (finalScore > 30) {
      suggestions.push('💡 建議將人性化強度調至60-80%');
    }

    return {
      score: finalScore,
      issues,
      suggestions
    };
  }

  private detectAIPhrases(content: string): string[] {
    const detected: string[] = [];
    
    // 檢測所有AI黑名單短語
    const allAIPhrases = [
      ...AI_BLACKLIST.transitions,
      ...AI_BLACKLIST.qualifiers,
      ...AI_BLACKLIST.openers,
      ...AI_BLACKLIST.conclusions,
      ...AI_BLACKLIST.academic,
      ...AI_BLACKLIST.corporate,
      ...AI_BLACKLIST.filler
    ];

    allAIPhrases.forEach(phrase => {
      if (content.includes(phrase)) {
        detected.push(phrase);
      }
    });

    return detected;
  }

  private calculateVariance(numbers: number[]): number {
    const mean = numbers.reduce((a, b) => a + b, 0) / numbers.length;
    return numbers.reduce((sum, num) => sum + Math.pow(num - mean, 2), 0) / numbers.length;
  }

  // 自動調整建議生成器
  public generateOptimizationSuggestions(content: string, currentConfig: HumanizationConfig): HumanizationConfig {
    const detection = this.detectAIFlavor(content);
    const optimizedConfig = { ...currentConfig };

    // 根據檢測結果自動調整配置
    if (detection.score > 50) {
      // AI味太重，需要激進調整
      optimizedConfig.intensity = Math.min(95, currentConfig.intensity + 20);
      optimizedConfig.logicStyle = 'conversational';
      optimizedConfig.rhythmPattern = 'varied';
      optimizedConfig.emphasisStrategy = 'emotional';
      optimizedConfig.removeAIPhrases = true;
      optimizedConfig.addOpinions = true;
      optimizedConfig.useConversationalTone = true;
    } else if (detection.score > 25) {
      // 中等調整
      optimizedConfig.intensity = Math.min(80, currentConfig.intensity + 10);
      optimizedConfig.addOpinions = true;
      optimizedConfig.useConversationalTone = true;
    }

    return optimizedConfig;
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