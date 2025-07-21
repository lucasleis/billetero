"use client"

import { ArrowLeft, FileText, Calendar, Download, Eye } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

const historyData = [
  {
    id: 1,
    fileName: "resumen_enero_2024.pdf",
    uploadDate: "2024-01-25",
    period: "Enero 2024",
    totalAmount: 125430.5,
    status: "Procesado",
  },
  {
    id: 2,
    fileName: "resumen_diciembre_2023.pdf",
    uploadDate: "2023-12-28",
    period: "Diciembre 2023",
    totalAmount: 98750.3,
    status: "Procesado",
  },
  {
    id: 3,
    fileName: "resumen_noviembre_2023.pdf",
    uploadDate: "2023-11-27",
    period: "Noviembre 2023",
    totalAmount: 87650.8,
    status: "Procesado",
  },
]

export default function ProfilePage() {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(amount)
  }

  const totalProcessed = historyData.reduce((sum, item) => sum + item.totalAmount, 0)

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver al Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Perfil</h1>
              <p className="text-sm text-slate-600">Historial de resúmenes procesados</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Resúmenes Procesados</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{historyData.length}</div>
              <p className="text-xs text-muted-foreground">Archivos analizados exitosamente</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Analizado</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{formatCurrency(totalProcessed)}</div>
              <p className="text-xs text-muted-foreground">Suma de todos los períodos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Promedio Mensual</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(totalProcessed / historyData.length)}
              </div>
              <p className="text-xs text-muted-foreground">Gasto promedio por período</p>
            </CardContent>
          </Card>
        </div>

        {/* History Table */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>Historial de Resúmenes</CardTitle>
                <CardDescription>Lista de todos los archivos procesados anteriormente</CardDescription>
              </div>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Exportar Historial
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Archivo</TableHead>
                    <TableHead>Período</TableHead>
                    <TableHead>Fecha de Carga</TableHead>
                    <TableHead className="text-right">Monto Total</TableHead>
                    <TableHead className="text-center">Estado</TableHead>
                    <TableHead className="text-center">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {historyData.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          <FileText className="h-4 w-4 mr-2 text-red-600" />
                          {item.fileName}
                        </div>
                      </TableCell>
                      <TableCell>{item.period}</TableCell>
                      <TableCell>{new Date(item.uploadDate).toLocaleDateString("es-AR")}</TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(item.totalAmount)}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="default">{item.status}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center space-x-1">
                          <Button variant="ghost" size="sm" title="Ver detalles">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" title="Descargar">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="mt-8 text-center">
          <Card className="inline-block">
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-4">¿Necesitas procesar un nuevo resumen?</h3>
              <Link href="/">
                <Button size="lg">
                  <FileText className="h-4 w-4 mr-2" />
                  Subir Nuevo Archivo
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
