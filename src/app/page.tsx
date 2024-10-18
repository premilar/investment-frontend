"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { PlusCircle, Layers, FileText, RotateCcw, Paperclip, ArrowUpRight, X, Upload, Loader2 } from "lucide-react"





export default function Home() {
  const [message, setMessage] = useState('')
  const [openAIResponse, setOpenAIResponse] = useState('')
  const [error, setError] = useState('')
  const [query, setQuery] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  // const [file, setFile] = useState(null);
  const [extractedText, setExtractedText] = useState("")

  useEffect(() => {
    fetch('/api/hello')
      .then(response => response.json())
      .then(data => setMessage(data.message))
      .catch(error => {
        console.error('Error:', error)
        setError('Failed to fetch hello message')
      })
  }, [])

  const extractTextFromPDF = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (event) => {
        const text = event.target?.result
        resolve(typeof text === 'string' ? text : '')
      }
      reader.onerror = (error) => reject(error)
      reader.readAsText(file)
    })
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const uploadedFile = event.target.files[0]
      setFile(uploadedFile)
      try {
        const text = await extractTextFromPDF(uploadedFile)
        console.log("hello")
        setExtractedText(text)
      } catch (error) {
        console.error('Error extracting text from PDF:', error)
        setError('Failed to extract text from file')
      }
    }
  }

  const fetchOpenAIResponse = async () => {
    setIsProcessing(true)
    try {
        const formData = new FormData();
        formData.append('question', JSON.stringify({ query }));
        if (file) {
            formData.append('file', file);
        }

        const response = await fetch('/api/ask-with-pdf', {
            method: 'POST',
            body: formData,
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.detail || 'Failed to fetch OpenAI response');
        }
        setOpenAIResponse(data.answer);
    } catch (error) {
        console.error('Error:', error);
        setError('Failed to fetch OpenAI response');
    } finally {
        setIsProcessing(false);
    }
}

  const fetchOpenAIResponseOldWorks = async () => {
    setIsProcessing(true)
    // console.log(extractedText)
    try {
        
        const response = await fetch('/api/openai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: query  }), //query, extractedText
      })
      console.log("test")
      const data = await response.json()
      console.log('Full API Response:', data); // Log the full response for debugging

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to fetch OpenAI response');
      }
      // setOpenAIResponse(data.message)
      setOpenAIResponse(data.response)
    } catch (error) {
      console.error('Error:', error)
      setError('Failed to fetch OpenAI response')
    } finally {
      setIsProcessing(false)
    }
  }
  // WORKS

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!file) {
        setError('Please upload a file first');
        return;
    }
    if (!query) {
        setError('Please enter a query');
        return;
    }
    fetchOpenAIResponse();
}

  const handleSubmitOldWorks = (event: React.FormEvent) => {
    event.preventDefault()
    if (!extractedText) {
      setError('Please upload a file first')
      return
    }
    fetchOpenAIResponse()
  }

  return (
    <div className="flex h-screen bg-white text-gray-900 font-sans">
      {/* Sidebar */}
      <div className="w-16 bg-gray-100 flex flex-col items-center py-4 space-y-4">
        <div className="font-bold text-xl">v0</div>
        <Button variant="ghost" size="icon"><PlusCircle className="h-6 w-6" /></Button>
        <Button variant="ghost" size="icon"><Layers className="h-6 w-6" /></Button>
        <Button variant="ghost" size="icon"><FileText className="h-6 w-6" /></Button>
        <Button variant="ghost" size="icon"><RotateCcw className="h-6 w-6" /></Button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col p-8 overflow-y-auto">
        {/* New banner */}
        <div className="bg-teal-50 text-teal-700 px-4 py-2 rounded-full inline-flex items-center self-end mb-8">
          <span className="bg-teal-500 text-white text-xs font-bold px-2 py-1 rounded-full mr-2">New</span>
          Introducing v0 Enterprise and Team plans
          <ArrowUpRight className="h-4 w-4 ml-2" />
        </div>

        {/* Main heading */}
        <h1 className="text-5xl font-bold mb-8">What can I help you ship?</h1>

        {/* Premium message */}
        <div className="bg-gray-100 text-gray-700 p-4 rounded-lg flex justify-between items-center mb-4">
          <span>Need more messages? Get higher limits with Premium.</span>
          <Button variant="outline" className="text-teal-600 hover:text-teal-700">
            Upgrade Plan
            <X className="h-4 w-4 ml-2" />
          </Button>
        </div>

        {/* File Upload */}
        <div className="mb-4">
          <Input
            type="file"
            accept=".pdf,.txt"
            onChange={handleFileUpload}
            className="sr-only"
            id="file-upload"
          />
          <Label htmlFor="file-upload" className="cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-primary text-primary-foreground hover:bg-primary/90 h-10 py-2 px-4">
            <Upload className="mr-2 h-4 w-4" />
            Upload File
          </Label>
          {file && <span className="ml-2 text-sm text-gray-600">{file.name}</span>}
        </div>

        {/* Search input */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Input 
              placeholder="Ask v0 a question about the uploaded file..." 
              className="w-full py-6 pl-12 pr-20 text-lg rounded-xl border-2 border-gray-200 focus:border-gray-300 focus:ring-0"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <Paperclip className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-400" />
            <Button type="submit" className="absolute right-2 top-1/2 transform -translate-y-1/2" disabled={isProcessing || !extractedText}>
              {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit"}
            </Button>
          </div>
        </form>

        {/* Message and OpenAI Response display */}
        {message && (
          <div className="mt-4 p-4 bg-blue-50 text-blue-700 rounded-lg">
            <h2 className="font-bold">Hello Message:</h2>
            <p>{message}</p>
          </div>
        )}
        {openAIResponse && (
          <Textarea
            value={openAIResponse}
            readOnly
            className="mt-4 w-full p-4 text-gray-700 bg-gray-50 rounded-lg"
            rows={6}
          />
        )}
        {error && (
          <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg">
            <h2 className="font-bold">Error:</h2>
            <p>{error}</p>
          </div>
        )}

        {/* Example queries */}
        <div className="flex flex-wrap gap-4 mt-4">
          {["Summarize the file", "Extract key points", "Analyze the main argument"].map((exampleQuery, index) => (
            <Button 
              key={index} 
              variant="outline" 
              className="text-gray-700"
              onClick={() => setQuery(exampleQuery)}
            >
              {exampleQuery}
              <ArrowUpRight className="h-4 w-4 ml-2" />
            </Button>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-center space-x-4 p-4 text-sm text-gray-500">
        {["Pricing", "Enterprise", "FAQ", "Terms", "Privacy", "Legacy v0", "Vercel"].map((item, index) => (
          <a key={index} href="#" className="hover:text-gray-700">
            {item}
            {item === "Vercel" && <ArrowUpRight className="inline h-4 w-4 ml-1" />}
          </a>
        ))}
      </div>
    </div>
  )
}
