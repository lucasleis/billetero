from flask import Flask, request, jsonify
import re
import pdfplumber
from datetime import datetime

app = Flask(__name__)

app.config['MAX_CONTENT_LENGTH'] = 5 * 1024 * 1024  # Limitar a 5MB

MESES_ESP_ING = {
    'Ene': 'Jan', 'Feb': 'Feb', 'Mar': 'Mar', 'Abr': 'Apr',
    'May': 'May', 'Jun': 'Jun', 'Jul': 'Jul', 'Ago': 'Aug',
    'Sep': 'Sep', 'Set': 'Sep', 'Oct': 'Oct', 'Nov': 'Nov', 'Dic': 'Dec',
    'Enero': 'January', 'Febrero': 'February', 'Marzo': 'March',
    'Abril': 'April', 'Mayo': 'May', 'Junio': 'June',
    'Julio': 'July', 'Agosto': 'August', 'Septiembre': 'September',
    'Setiembre': 'September', 'Octubre': 'October',
    'Noviembre': 'November', 'Diciembre': 'December'
}

def detectar_banco(texto):
    if "Banco de la Nación Argentina" in texto or "Banco Nación" in texto:
        return "NACION"
    elif "Banco Galicia" in texto or "Resumen de tarjeta de credito VISA" in texto or "bancogalicia.com" in texto:
        return "GALICIA"
    return "DESCONOCIDO"

def detectar_tipo_tarjeta(texto):
    if "VISA" in texto:
        return 'VISA'
    elif "Mastercard" in texto:
        return 'MASTERCARD'
    return 'DESCONOCIDO'

def traducir_mes(fecha_str):
    for esp, eng in MESES_ESP_ING.items():
        if esp in fecha_str:
            return fecha_str.replace(esp, eng)
    return fecha_str

def convertir_fecha(fecha_str, formato_origen):
    fecha_str = traducir_mes(fecha_str)
    fecha = datetime.strptime(fecha_str, formato_origen)
    return fecha.strftime("%Y-%m-%d")

def obtener_periodo(fecha_str, formato_origen):
    fecha_str = traducir_mes(fecha_str)
    fecha = datetime.strptime(fecha_str, formato_origen)
    return fecha.strftime("%B %Y")

def normalizar_mes(mes_str):
    parts = re.split(r'[-/]', mes_str)
    if len(parts) != 2:
        return mes_str

    mes_nombre, anio_abrev = parts
    mes_nombre = MESES_ESP_ING.get(mes_nombre, mes_nombre)
    anio = '20' + anio_abrev

    return f"{mes_nombre} {anio}"

def extract_text_from_pdf(pdf_file):
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
    return descripcion.split(' ')[0]

def categorizar_gasto(merchant):
    categorias = {
        "RACING": "Racing Club",
        "RACING CLUB ASOCIACION CIVIL": "Entretenimiento",
        "HUSH": "Ropa",
        "WWW.AEROLINEAS.COM.AR": "Viajes",
        "AEROLINEAS.COM.AR": "Viajes",
        "MERPAGO*LACARDEUSE": "Depto",
        "ARREDO": "Depto",
        "MERPAGO": "E-commerce",
        "Spotify": "Servicios",
        "APPLE.COM/BILL": "Servicios",
        "GOOGLE": "Servicios",
    }
    for clave, categoria in categorias.items():
        if clave in merchant:
            return categoria
    return "Otros"



### expenses ###

def extraer_expenses_nacion_mastercard(texto):
    expenses = []
    patron = re.compile(r'(\d{2}-[A-Za-z]{3}-\d{2})\s+(.+?)\s+\d{5}\s+([\d\.,-]+)')
    for idx, match in enumerate(patron.finditer(texto), start=1):
        fecha, descripcion, importe_str = match.groups()
        importe = float(importe_str.replace('.', '').replace(',', '.'))

        installments, current_installment = detectar_cuotas(descripcion)
        merchant = limpiar_merchant(descripcion)
        category = categorizar_gasto(merchant)

        expenses.append({
            "id": idx,
            "date": convertir_fecha(fecha, "%d-%b-%y"),
            "merchant": merchant,
            "totalAmount": importe,
            "installments": installments,
            "currentInstallment": current_installment,
            "installmentAmount": round(importe / installments, 2) if installments > 1 else importe,
            "category": category,
            "period": obtener_periodo(fecha, "%d-%b-%y"),
        })
    return expenses

