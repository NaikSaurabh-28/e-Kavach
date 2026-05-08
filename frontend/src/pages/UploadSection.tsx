import { useState } from 'react';
import { motion } from 'framer-motion';
import { UploadCloud, File, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function UploadSection() {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto"
    >
      <Card>
        <CardHeader>
          <CardTitle>e-File Document</CardTitle>
          <CardDescription>Upload your legal documents in PDF format for court submission.</CardDescription>
        </CardHeader>
        <CardContent>
          <div 
            className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
              dragActive ? "border-government-blue bg-blue-50" : "border-government-muted/30 hover:bg-government-bg"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {file ? (
              <div className="flex flex-col items-center space-y-4">
                <div className="p-4 bg-green-50 rounded-full">
                  <File className="w-10 h-10 text-green-500" />
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-government-text">{file.name}</span>
                  <button onClick={() => setFile(null)} className="text-government-muted hover:text-red-500">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-sm text-government-muted">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                <div className="pt-4 flex space-x-3">
                  <Button variant="outline" onClick={() => setFile(null)}>Cancel</Button>
                  <Button>Submit Filing</Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-4">
                <div className="p-4 bg-government-blue/10 rounded-full">
                  <UploadCloud className="w-10 h-10 text-government-blue" />
                </div>
                <div>
                  <p className="font-medium text-government-text text-lg">Drag & Drop your files here</p>
                  <p className="text-sm text-government-muted mt-1">or click to browse from your computer</p>
                </div>
                <p className="text-xs text-government-muted mt-4">Supported formats: PDF, DOCX (Max 20MB)</p>
                <Button className="mt-4" onClick={() => document.getElementById('file-upload')?.click()}>
                  Select File
                </Button>
                <input id="file-upload" type="file" className="hidden" onChange={(e) => {
                  if (e.target.files && e.target.files[0]) setFile(e.target.files[0]);
                }} />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
