# Paralagent - AI Legal Document Generator

Paralagent is an AI-powered legal assistant that transforms case information into professional documents, saving lawyers valuable time and effort.

## Features

- **Document Upload**: Upload case documents and reference materials (PDF, DOC, DOCX)
- **AI Document Generation**: Generate professional legal documents using GPT-4
- **Document Type Selection**: Choose from 5 legal document categories
- **Custom Prompts**: Provide specific instructions for document generation
- **DOCX Export**: Download generated documents in Word format

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure OpenAI API Key

Create a `.env.local` file in the root directory and add your OpenAI API key:

```env
REACT_APP_OPENAI_API_KEY=your-actual-openai-api-key-here
```

**Important Security Notes:**
- Never commit your actual API key to version control
- In production, API calls should be handled by a secure backend
- The current implementation is for development/demo purposes only

### 3. Get OpenAI API Key

1. Visit [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in to your account
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key to your `.env.local` file

### 4. Start the Application

```bash
npm start
```

The application will be available at `http://localhost:3000`

## How to Use

### Basic Workflow

1. **Upload Case Documents**: Add relevant case files and documents
2. **Add Case Information**: Provide additional context in the text area
3. **Upload Reference Materials**: Add templates or examples for formatting
4. **Select Document Type**: Choose from:
   - Contracts & Agreements
   - Pleadings
   - Legal Opinions and Memoranda
   - Wills and Trusts
   - Corporate Formation and Governance Documents
5. **Write User Prompt**: Describe what you want the AI to generate
6. **Generate Document**: Click the generate button to create your document

### Example Usage

A lawyer wants to generate an NDA:
1. Uploads case documents related to the confidentiality agreement
2. Adds case information about the parties and confidential material
3. Uploads previous NDAs as reference materials for format and tone
4. Selects "Contracts & Agreements" as document type
5. Writes prompt: "Write an NDA with the information provided. I want the receiving party to not disclose any confidential information about our new product launch for a period of 2 years."
6. Generates and downloads the DOCX document

## Document Types Supported

- **Contracts & Agreements**: NDAs, service agreements, employment contracts
- **Pleadings**: Complaints, motions, responses
- **Legal Opinions and Memoranda**: Legal analysis, advisory opinions
- **Wills and Trusts**: Estate planning documents
- **Corporate Formation and Governance**: Articles of incorporation, bylaws

## AI Guidelines

The AI follows strict guidelines to ensure quality and accuracy:
- Only uses information explicitly provided in uploaded documents
- Does not hallucinate or invent facts not present in source material
- Uses placeholder text for missing information
- Follows format and tone of reference materials
- Creates professional, legally appropriate document structure

## Available Scripts

- `npm start` - Starts the development server
- `npm test` - Runs the test suite
- `npm run build` - Builds the app for production
- `npm run eject` - Ejects from Create React App (one-way operation)

## Technology Stack

- **Frontend**: React, CSS3, HTML5
- **AI Integration**: OpenAI GPT-4 API
- **Document Generation**: docx library
- **File Handling**: file-saver
- **Routing**: React Router

## Security Considerations

- API keys should be stored securely in environment variables
- In production, implement proper authentication and authorization
- Use a backend API to handle OpenAI requests securely
- Validate and sanitize all user inputs
- Implement rate limiting for API calls

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is for educational and demonstration purposes.
