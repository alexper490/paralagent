import React, { useState, useEffect } from 'react';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import { saveAs } from 'file-saver';
import Confetti from 'react-confetti';
import './Dashboard.css';

// Developer-configurable AI Model
const DEV_CONFIG_AI_MODEL = 'gpt-4o-mini'; // <-- YOU CAN CHANGE THIS VARIABLE

function Dashboard() {
  const [textContent, setTextContent] = useState('');
  const [userPrompt, setUserPrompt] = useState('');
  const [caseFiles, setCaseFiles] = useState([]);
  const [referenceFiles, setReferenceFiles] = useState([]);
  const [dragOver, setDragOver] = useState({ case: false, reference: false });
  const [selectedDocumentType, setSelectedDocumentType] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [downloadIndicator, setDownloadIndicator] = useState('');

  // Effect to hide confetti and message after a delay
  useEffect(() => {
    let confettiTimer;
    let messageTimer;
    if (showConfetti) {
      // Timers are only set when showConfetti becomes true
      confettiTimer = setTimeout(() => setShowConfetti(false), 6000); // Confetti for 6 seconds
      messageTimer = setTimeout(() => setDownloadIndicator(''), 6000); // Clear message after 6 seconds
    }
    return () => {
      clearTimeout(confettiTimer);
      clearTimeout(messageTimer);
    };
  }, [showConfetti]); // Effect now only depends on showConfetti

  // Document types
  const documentTypes = [
    'Contracts & Agreements',
    'Pleadings',
    'Legal Opinions and Memoranda',
    'Wills and Trusts',
    'Corporate Formation and Governance Documents'
  ];

  // Supported file types
  const supportedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];

  const supportedExtensions = ['.pdf', '.doc', '.docx'];

  // Check if file type is supported
  const isFileSupported = (file) => {
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    return supportedTypes.includes(file.type) || supportedExtensions.includes(fileExtension);
  };

  // Handle file selection
  const handleFileSelect = (files, type) => {
    const validFiles = Array.from(files).filter(file => {
      if (!isFileSupported(file)) {
        alert(`File "${file.name}" is not supported. Please upload PDF or Word documents only.`);
        return false;
      }
      return true;
    });

    if (validFiles.length > 0) {
      const fileObjects = validFiles.map(file => ({
        id: Date.now() + Math.random(),
        name: file.name,
        size: file.size,
        type: file.type,
        file: file
      }));

      if (type === 'case') {
        setCaseFiles(prev => [...prev, ...fileObjects]);
      } else {
        setReferenceFiles(prev => [...prev, ...fileObjects]);
      }
    }
  };

  // Handle drag events
  const handleDragOver = (e, type) => {
    e.preventDefault();
    setDragOver(prev => ({ ...prev, [type]: true }));
  };

  const handleDragLeave = (e, type) => {
    e.preventDefault();
    setDragOver(prev => ({ ...prev, [type]: false }));
  };

  const handleDrop = (e, type) => {
    e.preventDefault();
    setDragOver(prev => ({ ...prev, [type]: false }));
    const files = e.dataTransfer.files;
    handleFileSelect(files, type);
  };

  // Handle file input change
  const handleFileInputChange = (e, type) => {
    const files = e.target.files;
    handleFileSelect(files, type);
    e.target.value = ''; // Reset input
  };

  // Handle file download/copy
  const handleFileClick = (fileObj) => {
    const url = URL.createObjectURL(fileObj.file);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileObj.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Remove file
  const removeFile = (fileId, type) => {
    if (type === 'case') {
      setCaseFiles(prev => prev.filter(file => file.id !== fileId));
    } else {
      setReferenceFiles(prev => prev.filter(file => file.id !== fileId));
    }
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Extract text from files (simplified - in production you'd use proper PDF/DOC parsers)
  const extractTextFromFiles = async (files) => {
    // TODO: Implement actual text extraction from PDF and DOCX files.
    // For a full RAG system, this step would also involve chunking the text
    // and generating embeddings for storage in a vector database.
    // Currently, this function only returns filenames and basic info.
    const textContents = [];
    for (const fileObj of files) {
      try {
        textContents.push(`File: ${fileObj.name} (${formatFileSize(fileObj.size)}) - Content not extracted in this version.`);
      } catch (error) {
        console.error('Error processing file info:', error);
      }
    }
    return textContents.join('\n');
  };

  // Generate document with GPT
  const generateDocument = async () => {
    if (!selectedDocumentType) {
      alert('Please select a document type before generating.');
      return;
    }

    if (!userPrompt.trim()) {
      alert('Please provide a user prompt describing what you want to generate.');
      return;
    }
    
    const apiKey = process.env.REACT_APP_OPENAI_API_KEY;
    if (!apiKey || apiKey === 'your-actual-openai-api-key-here' || apiKey === 'your-openai-api-key-here') {
      alert('OpenAI API key is not configured. Please check your .env.local file and ensure REACT_APP_OPENAI_API_KEY is set with your actual API key.');
      return;
    }

    setIsGenerating(true);

    try {
      const caseDocumentsText = await extractTextFromFiles(caseFiles);
      const referenceDocumentsText = await extractTextFromFiles(referenceFiles);

      const systemPrompt = `You are a professional legal document generator. Your task is to create a ${selectedDocumentType} document based on the provided information. 

IMPORTANT GUIDELINES:
1.  **Content Source:** Derive ALL factual information, names, dates, specific terms, and case-specific details EXCLUSIVELY from the "Case Documents Content" and "Case Information" sections below. Do NOT use any factual content from the "Reference Materials Format" section for the substance of the new document.
2.  **Formatting and Tone Reference:** Use the "Reference Materials Format" section SOLELY to understand the desired document structure, layout, headings, tone of voice, and overall stylistic presentation. Mimic this structure and tone in the document you generate. For example, if the reference material is an NDA, adopt its typical sections and formal tone, but populate it with facts from the case documents/info.
3.  **No Hallucinations:** Do NOT hallucinate or invent any facts, names, dates, or details not present in the "Case Documents Content" or "Case Information".
4.  **Placeholders:** If specific information required for the document is missing from the content sources, use clear placeholder text like [CLIENT NAME], [EFFECTIVE DATE], [SPECIFIC CLAUSE DETAILS REQUIRED], etc.
5.  **Strict Scope:** Stay strictly within the scope of the provided factual information for the document's content.
6.  **Professional Structure:** Create a professional, legally appropriate document structure, guided by the reference materials.

Document Type: ${selectedDocumentType}
Model In Use: ${DEV_CONFIG_AI_MODEL}

-------------------- BEGIN INPUT SECTIONS --------------------

[Case Documents Content - For Factual Information]
${caseDocumentsText || 'No case documents provided. Base content solely on Case Information if available.'}

[Case Information - For Factual Information]
${textContent || 'No additional case information provided. Base content solely on Case Documents if available.'}

[Reference Materials Format - For Structure, Formatting, and Tone ONLY]
${referenceDocumentsText || 'No reference materials provided. Use standard legal formatting for the selected document type.'}

[User Instructions - Specific Directives for this Document]
${userPrompt}

-------------------- END INPUT SECTIONS --------------------

Generate a professional ${selectedDocumentType} document following ALL the above guidelines. Ensure the content is based ONLY on Case Documents and Case Information, while the format and tone emulate the Reference Materials.`;

      console.log('Making API request to OpenAI...');
      console.log('Using Model:', DEV_CONFIG_AI_MODEL);
      console.log('API Key present:', !!apiKey);
      console.log('API Key starts with:', apiKey.substring(0, 7) + '...');

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: DEV_CONFIG_AI_MODEL,
          messages: [
            {
              role: 'system',
              content: systemPrompt
            }
          ],
          max_tokens: 15000,
          temperature: 0.3
        })
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      if (!response.ok) {
        const errorData = await response.text();
        console.error('API Error Response:', errorData);
        
        if (response.status === 401) {
          throw new Error('Invalid API key or your key does not have permission for the configured model. Please check your OpenAI API key and model access.');
        } else if (response.status === 429) {
          throw new Error('Rate limit exceeded or quota exceeded. Please check your OpenAI plan and usage limits.');
        } else if (response.status === 400) {
          let specificError = 'Bad request.';
          try {
            const parsedError = JSON.parse(errorData);
            if (parsedError.error && parsedError.error.message) {
              specificError += ` Details: ${parsedError.error.message}`;
            }
          } catch (e) { /* Ignore parsing error */ }
          throw new Error(`${specificError} This could be due to an invalid model name (check DEV_CONFIG_AI_MODEL in Dashboard.js), incorrect request format, or the model not supporting the specified parameters (e.g., max_tokens).`);
        } else if (response.status === 404) {
            throw new Error('Model not found. Please ensure the model name in DEV_CONFIG_AI_MODEL (Dashboard.js) is correct and you have access to it.');
        } else {
          throw new Error(`API request failed with status ${response.status}: ${errorData}`);
        }
      }

      const data = await response.json();
      console.log('API Response:', data);

      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error('Invalid response format from OpenAI API');
      }

      const generatedContent = data.choices[0].message.content;
      await createAndDownloadDocx(generatedContent);

    } catch (error) {
      console.error('Error generating document:', error);
      alert('Error generating document: ' + error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const createAndDownloadDocx = async (content) => {
    try {
      const paragraphs = content.split('\n').filter(line => line.trim() !== '');
      const docParagraphs = paragraphs.map(paragraph => {
        const isHeading = (paragraph.match(/^#+\s/) || 
                         (paragraph === paragraph.toUpperCase() && paragraph.length < 100 && !paragraph.includes(' ')) ||
                         paragraph.match(/^(AGREEMENT|CONTRACT|MEMORANDUM|WILL|ARTICLES OF INCORPORATION|BYLAWS|RESOLUTION|MINUTES|NOTICE|PLEADINGS|MOTION|ORDER|JUDGMENT|OPINION|AFFIDAVIT|DECLARATION|TESTAMENT|TRUST AGREEMENT|POWER OF ATTORNEY)/i));
        
        if (isHeading) {
          return new Paragraph({
            children: [
              new TextRun({
                text: paragraph.replace(/^#+\s/, ''),
                bold: true,
                size: 28
              })
            ],
            spacing: { after: 200 }
          });
        } else {
          return new Paragraph({
            children: [
              new TextRun({
                text: paragraph,
                size: 24
              })
            ],
            spacing: { after: 120 }
          });
        }
      });

      const doc = new Document({
        sections: [{
          properties: {},
          children: docParagraphs
        }]
      });

      const blob = await Packer.toBlob(doc);
      const fileName = `${selectedDocumentType.replace(/[\s&]+/g, '_')}_${DEV_CONFIG_AI_MODEL}_${new Date().toISOString().split('T')[0]}.docx`;
      saveAs(blob, fileName);
      
      // Set the fully formatted success message here
      setDownloadIndicator(`Document "${fileName}" downloaded successfully!`); 
      setShowConfetti(true); // Trigger confetti and message display via useEffect

    } catch (error) {
      console.error('Error creating DOCX:', error);
      alert('Error creating document file: ' + error.message);
    }
  };

  return (
    <div className="dashboard">
      {showConfetti && <Confetti width={window.innerWidth} height={window.innerHeight} />}
      <header className="dashboard-header">
        <div className="container">
          <h1 className="dashboard-title">
            Para<span className="accent">lagent</span>
          </h1>
          <p className="dashboard-subtitle">AI Legal Document Generator</p>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="container">
          <div className="dashboard-grid">
            {/* Case Documents Box */}
            <div className="dashboard-box">
              <div className="box-header">
                <h3>Case Documents</h3>
                <p>Upload relevant case files and documents</p>
              </div>
              <div className="box-content">
                <div 
                  className={`upload-area ${dragOver.case ? 'drag-over' : ''}`}
                  onDragOver={(e) => handleDragOver(e, 'case')}
                  onDragLeave={(e) => handleDragLeave(e, 'case')}
                  onDrop={(e) => handleDrop(e, 'case')}
                >
                  <div className="upload-icon">📄</div>
                  <input type="file" id="case-file-input" multiple accept=".pdf,.doc,.docx" onChange={(e) => handleFileInputChange(e, 'case')} style={{ display: 'none' }} />
                  <button className="upload-button" onClick={() => document.getElementById('case-file-input').click()}>Upload a File</button>
                  <p className="upload-hint">Drag & drop or click to browse<br/><small>Supports: PDF, DOC, DOCX</small></p>
                </div>
                {caseFiles.length > 0 && (
                  <div className="uploaded-files">
                    <h4>Uploaded Files:</h4>
                    {caseFiles.map(file => (
                      <div key={file.id} className="file-item">
                        <span className="file-name" onClick={() => handleFileClick(file)} title="Click to download">📄 {file.name}</span>
                        <span className="file-size">({formatFileSize(file.size)})</span>
                        <button className="remove-file" onClick={() => removeFile(file.id, 'case')} title="Remove file">×</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Case Information Box */}
            <div className="dashboard-box">
              <div className="box-header">
                <h3>Case Information</h3>
                <p>Provide additional context and details</p>
              </div>
              <div className="box-content">
                <div className="text-area-container">
                  <textarea
                    className="expanding-text-box"
                    placeholder="Enter case details, background information, specific requirements..."
                    value={textContent}
                    onChange={(e) => setTextContent(e.target.value)}
                    rows="8"
                  />
                  <div className="text-counter">{textContent.length} characters</div>
                </div>
              </div>
            </div>

            {/* Reference Materials Box */}
            <div className="dashboard-box">
              <div className="box-header">
                <h3>Reference Materials</h3>
                <p>Upload templates or reference documents</p>
              </div>
              <div className="box-content">
                <div 
                  className={`upload-area ${dragOver.reference ? 'drag-over' : ''}`}
                  onDragOver={(e) => handleDragOver(e, 'reference')}
                  onDragLeave={(e) => handleDragLeave(e, 'reference')}
                  onDrop={(e) => handleDrop(e, 'reference')}
                >
                  <div className="upload-icon">📋</div>
                  <input type="file" id="reference-file-input" multiple accept=".pdf,.doc,.docx" onChange={(e) => handleFileInputChange(e, 'reference')} style={{ display: 'none' }} />
                  <button className="upload-button" onClick={() => document.getElementById('reference-file-input').click()}>Upload a File</button>
                  <p className="upload-hint">Templates, precedents, style guides<br/><small>Supports: PDF, DOC, DOCX</small></p>
                </div>
                {referenceFiles.length > 0 && (
                  <div className="uploaded-files">
                    <h4>Uploaded Files:</h4>
                    {referenceFiles.map(file => (
                      <div key={file.id} className="file-item">
                        <span className="file-name" onClick={() => handleFileClick(file)} title="Click to download">📋 {file.name}</span>
                        <span className="file-size">({formatFileSize(file.size)})</span>
                        <button className="remove-file" onClick={() => removeFile(file.id, 'reference')} title="Remove file">×</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Document Type Selection */}
          <div className="document-type-section">
            <h3>Select Document Type</h3>
            <div className="document-type-grid">
              {documentTypes.map((type) => (
                <button
                  key={type}
                  className={`document-type-button ${selectedDocumentType === type ? 'selected' : ''}`}
                  onClick={() => setSelectedDocumentType(type)}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* User Prompt Section */}
          <div className="user-prompt-section">
            <h3>User Prompt</h3>
            <p className="prompt-description">
              Describe what you want the AI to generate. Be specific about requirements, format, and any special instructions.
            </p>
            <div className="prompt-container">
              <textarea
                className="user-prompt-box"
                placeholder="Example: Write an NDA for John Doe regarding Project Alpha..."
                value={userPrompt}
                onChange={(e) => setUserPrompt(e.target.value)}
                rows="4"
              />
              <div className="prompt-counter">{userPrompt.length} characters</div>
            </div>
          </div>

          {/* Create Document Button */}
          <div className="action-section">
            <button 
              className={`create-document-button ${isGenerating ? 'generating' : ''}`}
              onClick={generateDocument}
              disabled={isGenerating}
            >
              <span className="button-icon">{isGenerating ? '⏳' : '✨'}</span>
              {isGenerating ? 'Generating Document...' : 'Generate Document'}
            </button>
            <p className="action-hint">
              {isGenerating 
                ? 'AI is analyzing your documents and generating the legal document...'
                : `Generating with ${DEV_CONFIG_AI_MODEL}. Click to start AI analysis.`
              }
            </p>
            {downloadIndicator && !isGenerating && (
              <p className="download-success-message">{downloadIndicator}</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard; 