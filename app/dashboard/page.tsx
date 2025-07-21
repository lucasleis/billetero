"use client"

import { useState } from "react"
import { ArrowLeft, CreditCard, Calendar, TrendingUp, Edit, Trash2, Filter, Download } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

// Datos de ejemplo - simulando múltiples resúmenes procesados
const summaryData = {
  totalSpent: 285430.5, // Suma de múltiples períodos
  totalToPay: 95230.8,
  activeInstallments: 28,
  processedFiles: 3, // Nuevo campo
}

const expensesData = [
  // Enero 2024
  {
    id: 1,
    date: "2024-01-15",
    merchant: "Supermercado Central",
    totalAmount: 25430.5,
    installments: 1,
    currentInstallment: 1,
    installmentAmount: 25430.5,
    category: "Alimentación",
    period: "Enero 2024",
  },
  {
    id: 2,
    date: "2024-01-18",
    merchant: "Tienda Electrónica",
    totalAmount: 89999.99,
    installments: 12,
    currentInstallment: 3,
    installmentAmount: 7499.99,
    category: "Electrónicos",
    period: "Enero 2024",
  },
  // Diciembre 2023
  {
    id: 3,
    date: "2023-12-20",
    merchant: "Farmacia Salud",
    totalAmount: 15600.0,
    installments: 3,
    currentInstallment: 2,
    installmentAmount: 5200.0,
    category: "Salud",
    period: "Diciembre 2023",
  },
  {
    id: 4,
    date: "2023-12-22",
    merchant: "Restaurante Gourmet",
    totalAmount: 12400.0,
    installments: 1,
    currentInstallment: 1,
    installmentAmount: 12400.0,
    category: "Restaurantes",
    period: "Diciembre 2023",
  },
  // Noviembre 2023
  {
    id: 5,
    date: "2023-11-10",
    merchant: "Tienda de Ropa",
    totalAmount: 45000.0,
    installments: 6,
    currentInstallment: 1,
    installmentAmount: 7500.0,
    category: "Ropa",
    period: "Noviembre 2023",
  },
  {
    id: 6,
    date: "2023-11-25",
    merchant: "Combustible YPF",
    totalAmount: 18000.0,
    installments: 1,
    currentInstallment: 1,
    installmentAmount: 18000.0,
    category: "Combustible",
    period: "Noviembre 2023",
  },
]

const projectionData = [
  { month: "Feb 2024", amount: 45230 },
  { month: "Mar 2024", amount: 38450 },
  { month: "Abr 2024", amount: 31670 },
  { month: "May 2024", amount: 24890 },
  { month: "Jun 2024", amount: 18110 },
  { month: "Jul 2024", amount: 11330 },
]

export default function DashboardPage() {
  const [filterCategory, setFilterCategory] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [filterPeriod, setFilterPeriod] = useState("all")

  const filteredExpenses = expensesData.filter((expense) => {
    const matchesCategory = filterCategory === "all" || expense.category === filterCategory
    const matchesPeriod = filterPeriod === "all" || expense.period === filterPeriod
    const matchesSearch = expense.merchant.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesPeriod && matchesSearch
  })

  // Obtener períodos únicos para el filtro
  const uniquePeriods = [...new Set(expensesData.map((expense) => expense.period))]

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(amount)
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Volver
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
                <p className="text-sm text-slate-600">Resumen procesado - Enero 2024</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Link href="/profile">
                <Button variant="outline" size="sm">
                  Perfil
                </Button>
              </Link>
              <Link href="/help">
                <Button variant="outline" size="sm">
                  Ayuda
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Summary Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Gastado</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{formatCurrency(summaryData.totalSpent)}</div>
              <p className="text-xs text-muted-foreground">{summaryData.processedFiles} resúmenes procesados</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total a Pagar</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{formatCurrency(summaryData.totalToPay)}</div>
              <p className="text-xs text-muted-foreground">Próximo vencimiento</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cuotas Activas</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{summaryData.activeInstallments}</div>
              <p className="text-xs text-muted-foreground">Cuotas pendientes de pago</p>
            </CardContent>
          </Card>
        </div>

        {/* Expenses Table */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div>
                <CardTitle>Detalle de Gastos</CardTitle>
                <CardDescription>Lista completa de transacciones extraídas del resumen</CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                <Input
                  placeholder="Buscar comercio..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full sm:w-64"
                />
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="w-full sm:w-48">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filtrar por categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las categorías</SelectItem>
                    <SelectItem value="Alimentación">Alimentación</SelectItem>
                    <SelectItem value="Electrónicos">Electrónicos</SelectItem>
                    <SelectItem value="Salud">Salud</SelectItem>
                    <SelectItem value="Restaurantes">Restaurantes</SelectItem>
                    <SelectItem value="Ropa">Ropa</SelectItem>
                    <SelectItem value="Combustible">Combustible</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterPeriod} onValueChange={setFilterPeriod}>
                  <SelectTrigger className="w-full sm:w-48">
                    <Calendar className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filtrar por período" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los períodos</SelectItem>
                    {uniquePeriods.map((period) => (
                      <SelectItem key={period} value={period}>
                        {period}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Comercio</TableHead>
                    <TableHead>Período</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead className="text-right">Monto Total</TableHead>
                    <TableHead className="text-center">Cuotas</TableHead>
                    <TableHead className="text-right">Cuota Actual</TableHead>
                    <TableHead className="text-center">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredExpenses.map((expense) => (
                    <TableRow key={expense.id}>
                      <TableCell className="font-medium">
                        {new Date(expense.date).toLocaleDateString("es-AR")}
                      </TableCell>
                      <TableCell>{expense.merchant}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {expense.period}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{expense.category}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(expense.totalAmount)}</TableCell>
                      <TableCell className="text-center">
                        {expense.installments > 1 ? (
                          <Badge variant="outline">
                            {expense.currentInstallment}/{expense.installments}
                          </Badge>
                        ) : (
                          <Badge>Contado</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">{formatCurrency(expense.installmentAmount)}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center space-x-1">
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                            <Trash2 className="h-4 w-4" />
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

        {/* Projection Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Proyección de Pagos Mensuales</CardTitle>
            <CardDescription>Estimación de pagos futuros basada en cuotas activas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={projectionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                  <Tooltip
                    formatter={(value: number) => [formatCurrency(value), "Monto a pagar"]}
                    labelStyle={{ color: "#374151" }}
                  />
                  <Bar dataKey="amount" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
