"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Upload, FileText, CreditCard, X, CheckCircle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"

interface FileUpload {
  id: string
  file: File
  progress: number
  status: "pending" | "processing" | "completed" | "error"
  errorMessage?: string
}

export default function HomePage() {
  const [uploads, setUploads] = useState<FileUpload[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const router = useRouter()

  const generateId = () => Math.random().toString(36).substr(2, 9)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])

    const newUploads: FileUpload[] = files.map((file) => ({
      id: generateId(),
      file,
      progress: 0,
      status: "pending",
    }))

    setUploads((prev) => [...prev, ...newUploads])

    // Reset input
    event.target.value = ""
  }

  const removeFile = (id: string) => {
    setUploads((prev) => prev.filter((upload) => upload.id !== id))
  }

  const processFiles = async () => {
    if (uploads.length === 0) return

    setIsProcessing(true)

    // Procesar archivos secuencialmente
    for (const upload of uploads) {
      if (upload.status !== "pending") continue

      // Marcar como procesando
      setUploads((prev) => prev.map((u) => (u.id === upload.id ? { ...u, status: "processing" } : u)))

      // Simular procesamiento con progreso
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise((resolve) => setTimeout(resolve, 150))

        setUploads((prev) => prev.map((u) => (u.id === upload.id ? { ...u, progress } : u)))
      }

      // Simular posible error (10% de probabilidad)
      const hasError = Math.random() < 0.1

      setUploads((prev) =>
        prev.map((u) =>
          u.id === upload.id
            ? {
                ...u,
                status: hasError ? "error" : "completed",
                errorMessage: hasError ? "Error al procesar el archivo PDF" : undefined,
              }
            : u,
        ),
      )

      // Pequeña pausa entre archivos
      await new Promise((resolve) => setTimeout(resolve, 200))
    }

    setIsProcessing(false)

    // Redirigir al dashboard después de un momento
    setTimeout(() => {
      router.push("/dashboard")
    }, 1000)
  }

  const getStatusIcon = (status: FileUpload["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-600" />
      case "processing":
        return <div className="h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      default:
        return <FileText className="h-4 w-4 text-slate-400" />
    }
  }

  const getStatusBadge = (status: FileUpload["status"]) => {
    switch (status) {
      case "completed":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            Completado
          </Badge>
        )
      case "error":
        return <Badge variant="destructive">Error</Badge>
      case "processing":
        return <Badge variant="secondary">Procesando...</Badge>
      default:
        return <Badge variant="outline">Pendiente</Badge>
    }
  }

  const completedCount = uploads.filter((u) => u.status === "completed").length
  const errorCount = uploads.filter((u) => u.status === "error").length
  const canProcess = uploads.length > 0 && !isProcessing && uploads.some((u) => u.status === "pending")

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <CreditCard className="h-12 w-12 text-blue-600 mr-3" />
            <h1 className="text-4xl font-bold text-slate-800">Desglose de Tarjetas</h1>
          </div>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Analiza tus resúmenes de tarjeta de crédito de forma inteligente. Sube uno o varios archivos PDF y obtén
            insights detallados sobre tus gastos y cuotas.
          </p>
        </div>

        {/* Upload Section */}
        <div className="max-w-4xl mx-auto space-y-6">
          <Card className="border-2 border-dashed border-slate-300 hover:border-blue-400 transition-colors">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center mb-2">
                <FileText className="h-6 w-6 mr-2 text-blue-600" />
                Subir Resúmenes de Tarjeta
              </CardTitle>
              <CardDescription>
                Selecciona uno o varios archivos PDF de tus resúmenes de tarjeta de crédito
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="mb-6">
                  <Upload className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                  <p className="text-sm text-slate-500 mb-4">Arrastra tus archivos aquí o haz clic para seleccionar</p>
                </div>

                <div className="relative">
                  <input
                    type="file"
                    accept=".pdf"
                    multiple
                    onChange={handleFileSelect}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={isProcessing}
                  />
                  <Button size="lg" className="w-full sm:w-auto" disabled={isProcessing}>
                    <Upload className="h-4 w-4 mr-2" />
                    Seleccionar Archivos PDF
                  </Button>
                </div>

                <p className="text-xs text-slate-400 mt-4">
                  Formatos soportados: PDF • Tamaño máximo: 10MB por archivo • Múltiples archivos permitidos
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Files List */}
          {uploads.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Archivos Seleccionados ({uploads.length})</CardTitle>
                    <CardDescription>
                      {completedCount > 0 && `${completedCount} completados`}
                      {errorCount > 0 && ` • ${errorCount} con errores`}
                    </CardDescription>
                  </div>
                  {canProcess && (
                    <Button onClick={processFiles} disabled={isProcessing}>
                      <FileText className="h-4 w-4 mr-2" />
                      Procesar Archivos
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {uploads.map((upload) => (
                    <div
                      key={upload.id}
                      className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border"
                    >
                      <div className="flex items-center space-x-3 flex-1">
                        {getStatusIcon(upload.status)}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900 truncate">{upload.file.name}</p>
                          <p className="text-xs text-slate-500">{(upload.file.size / 1024 / 1024).toFixed(2)} MB</p>
                          {upload.errorMessage && <p className="text-xs text-red-600 mt-1">{upload.errorMessage}</p>}
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        {upload.status === "processing" && (
                          <div className="w-24">
                            <Progress value={upload.progress} className="h-2" />
                          </div>
                        )}

                        {getStatusBadge(upload.status)}

                        {upload.status === "pending" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(upload.id)}
                            disabled={isProcessing}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Overall Progress */}
                {isProcessing && (
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-blue-900">Procesando archivos...</span>
                      <span className="text-sm text-blue-700">
                        {completedCount + errorCount} de {uploads.length}
                      </span>
                    </div>
                    <Progress value={((completedCount + errorCount) / uploads.length) * 100} className="h-2" />
                  </div>
                )}

                {/* Completion Message */}
                {!isProcessing && uploads.length > 0 && uploads.every((u) => u.status !== "pending") && (
                  <div className="mt-6 p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                      <div>
                        <p className="text-sm font-medium text-green-900">Procesamiento completado</p>
                        <p className="text-xs text-green-700">
                          {completedCount} archivos procesados exitosamente
                          {errorCount > 0 && `, ${errorCount} con errores`}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Features Preview */}
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <CreditCard className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2">Análisis Automático</h3>
                <p className="text-sm text-slate-600">
                  Extrae automáticamente gastos, cuotas y fechas de tus resúmenes
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold mb-2">Múltiples Archivos</h3>
                <p className="text-sm text-slate-600">Procesa varios resúmenes a la vez para un análisis completo</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Upload className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-2">Proyecciones</h3>
                <p className="text-sm text-slate-600">Conoce tus pagos futuros basados en las cuotas activas</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
