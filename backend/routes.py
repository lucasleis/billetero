from flask import Flask, request, jsonify
import os
import re
import pdfplumber
from datetime import datetime, timedelta
from werkzeug.utils import secure_filename


app = Flask(__name__)


### Configuraciones de seguridad ###
app.config['MAX_CONTENT_LENGTH'] = 5 * 1024 * 1024  # Limitar tamaño a 5MB


### Funciones Auxiliares ###

def extract_text_from_pdf(pdf_file):
    import pdfplumber
    texto_completo = ""
    with pdfplumber.open(pdf_file) as pdf:
        for page in pdf.pages:
            texto_completo += page.extract_text() + "\n"
    return texto_completo

def detectar_cuotas(descripcion):
    cuotas_patron = re.search(r'(\d{2})/(\d{2})', descripcion)
    if cuotas_patron:
        actual, total = cuotas_patron.groups()
        return int(total), int(actual)
    return 1, 1

def limpiar_merchant(descripcion):
    return descripcion.split(' ')[0]  # Ejemplo simplificado

def categorizar_gasto(merchant):
    categorias = {
        "RACING": "Entretenimiento",
        "HUSH": "Ropa",
        "WWW.AEROLINEAS.COM.AR": "Viajes",
        "MERPAGO": "E-commerce",
    }
    for clave, categoria in categorias.items():
        if clave in merchant:
            return categoria
    return "Otros"

def convertir_fecha(fecha_str):
    from datetime import datetime
    fecha_str = traducir_mes(fecha_str)
    return datetime.strptime(fecha_str, "%d-%b-%y").strftime("%Y-%m-%d")

def extraer_expenses(texto):
    import re
    expenses = []
    patron = re.compile(r'(\d{2}-[A-Za-z]{3}-\d{2})\s+(.+?)\s+\d{5}\s+([\d\.\,-]+)')
    
    for idx, match in enumerate(patron.finditer(texto), start=1):
        fecha, descripcion, importe_str = match.groups()
        importe = float(importe_str.replace('.', '').replace(',', '.'))
        
        # Procesamos cuota e identificamos el comercio
        installments, current_installment = detectar_cuotas(descripcion)
        merchant = limpiar_merchant(descripcion)
        category = categorizar_gasto(merchant)
        
        expenses.append({
            "id": idx,
            "date": convertir_fecha(fecha),
            "merchant": merchant,
            "totalAmount": importe,
            "installments": installments,
            "currentInstallment": current_installment,
            "installmentAmount": round(importe / installments, 2) if installments > 1 else importe,
            "category": category,
            "period": obtener_periodo(fecha),
        })

    return expenses

def traducir_mes(fecha_str):
    meses = {
        'Ene': 'Jan', 'Feb': 'Feb', 'Mar': 'Mar', 'Abr': 'Apr',
        'May': 'May', 'Jun': 'Jun', 'Jul': 'Jul', 'Ago': 'Aug',
        'Sep': 'Sep', 'Oct': 'Oct', 'Nov': 'Nov', 'Dic': 'Dec'
    }
    for esp, eng in meses.items():
        if esp in fecha_str:
            return fecha_str.replace(esp, eng)
    return fecha_str

def obtener_periodo(fecha_str):
    from datetime import datetime
    fecha_str = traducir_mes(fecha_str)
    fecha = datetime.strptime(fecha_str, "%d-%b-%y")
    return fecha.strftime("%B %Y")

def calcular_summary(expenses):
    total_spent = sum(e['totalAmount'] for e in expenses)
    total_to_pay = sum(e['installmentAmount'] for e in expenses if e['installments'] > 1)
    active_installments = sum(1 for e in expenses if e['installments'] > 1)
    
    return {
        "totalSpent": round(total_spent, 2),
        "totalToPay": round(total_to_pay, 2),
        "activeInstallments": active_installments,
        "processedFiles": 1  # Si procesás uno solo; sino pasá el count
    }

def extraer_projection(texto):
    projection = []
    
    # Buscar línea que empieza con "Cuotas a vencer"
    cuotas_vencer_match = re.search(r'Cuotas a vencer\s+([^\n]+)', texto)
    if not cuotas_vencer_match:
        return projection  # No se encontró sección

    meses_linea = cuotas_vencer_match.group(1).strip()

    # Buscar línea siguiente que contenga montos
    montos_match = re.search(r'Cuotas a vencer[^\n]+\n\s*(\$[^\n]+)', texto)
    if not montos_match:
        return projection

    montos_linea = montos_match.group(1).strip()

    # Extraer nombres de meses con año abreviado
    meses = re.findall(r'([A-Za-z]+-\d{2})', meses_linea)

    # Extraer montos en formato "$ numero"
    montos = re.findall(r'\$\s*-?[\d\.\s]*\d+,\d{2}', montos_linea)

    for i, mes in enumerate(meses):
        if i < len(montos):
            monto = montos[i]
            monto = monto.replace('$', '').replace(' ', '').replace('.', '').replace(',', '.')
            projection.append({
                "month": mes,
                "amount": round(float(monto), 2)
            })

    return projection

def procesar_pdf(pdf_file):
    texto = extract_text_from_pdf(pdf_file)
    
    expenses = extraer_expenses(texto)
    summary = calcular_summary(expenses)
    projection = extraer_projection(texto)

    return {
        "summaryData": summary,
        "expensesData": expenses,
        "projectionData": projection
    }



### Routes ###

@app.route('/procesar_resumen', methods=['POST'])
def procesar_resumen():
    if 'file' not in request.files:
        return jsonify({"error": "No se envió archivo"}), 400

    file = request.files['file']
    resultado = procesar_pdf(file)
    return jsonify(resultado)




if __name__ == '__main__':
    app.run(debug=True)














