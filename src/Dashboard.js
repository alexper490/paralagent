import React, { useState } from 'react';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import { saveAs } from 'file-saver';
import './Dashboard.css';

function Dashboard() {
  const [textContent, setTextContent] = useState('');
  const [userPrompt, setUserPrompt] = useState('');
  const [caseFiles, setCaseFiles] = useState([]);
  const [referenceFiles, setReferenceFiles] = useState([]);
  const [dragOver, setDragOver] = useState({ case: false, reference: false });
  const [selectedDocumentType, setSelectedDocumentType] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

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
    const textContents = [];
    for (const fileObj of files) {
      try {
        // For demonstration, we'll use file names and basic info
        // In production, you'd implement proper PDF/DOC text extraction
        textContents.push(`File: ${fileObj.name} (${formatFileSize(fileObj.size)})`);
      } catch (error) {
        console.error('Error extracting text from file:', error);
      }
    }
    return textContents.join('\n');
  };

  // Generate document with GPT-4
  const generateDocument = async () => {
    if (!selectedDocumentType) {
      alert('Please select a document type before generating.');
      return;
    }

    if (!userPrompt.trim()) {
      alert('Please provide a user prompt describing what you want to generate.');
      return;
    }

    setIsGenerating(true);

    try {
      // Extract content from uploaded files
      const caseDocumentsText = await extractTextFromFiles(caseFiles);
      const referenceDocumentsText = await extractTextFromFiles(referenceFiles);

      // Prepare the prompt for GPT-4
      const systemPrompt = `You are a professional legal document generator. Your task is to create a ${selectedDocumentType} document based on the provided information. 

IMPORTANT GUIDELINES:
1. Only use information explicitly provided in the case documents and case information
2. Do NOT hallucinate or invent any facts, names, dates, or details not present in the source material
3. If specific information is missing, use placeholder text like [CLIENT NAME], [DATE], [SPECIFIC TERMS], etc.
4. Follow the format and tone of the reference materials provided
5. Stay strictly within the scope of the provided information
6. Create a professional, legally appropriate document structure

Document Type: ${selectedDocumentType}

Case Documents Content:
${caseDocumentsText || 'No case documents provided'}

Case Information:
${textContent || 'No additional case information provided'}

Reference Materials Format:
${referenceDocumentsText || 'No reference materials provided'}

User Instructions:
${userPrompt}

Generate a professional ${selectedDocumentType} document following the above guidelines. Use clear headings, proper legal formatting, and ensure all content is based solely on the provided information.`;

      // Call GPT-4 API (Note: In production, this should be done through a backend API for security)
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}` // You'll need to set this
        },
        body: JSON.stringify({
          model: 'gpt-4-turbo-preview',
          messages: [
            {
              role: 'system',
              content: systemPrompt
            }
          ],
          max_tokens: 4000,
          temperature: 0.3
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate document. Please check your API key and try again.');
      }

      const data = await response.json();
      const generatedContent = data.choices[0].message.content;

      // Create DOCX document
      await createAndDownloadDocx(generatedContent);

    } catch (error) {
      console.error('Error generating document:', error);
      alert('Error generating document: ' + error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  // Create and download DOCX file
  const createAndDownloadDocx = async (content) => {
    try {
      // Split content into paragraphs
      const paragraphs = content.split('\n').filter(line => line.trim() !== '');
      
      const docParagraphs = paragraphs.map(paragraph => {
        // Check if it's a heading (starts with #, all caps, or contains specific keywords)
        const isHeading = paragraph.match(/^#+\s/) || 
                         paragraph === paragraph.toUpperCase() && paragraph.length < 100 ||
                         paragraph.match(/^(AGREEMENT|CONTRACT|MEMORANDUM|WILL|ARTICLES)/i);
        
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
      const fileName = `${selectedDocumentType.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.docx`;
      saveAs(blob, fileName);
      
      alert('Document generated and downloaded successfully!');
    } catch (error) {
      console.error('Error creating DOCX:', error);
      alert('Error creating document file: ' + error.message);
    }
  };

  return (
    <div className="dashboard">
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
            {/* First Box - Upload Case Files */}
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
                  <input
                    type="file"
                    id="case-file-input"
                    multiple
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => handleFileInputChange(e, 'case')}
                    style={{ display: 'none' }}
                  />
                  <button 
                    className="upload-button"
                    onClick={() => document.getElementById('case-file-input').click()}
                  >
                    Upload a File
                  </button>
                  <p className="upload-hint">
                    Drag and drop files here or click to browse<br/>
                    <small>Supports: PDF, DOC, DOCX</small>
                  </p>
                </div>
                
                {/* Display uploaded files */}
                {caseFiles.length > 0 && (
                  <div className="uploaded-files">
                    <h4>Uploaded Files:</h4>
                    {caseFiles.map(file => (
                      <div key={file.id} className="file-item">
                        <span 
                          className="file-name"
                          onClick={() => handleFileClick(file)}
                          title="Click to download"
                        >
                          📄 {file.name}
                        </span>
                        <span className="file-size">({formatFileSize(file.size)})</span>
                        <button 
                          className="remove-file"
                          onClick={() => removeFile(file.id, 'case')}
                          title="Remove file"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Second Box - Expanding Text Box */}
            <div className="dashboard-box">
              <div className="box-header">
                <h3>Case Information</h3>
                <p>Provide additional context and details</p>
              </div>
              <div className="box-content">
                <div className="text-area-container">
                  <textarea
                    className="expanding-text-box"
                    placeholder="Enter case details, background information, specific requirements, or any additional context that will help generate your legal document..."
                    value={textContent}
                    onChange={(e) => setTextContent(e.target.value)}
                    rows="8"
                  />
                  <div className="text-counter">
                    {textContent.length} characters
                  </div>
                </div>
              </div>
            </div>

            {/* Third Box - Upload Reference Files */}
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
                  <input
                    type="file"
                    id="reference-file-input"
                    multiple
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => handleFileInputChange(e, 'reference')}
                    style={{ display: 'none' }}
                  />
                  <button 
                    className="upload-button"
                    onClick={() => document.getElementById('reference-file-input').click()}
                  >
                    Upload a File
                  </button>
                  <p className="upload-hint">
                    Templates, precedents, or style guides<br/>
                    <small>Supports: PDF, DOC, DOCX</small>
                  </p>
                </div>
                
                {/* Display uploaded files */}
                {referenceFiles.length > 0 && (
                  <div className="uploaded-files">
                    <h4>Uploaded Files:</h4>
                    {referenceFiles.map(file => (
                      <div key={file.id} className="file-item">
                        <span 
                          className="file-name"
                          onClick={() => handleFileClick(file)}
                          title="Click to download"
                        >
                          📋 {file.name}
                        </span>
                        <span className="file-size">({formatFileSize(file.size)})</span>
                        <button 
                          className="remove-file"
                          onClick={() => removeFile(file.id, 'reference')}
                          title="Remove file"
                        >
                          ×
                        </button>
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
                placeholder="Example: Write an NDA with the information provided. I want the receiving party to not disclose any confidential information about our new product launch for a period of 2 years..."
                value={userPrompt}
                onChange={(e) => setUserPrompt(e.target.value)}
                rows="4"
              />
              <div className="prompt-counter">
                {userPrompt.length} characters
              </div>
            </div>
          </div>

          {/* Create Document Button */}
          <div className="action-section">
            <button 
              className={`create-document-button ${isGenerating ? 'generating' : ''}`}
              onClick={generateDocument}
              disabled={isGenerating}
            >
              <span className="button-icon">
                {isGenerating ? '⏳' : '✨'}
              </span>
              {isGenerating ? 'Generating Document...' : 'Generate Document'}
            </button>
            <p className="action-hint">
              {isGenerating 
                ? 'AI is analyzing your documents and generating the legal document...'
                : 'Generate your legal document using AI analysis'
              }
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard; 