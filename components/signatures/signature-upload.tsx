"use client"

import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Upload, X, Pen, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { reportService } from '@/services/report.service'

export function SignatureUpload() {
  const [signature, setSignature] = useState<string | null>(null)
  const [signatureFile, setSignatureFile] = useState<File | null>(null)
  const [signaturePreview, setSignaturePreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load existing signature
  useEffect(() => {
    loadSignature()
  }, [])

  const loadSignature = async () => {
    setLoading(true)
    try {
      const existingSignature = await reportService.getMySignature()
      if (existingSignature) {
        setSignature(existingSignature)
        setSignaturePreview(existingSignature)
      }
    } catch (error: any) {
      console.error('Failed to load signature:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Signature image should be less than 2MB')
      return
    }

    setSignatureFile(file)
    setHasChanges(true)

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setSignaturePreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleUpload = async () => {
    if (!signatureFile) return

    setUploading(true)
    try {
      const response = await reportService.uploadSignature(signatureFile)
      setSignature(response.signature)
      setSignaturePreview(response.signature)
      setSignatureFile(null)
      setHasChanges(false)
      toast.success('Signature uploaded successfully!')
    } catch (error: any) {
      console.error('Failed to upload signature:', error)
      toast.error(error.message || 'Failed to upload signature')
    } finally {
      setUploading(false)
    }
  }

  const handleRemove = async () => {
    if (!signature) return

    try {
      await reportService.deleteMySignature()
      setSignature(null)
      setSignaturePreview(null)
      setSignatureFile(null)
      setHasChanges(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      toast.success('Signature removed successfully!')
    } catch (error: any) {
      console.error('Failed to remove signature:', error)
      toast.error(error.message || 'Failed to remove signature')
    }
  }

  const handleCancel = () => {
    setSignatureFile(null)
    setSignaturePreview(signature)
    setHasChanges(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Pen className="h-5 w-5" />
          Digital Signature
        </CardTitle>
        <CardDescription>
          Upload your signature to be included in report cards
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Preview */}
        <div className="flex justify-center">
          {signaturePreview ? (
            <div className="relative group">
              <div className="w-64 h-32 rounded-lg border-2 border-gray-200 bg-white flex items-center justify-center p-4">
                <img
                  src={signaturePreview}
                  alt="Signature"
                  className="max-w-full max-h-full object-contain"
                />
              </div>
              {!hasChanges && signature && (
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-4 w-4 mr-1" />
                    Replace
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    onClick={handleRemove}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Remove
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="w-64 h-32 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 flex flex-col items-center justify-center text-gray-400">
              <Pen className="h-8 w-8 mb-2" />
              <p className="text-sm text-center">No signature uploaded</p>
            </div>
          )}
        </div>

        {/* Upload Controls */}
        <div className="flex flex-col gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          
          {!hasChanges ? (
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-4 w-4 mr-2" />
              {signature ? 'Change Signature' : 'Upload Signature'}
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                type="button"
                variant="default"
                className="flex-1"
                onClick={handleUpload}
                disabled={uploading}
              >
                {uploading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle className="h-4 w-4 mr-2" />
                )}
                {uploading ? 'Uploading...' : 'Save Signature'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={uploading}
              >
                Cancel
              </Button>
            </div>
          )}

          {signatureFile && (
            <Alert className="bg-blue-50 border-blue-200">
              <AlertDescription className="text-blue-800 text-xs">
                New signature selected: {signatureFile.name}
              </AlertDescription>
            </Alert>
          )}

          <p className="text-xs text-muted-foreground text-center">
            Accepted formats: JPG, PNG<br />
            Max size: 2MB | Recommended: Transparent background
          </p>
        </div>
      </CardContent>
    </Card>
  )
}