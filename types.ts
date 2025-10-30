export interface User {
  name: string;
}

export interface ContentBlueprintData {
  pillarContent: string;
  clusterTopics: string[];
}

export interface Interview {
  question: string;
  answer: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export type ArticleType = '部落格文章' | '電子郵件' | '社群媒體貼文' | '新聞稿' | '產品說明';
export const articleTypes: ArticleType[] = ['部落格文章', '電子郵件', '社群媒體貼文', '新聞稿', '產品說明'];

export type RepurposeType = '社群貼文' | 'X (推特) 推文串' | '電子報摘要' | '影片腳本大綱';
export const repurposeTypes: RepurposeType[] = ['社群貼文', 'X (推特) 推文串', '電子報摘要', '影片腳本大綱'];

export interface StyleProfile {
  styleTemplate: string;
  customInstructions: string[];
}

export interface RecommendedStyle {
  name: string;
  description: string;
  sample: string;
}

export interface ArticleGenerationResult {
  article: string;
  finalPrompt: string;
}

export interface PredefinedStyle {
  name: string;
  template: string;
  category: string;
}

export const predefinedStyles: PredefinedStyle[] = [
  // Category: 文學與作家風格
  { 
    name: '村上春樹風格', 
    template: '請模仿村上春樹的風格撰寫這篇文章。使用第一人稱敘事，語氣帶有淡淡的疏離感和憂鬱。在平凡的日常描述中，加入對音樂（特別是爵士樂或古典樂）、食物（如義大利麵）或貓的細膩描寫，並巧妙地融入超現實主義或魔幻寫實的元素。',
    category: '文學與作家風格'
  },
  { 
    name: '海明威風格', 
    template: '請使用海明威的寫作風格。句子要簡短、精煉、有力。避免使用不必要的形容詞和副詞。使用「冰山理論」，只描述表面的事實和動作，讓讀者自己感受潛藏的情感和意義。多用具體的名詞和強烈的動詞。',
    category: '文學與作家風格'
  },
  { 
    name: 'J.K. 羅琳風格', 
    template: '請用 J.K. 羅琳的風格來描述這個場景。重點在於豐富的想像力和細緻的世界觀設定。用語帶有奇幻色彩，善於使用巧妙的譬喻和幽默感，並且在敘事中埋下伏筆，營造神秘的氛圍。',
    category: '文學與作家風格'
  },
  { 
    name: '金庸風格', 
    template: '請以金庸的武俠小說風格來撰寫。用詞要古雅且充滿畫面感，多使用成語和江湖術語。在描述動作時，要精確到招式和身法，並在對話中展現人物的性格、道義和恩怨情仇。',
    category: '文學與作家風格'
  },
  { 
    name: '喬治·歐威爾風格', 
    template: '請模仿喬治·歐威爾的風格。文體要清晰、簡潔、直接。用詞精確，毫不含糊。以批判性、具洞察力的視角來分析主題，揭示其背後的政治意涵或權力結構，帶有強烈的警世意味。',
    category: '文學與作家風格'
  },
  // Category: 知名刊物與媒體風格
  { 
    name: '《經濟學人》風格', 
    template: '請模仿《經濟學人》的風格撰寫這篇分析。語氣要權威、客觀、帶點冷幽默（witty）。句子結構要嚴謹，用詞精準且正式。深入分析事件的全球背景、經濟影響和政治考量，並提出清晰的觀點。',
    category: '知名刊物與媒體風格'
  },
  { 
    name: '《紐約客》風格', 
    template: '請以《紐約客》的敘事報導風格來寫。採用長篇、深入的敘事方式，結合深入的採訪、細緻的場景描寫和豐富的背景資料。文筆要優美、精緻且具文學性，允許作者的聲音和觀點流露其中。',
    category: '知名刊物與媒體風格'
  },
  { 
    name: '《Wired》雜誌風格', 
    template: '請使用《Wired》雜誌的風格。語氣要前衛、樂觀，並帶有科技圈的行話 (jargon)。專注於新興科技、創新趨勢及其對文化和社會的顛覆性影響。標題和開頭要引人入勝，充滿未來感。',
    category: '知名刊物與媒體風格'
  },
  { 
    name: '《Vogue》風格', 
    template: '請用《Vogue》的時尚評論風格。文字要華麗、充滿自信且具權威性。大量使用感性的形容詞來描繪色彩、材質和氛圍。將時尚視為一種藝術和文化宣言，連結到當下的社會潮流和名人動態。',
    category: '知名刊物與媒體風格'
  },
  { 
    name: '《國家地理》風格', 
    template: '請以《國家地理》雜誌的風格撰寫。文字要充滿畫面感、引人入勝。重點是描繪自然奇觀、人文探索或科學發現。結合教育性與娛樂性，喚起讀者對世界的好奇心和敬畏之心。',
    category: '知名刊物與媒體風格'
  },
  { 
    name: '《哈佛商業評論》風格', 
    template: '請模仿《哈佛商業評論》的風格。文章結構要清晰，論點明確。以一個核心的管理學概念或商業策略為主軸，引用學術研究、案例分析和專家見解來支持論點。文風專業、具指導性，旨在為管理者提供可行的解決方案。',
    category: '知名刊物與媒體風格'
  },
  // Category: 商界領袖與思想家風格
  { 
    name: '史蒂夫·賈伯斯風格', 
    template: '請模仿史蒂夫·賈伯斯在產品發布會上的演講風格。語氣要充滿激情、遠見和戲劇性。使用簡潔、有力的短句。善用「三段式」法則來介紹亮點。將產品描述為「革命性」、「不可思議」的，並專注於它如何改變人們的生活，而不僅僅是技術規格。',
    category: '商界領袖與思想家風格'
  },
  { 
    name: '華倫·巴菲特風格', 
    template: '請以華倫·巴菲特（致股東的信）的風格撰寫。語氣要誠懇、謙遜，帶有老派的智慧和幽默感。使用簡單易懂的語言和貼近生活的比喻來解釋複雜的金融概念。強調長期價值、護城河和誠信的重要性。',
    category: '商界領袖與思想家風格'
  },
  { 
    name: '伊隆·馬斯克風格', 
    template: '請模仿伊隆·馬斯克的溝通風格。語氣要大膽、直率，有時甚至有些唐突。專注於宏大的、具未來性的目標（如火星移民、永續能源）。用詞直接，充滿技術細節，展現出強烈的使命感和解決問題的迫切性。',
    category: '商界領袖與思想家風格'
  },
  { 
    name: '麥爾坎·葛拉威爾風格', 
    template: '請使用麥爾坎·葛拉威爾的風格。從一個引人入勝的小故事或反常的現象開始。將看似無關的學術研究（特別是社會心理學）和軼事編織在一起，提出一個違反直覺的核心論點。敘事流暢，讓複雜的觀點變得易於理解。',
    category: '商界領袖與思想家風格'
  },
  // Category: 特定文體與領域風格
  { 
    name: 'TED 演講風格', 
    template: '請以 TED 演講稿的風格撰寫。開頭要用一個強而有力的個人故事或一個驚人的提問來抓住聽眾。結構清晰，圍繞一個「值得傳播的點子」 (Idea Worth Spreading) 展開。語氣要熱情、真誠且鼓舞人心，並在結尾給出一個明確的行動呼籲。',
    category: '特定文體與領域風格'
  },
  { 
    name: '大衛·奧格威廣告文案風格', 
    template: '請模仿大衛·奧格威的廣告文案風格。標題要能引發好奇心並承諾利益。內文要像「長文案」(Long-form copy)，充滿事實、數據和具體的細節。專注於顧客能獲得的好處，而不是產品的特性。文風優雅、具知識性且極具說服力。',
    category: '特定文體與領域風格'
  },
  { 
    name: '學術期刊風格', 
    template: '請使用嚴謹的學術期刊風格。語氣要極度客觀、中立且精確。使用該領域的專業術語。句子結構複雜，多使用被動語態。文章結構必須包含：摘要 (Abstract)、前言 (Introduction)、方法 (Methods)、結果 (Results) 和結論 (Conclusion)。',
    category: '特定文體與領域風格'
  },
  { 
    name: '政治演說風格', 
    template: '請撰寫一篇激勵人心的政治演說。大量使用排比 (Anaphora)、對比 (Antithesis) 和三段式修辭。語氣要堅定、充滿希望。不斷強調團結、未來、價值觀（如自由、平等）等主題，並使用「我的同胞們...」這類包容性的稱呼。',
    category: '特定文體與領域風格'
  },
  { 
    name: 'BuzzFeed 標題風格', 
    template: '請用 BuzzFeed 風格撰寫標題和開頭。使用清單體 (Listicles)，例如「...的 10 個理由」。標題要誇張、引人好奇、充滿情緒性用詞（如「震驚」、「你絕對想不到」），並使用第二人稱（你）來增加代入感。',
    category: '特定文體與領域風格'
  }
];