def extraer_expenses_nacion_visa(texto):
    expenses = []
    regex = re.compile(r'(\d{2}-\d{2}-\d{2})\s+\d{6}\s+(.+?)\s+(?:C\.\d{2}/\d{2}\s+)?([\d\.,]+)')

    for idx, match in enumerate(regex.finditer(texto), start=1):
        fecha, descripcion, importe_str = match.groups()
        importe = float(importe_str.replace('.', '').replace(',', '.').replace('-', ''))

        installments, current_installment = detectar_cuotas(descripcion)
        merchant = limpiar_merchant(descripcion)
        category = categorizar_gasto(merchant)

        expenses.append({
            "id": idx,
            "date": convertir_fecha(fecha, "%d-%m-%y"),
            "merchant": merchant,
            "totalAmount": importe,
            "installments": installments,
            "currentInstallment": current_installment,
            "installmentAmount": round(importe / installments, 2) if installments > 1 else importe,
            "category": category,
            "period": obtener_periodo(fecha, "%d-%m-%y"),
        })
    return expenses

def extraer_expenses_galicia_visa(texto):
    expenses = []
    # Buscar solo las líneas de consumo con cuota: 06/06, etc
    regex_consumos = re.compile(
        r'(\d{2}-\d{2}-\d{2})\s+\*\s+(.+?)\s+(\d{2}/\d{2})\s+\d+\s+([\d\.\,]+)'
    )

    for idx, match in enumerate(regex_consumos.finditer(texto), start=1):
        fecha, descripcion, cuotas, importe_str = match.groups()
        importe = float(importe_str.replace('.', '').replace(',', '.'))
        installments, current_installment = map(int, cuotas.split('/'))
        merchant = limpiar_merchant(descripcion)
        category = categorizar_gasto(merchant)

        expenses.append({
            "id": idx,
            "date": convertir_fecha(fecha, "%d-%m-%y"),
            "merchant": merchant,
            "totalAmount": importe,
            "installments": installments,
            "currentInstallment": current_installment,
            "installmentAmount": round(importe / installments, 2) if installments > 1 else importe,
            "category": category,
            "period": obtener_periodo(fecha, "%d-%m-%y"),
        })

    return expenses

def extraer_expenses_galicia_mastercard(texto):
    expenses = []
    regex = re.compile(
        r'(\d{2}-[A-Za-z]{3}-\d{2})\s+(.+?)\s+\d{5}\s+([\d\.,]+)'
    )

    for idx, match in enumerate(regex.finditer(texto), start=1):
        fecha, descripcion, importe_str = match.groups()
        importe = float(importe_str.replace('.', '').replace(',', '.'))

        installments, current_installment = detectar_cuotas(descripcion)
        merchant = limpiar_merchant(descripcion)
        category = categorizar_gasto(merchant)

        expenses.append({
            "id": idx,
            "date": convertir_fecha(fecha, "%d-%b-%y"),
            "merchant": merchant,
            "totalAmount": importe,
            "installments": installments,
            "currentInstallment": current_installment,
            "installmentAmount": round(importe / installments, 2) if installments > 1 else importe,
            "category": category,
            "period": obtener_periodo(fecha, "%d-%b-%y"),
        })

    return expenses


### projection ###

def extraer_projection(texto):
    projection = []
    lines = texto.splitlines()

    for i, line in enumerate(lines):
        if 'Cuotas a vencer' in line:
            mastercard_meses = re.findall(r'([A-Za-z]+-\d{2})', line)
            if mastercard_meses:
                if i + 1 < len(lines):
                    projection = parsear_projection_mastercard(mastercard_meses, lines[i + 1])
                break
            else:
                if i + 1 < len(lines):
                    meses_line = lines[i + 1].replace('Setiembre', 'Septiembre')
                    if i + 2 < len(lines):
                        projection = parsear_projection_visa(meses_line, lines[i + 2])
                    if i + 3 < len(lines) and 'A partir de' in lines[i + 3]:
                        adicional = parsear_projection_visa_adicional(lines[i + 3])
                        if adicional:
                            projection.append(adicional)
                break
    return projection

