# 部署指南 (Deployment Guide)

本專案支援本地開發和雲端部署，已針對 Vercel、Zeabur 等平台優化。

## 🏠 本地開發設定

### 1. 環境變數設定
```bash
# 複製環境變數範本
cp .env.example .env

# 編輯 .env 檔案，填入您的 API Key
GEMINI_API_KEY=your_actual_api_key_here
```

### 2. 啟動開發伺服器
```bash
npm install
npm run dev
```

## ☁️ 雲端部署

### Vercel 部署

1. **連接 GitHub Repository**
   - 登入 [Vercel](https://vercel.com)
   - 選擇 "New Project" 並連接此 GitHub repo

2. **設定環境變數**
   - 在 Vercel 項目設定中，前往 "Environment Variables"
   - 新增環境變數：
     ```
     Name: GEMINI_API_KEY
     Value: your_actual_api_key_here
     Environment: Production, Preview, Development
     ```

3. **部署設定**
   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

### Zeabur 部署

1. **連接 GitHub Repository**
   - 登入 [Zeabur](https://zeabur.com)
   - 建立新專案並連接此 GitHub repo

2. **設定環境變數**
   - 在服務設定中，前往 "Environment Variables"
   - 新增：
     ```
     GEMINI_API_KEY=your_actual_api_key_here
     ```

3. **部署設定**
   - Zeabur 會自動檢測為 Vite 專案
   - 確認構建命令為 `npm run build`

### Netlify 部署

1. **連接 GitHub Repository**
   - 登入 [Netlify](https://netlify.com)
   - 選擇 "New site from Git" 並連接此 repo

2. **設定環境變數**
   - 在 Site settings > Environment variables 中新增：
     ```
     GEMINI_API_KEY=your_actual_api_key_here
     ```

3. **部署設定**
   - Build command: `npm run build`
   - Publish directory: `dist`

## 🔧 環境變數說明

| 變數名稱 | 必填 | 說明 |
|---------|------|------|
| `GEMINI_API_KEY` | ✅ | Google Gemini AI API Key，從 [Google AI Studio](https://ai.google.dev/) 取得 |
| `API_KEY` | ❌ | 向後相容性支援，優先使用 `GEMINI_API_KEY` |

## 🛠️ 技術細節

### 環境變數載入機制
1. **本地開發**: Vite 自動載入 `.env` 檔案
2. **雲端部署**: 透過平台環境變數系統注入
3. **優先順序**: `GEMINI_API_KEY` > `API_KEY`
4. **編譯時注入**: 透過 `vite.config.ts` 中的 `define` 設定

### 安全性考量
- ✅ `.env` 檔案已被 `.gitignore` 保護
- ✅ API Key 在構建時編譯到代碼中（前端專案特性）
- ✅ 支援不同環境的變數隔離
- ⚠️ 前端應用中的 API Key 對用戶可見，請確保 API Key 有適當的使用限制

## 📋 部署檢查清單

部署前請確認：

- [ ] GitHub repository 已推送最新代碼
- [ ] 已取得有效的 Google Gemini API Key
- [ ] 在部署平台設定了 `GEMINI_API_KEY` 環境變數
- [ ] 構建命令設定為 `npm run build`
- [ ] 輸出目錄設定為 `dist`
- [ ] API Key 有適當的使用配額和限制

## 🐛 常見問題

### Q: 部署後出現 "GEMINI_API_KEY environment variable not set" 錯誤
**A**: 檢查雲端平台的環境變數設定，確保變數名稱正確且值不為空。

### Q: 本地開發正常，部署後 API 調用失敗
**A**: 
1. 確認雲端環境變數設定正確
2. 檢查 API Key 是否有地區限制
3. 確認 API Key 配額未超限

### Q: 如何更新 API Key？
**A**: 
- **本地**: 編輯 `.env` 檔案
- **雲端**: 在部署平台的環境變數設定中更新，然後重新部署

## 🚀 快速部署連結

- [Deploy to Vercel](https://vercel.com/new/clone?repository-url=https://github.com/your-username/your-repo)
- [Deploy to Netlify](https://app.netlify.com/start/deploy?repository=https://github.com/your-username/your-repo)

> **注意**: 請將上方連結中的 `your-username/your-repo` 替換為實際的 GitHub repository 路径。