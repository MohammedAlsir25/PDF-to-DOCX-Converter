# 📄 PDF to DOCX Converter (High Fidelity)

![Banner](https://picsum.photos/seed/converter/1200/400)

A professional-grade, full-stack application designed to transform static PDF documents into fully editable Microsoft Word files while maintaining absolute visual and structural integrity. 

Unlike standard converters, this tool uses a **Linguistic Synthesis Engine** powered by Gemini 2.0 Flash to understand document context, preserve specialized fonts, and correctly handle complex scripts like Arabic.

## ✨ Key Features

*   **🎯 High-Fidelity Reconstruction**: Uses advanced AI to identify and replicate exact font families, font sizes, colors, and paragraph alignments from the original PDF.
*   **🌍 Multi-Lingual & RTL Optimized**: Specifically tuned for Arabic and other Right-to-Left (RTL) languages. It preserves script continuity and alignment natively in the DOCX output.
*   **🧠 Linguist Synthesis Engine**:
    *   **Automated Summarization**: Generates a professional linguistic summary of every document.
    *   **Tone & Complexity Analysis**: Identifies if a document is Legal, Technical, or Academic and calculates its reading level.
    *   **Language Detection**: Automatically identifies primary and secondary languages within a single doc.
*   **⚡ Modern Batch Processing**: Drag-and-drop multiple files to process them in a high-performance neural queue.
*   **🔒 Production Secure**: Architected with a secure Node.js/Express backend to keep AI tokens and processing logic private.
*   **📱 Mobile & PWA Ready**: Fully responsive UI with Capacitor integration, ready for deployment as an Android APK.

## 🛠️ Technology Stack

- **Frontend**: React 19, Tailwind CSS, Motion (React), Lucide Icons
- **Backend**: Node.js, Express, `docx` (OpenXML generation)
- **AI Core**: Google Gemini 2.0 Flash (`@google/genai` SDK)
- **Mobile**: Capacitor (Android native bridge)
- **Build Tool**: Vite

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- A Google Gemini API Key

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/pdf-to-docx-converter.git
   cd pdf-to-docx-converter
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure Environment Variables:
   Create a `.env` file in the root directory:
   ```env
   GEMINI_API_KEY=your_api_key_here
   ```

### Development

Start the full-stack application:
```bash
npm run dev
```
The app will be available at `http://localhost:3000`.

### Building for Production

```bash
npm run build
npm start
```

## 📱 Mobile (Android)

The project is pre-configured with Capacitor. To build for Android:

1. Add Android platform (if not present):
   ```bash
   npx cap add android
   ```
2. Sync changes:
   ```bash
   npx cap sync android
   ```
3. Open in Android Studio:
   ```bash
   npx cap open android
   ```

## 📜 License

SPDX-License-Identifier: Apache-2.0