def parsear_projection_mastercard(meses, montos_line):
    projection = []
    montos = re.findall(r'\$\s*-?[\d\.\s]*\d+,\d{2}', montos_line)
    for i, mes in enumerate(meses):
        if i < len(montos):
            monto = montos[i].replace('$', '').replace(' ', '').replace('.', '').replace(',', '.')
            projection.append({"month": normalizar_mes(mes), "amount": round(float(monto), 2)})
    return projection

def parsear_projection_visa(meses_line, montos_line):
    projection = []
    meses = re.findall(r'([A-Za-z]+/\d{2})', meses_line)
    montos = re.findall(r'\$[\s-]*[\d\.,]+', montos_line)
    for i, mes in enumerate(meses):
        if i < len(montos):
            monto = montos[i].replace('$', '').replace(' ', '').replace('.', '').replace(',', '.')
            projection.append({"month": normalizar_mes(mes), "amount": round(float(monto), 2)})
    return projection

def parsear_projection_visa_adicional(line):
    match = re.search(r'A partir de\s+(\w+/\d{2})\s+\$([\d\.,]+)', line)
    if match:
        mes, monto = match.groups()
        monto = monto.replace('.', '').replace(',', '.')
        return {"month": normalizar_mes(mes), "amount": round(float(monto), 2)}
    return None

def extraer_projection_galicia_master(texto):
    projection = []
    lines = texto.splitlines()

    for i, line in enumerate(lines):
        if "Cuotas a vencer" in line:
            if i + 1 < len(lines):
                meses_line = lines[i + 1]
                montos_line = lines[i + 2] if i + 2 < len(lines) else ""

                meses = re.findall(r'([A-Za-z]+-\d{2})', meses_line)
                montos = re.findall(r'\$[\s]*[\d\.,]+', montos_line)

                for mes, monto in zip(meses, montos):
                    monto = monto.replace('$', '').replace(' ', '').replace('.', '').replace(',', '.')
                    projection.append({
                        "month": mes,
                        "amount": round(float(monto), 2)
                    })
            break

    return projection


### summary ####

def extraer_summary_nacion_mastercard(texto):
    saldo_actual = None
    pago_minimo = None

    # Buscar "Saldo actual" con formato con coma decimal
    match_saldo = re.search(r'SALDO ACTUAL\s+([\d\.,]+)', texto)
    if match_saldo:
        saldo_actual = float(match_saldo.group(1).replace('.', '').replace(',', '.'))

    # Buscar "Pago mínimo" con formato con coma decimal
    match_pago = re.search(r'Pago M[ií]nimo:\s+\$\s*([\d\.,]+)', texto)
    if not match_pago:
        # Alternativa en caso de que no tenga el formato con "$"
        match_pago = re.search(r'PAGO MINIMO\s+([\d\.,]+)', texto)

    if match_pago:
        pago_minimo = float(match_pago.group(1).replace('.', '').replace(',', '.'))

    return {
        "total_pesos": saldo_actual or 0,
        "total_dolares": 0
    }

def extraer_summary_nacion_visa(texto):
    saldo_actual = None
    pago_minimo = None

    # Buscar el SALDO ACTUAL
    match_saldo = re.search(r'SALDO ACTUAL:\s*\$\s*([\d\.,]+)', texto)
    if match_saldo:
        saldo_actual = float(match_saldo.group(1).replace('.', '').replace(',', '.'))

    # Buscar el PAGO MINIMO
    match_pago = re.search(r'PAGO M[ÍI]NIMO:\s*\$\s*([\d\.,]+)', texto)
    if match_pago:
        pago_minimo = float(match_pago.group(1).replace('.', '').replace(',', '.'))
    else:
        # Alternativa: PAGO MINIMO en otra sección (sin $)
        match_pago_alt = re.search(r'PAGO MINIMO\s+([\d\.,]+)', texto)
        if match_pago_alt:
            pago_minimo = float(match_pago_alt.group(1).replace('.', '').replace(',', '.'))

    return {
        "total_pesos": saldo_actual or 0,
        "total_dolares": 0
    }

