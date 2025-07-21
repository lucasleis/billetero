"use client"

import { ArrowLeft, HelpCircle, FileText, BarChart3, CreditCard, AlertCircle } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function HelpPage() {
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
              <h1 className="text-2xl font-bold text-slate-800">Centro de Ayuda</h1>
              <p className="text-sm text-slate-600">Aprende a usar Desglose de Tarjetas</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Quick Start Guide */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <HelpCircle className="h-5 w-5 mr-2" />
              Guía de Inicio Rápido
            </CardTitle>
            <CardDescription>Sigue estos pasos para comenzar a analizar tus resúmenes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2">1. Sube tu PDF</h3>
                <p className="text-sm text-slate-600">Selecciona el archivo PDF de tu resumen de tarjeta de crédito</p>
              </div>

              <div className="text-center">
                <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold mb-2">2. Revisa el Dashboard</h3>
                <p className="text-sm text-slate-600">
                  Analiza tus gastos, cuotas y proyecciones en el panel principal
                </p>
              </div>

              <div className="text-center">
                <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <CreditCard className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-2">3. Gestiona tus Datos</h3>
                <p className="text-sm text-slate-600">Edita, filtra y exporta la información según tus necesidades</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* FAQ Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Preguntas Frecuentes</CardTitle>
            <CardDescription>Respuestas a las consultas más comunes</CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>¿Qué formatos de archivo son compatibles?</AccordionTrigger>
                <AccordionContent>
                  Actualmente soportamos archivos PDF de resúmenes de tarjeta de crédito. El archivo debe tener un
                  tamaño máximo de 10MB y contener texto legible (no imágenes escaneadas).
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2">
                <AccordionTrigger>¿Cómo interpreto las tarjetas del dashboard?</AccordionTrigger>
                <AccordionContent>
                  <ul className="list-disc list-inside space-y-2">
                    <li>
                      <strong>Total Gastado:</strong> Suma de todas las compras del período
                    </li>
                    <li>
                      <strong>Total a Pagar:</strong> Monto que debes abonar en el próximo vencimiento
                    </li>
                    <li>
                      <strong>Cuotas Activas:</strong> Cantidad de cuotas pendientes de todos tus financiamientos
                    </li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3">
                <AccordionTrigger>¿Qué significa la proyección de pagos?</AccordionTrigger>
                <AccordionContent>
                  El gráfico de proyección muestra una estimación de cuánto deberás pagar en los próximos meses
                  basándose en las cuotas activas. Esto te ayuda a planificar tu presupuesto futuro.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4">
                <AccordionTrigger>¿Puedo editar o eliminar transacciones?</AccordionTrigger>
                <AccordionContent>
                  Sí, puedes editar o eliminar transacciones usando los botones de acción en la tabla de gastos. Esto es
                  útil para corregir errores de procesamiento o agregar información adicional.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5">
                <AccordionTrigger>¿Los datos se guardan de forma segura?</AccordionTrigger>
                <AccordionContent>
                  Todos tus datos se procesan de forma local y segura. No almacenamos información sensible en servidores
                  externos. Tu privacidad financiera es nuestra prioridad.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-6">
                <AccordionTrigger>¿Cómo exporto mis datos?</AccordionTrigger>
                <AccordionContent>
                  Puedes exportar tus datos usando los botones "Exportar" disponibles en el dashboard y en la sección de
                  perfil. Los datos se descargan en formato CSV para usar en Excel u otras aplicaciones.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        {/* Tips Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Consejos para Mejores Resultados</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Calidad del PDF:</strong> Asegúrate de que el PDF sea de buena calidad y que el texto sea
                legible. Los archivos escaneados pueden tener menor precisión.
              </AlertDescription>
            </Alert>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Revisión Manual:</strong> Siempre revisa los datos extraídos y corrige cualquier error usando
                las opciones de edición disponibles.
              </AlertDescription>
            </Alert>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Organización:</strong> Procesa tus resúmenes mensualmente para mantener un seguimiento constante
                de tus finanzas.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Contact Section */}
        <Card>
          <CardHeader>
            <CardTitle>¿Necesitas más ayuda?</CardTitle>
            <CardDescription>Si no encuentras la respuesta que buscas, contáctanos</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-slate-600 mb-4">
              Nuestro equipo de soporte está disponible para ayudarte con cualquier consulta.
            </p>
            <Button>Contactar Soporte</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