def extraer_summary_galicia(texto):
    total_pesos = None
    total_dolares = None

    # Buscar línea que contenga TOTAL A PAGAR seguido de ambos valores
    match = re.search(r'TOTAL A PAGAR\s+([\d\.\,]+)\s+([\d\.\,]+)', texto)
    if match:
        total_pesos = float(match.group(1).replace('.', '').replace(',', '.'))
        total_dolares = float(match.group(2).replace('.', '').replace(',', '.'))

    return {
        "total_pesos": total_pesos,
        "total_dolares": total_dolares
    }


def merge_projections(projections):
    from collections import defaultdict

    acumulado = defaultdict(float)
    for proyeccion in projections:
        if not isinstance(proyeccion, list):
            continue
        for p in proyeccion:
            if isinstance(p, dict) and 'month' in p and 'amount' in p:
                acumulado[p['month']] += p['amount']
    return [{"month": mes, "amount": round(monto, 2)} for mes, monto in sorted(acumulado.items())]


def calcular_summary(expenses):
    total_spent = sum(e['totalAmount'] for e in expenses)
    total_to_pay = sum(e['installmentAmount'] for e in expenses if e['installments'] > 1)
    active_installments = sum(1 for e in expenses if e['installments'] > 1)

    return {
        "totalSpent": round(total_spent, 2),
        "totalToPay": round(total_to_pay, 2),
        "activeInstallments": active_installments,
        "processedFiles": 1
    }



def procesar_pdf(pdf_file):
    texto = extract_text_from_pdf(pdf_file)
    tipo_tarjeta = detectar_tipo_tarjeta(texto)
    banco = detectar_banco(texto)

    if banco == 'GALICIA' and tipo_tarjeta == 'VISA':
        print(f"Banco: {banco} VISA")
        expenses = extraer_expenses_galicia_visa(texto)
        summary  = extraer_summary_galicia(texto)
        projection = extraer_projection(texto)
        # print(summary)

    elif banco == 'GALICIA' and tipo_tarjeta == 'MASTERCARD':
        print(f"Banco: {banco} MASTER ")
        expenses = extraer_expenses_galicia_mastercard(texto)
        summary  = extraer_summary_galicia(texto)
        projection = extraer_projection_galicia_master(texto)
        # print(summary)
        
    elif tipo_tarjeta == 'VISA':
        print(f"Banco: {banco} VISA ")
        expenses = extraer_expenses_nacion_visa(texto)
        projection = extraer_projection(texto)
        summary  = extraer_summary_nacion_visa(texto)
        # print(summary)

    else:
        print(f"Banco: {banco} MASTER ")
        expenses = extraer_expenses_nacion_mastercard(texto)
        projection = extraer_projection(texto)
        summary  = extraer_summary_nacion_mastercard(texto)
        # print(summary)

    # summary = calcular_summary(expenses)

    return {
        "summaryData": summary,
        "expensesData": expenses,
        "projectionData": projection
    }



@app.route('/procesar_resumen', methods=['POST'])
def procesar_resumen():
    if 'files' not in request.files:
        return jsonify({"error": "No se enviaron archivos"}), 400

    files = request.files.getlist('files')
    if not files:
        return jsonify({"error": "La lista de archivos está vacía"}), 400

    all_expenses, all_projections = [], []
    total_pesos, total_dolares = 0, 0
    total_processed_files = 0

    for file in files:
        if file.filename == '' or not file.filename.endswith('.pdf'):
            continue

        resultado = procesar_pdf(file)

        # Acumulamos pesos y dólares del resumen
        resumen = resultado.get('summaryData', {})
        total_pesos += resumen.get('total_pesos', 0) or 0
        total_dolares += resumen.get('total_dolares', 0) or 0

        all_expenses.extend(resultado.get('expensesData', []))
        all_projections.append(resultado.get('projectionData'))
        total_processed_files += 1

    return jsonify({
        "summaryData": {
            "total_pesos": round(total_pesos, 2),
            "total_dolares": round(total_dolares, 2)
        },
        "expensesData": all_expenses,
        "projectionData": merge_projections(all_projections)
    })


if __name__ == '__main__':
    app.run(debug=True)
