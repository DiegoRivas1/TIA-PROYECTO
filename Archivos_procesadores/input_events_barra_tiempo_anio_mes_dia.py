import pandas as pd
import matplotlib.pyplot as plt

# Cargar los datos relevantes


# Identificar errores de medicación
medication_errors = inputevents[inputevents['statusdescription'].isin(['ChangeDose/Rate', 'Paused', 'Stopped'])]

# Convertir starttime a formato datetime y luego a solo año, mes, día
inputevents['starttime'] = pd.to_datetime(inputevents['starttime'])


# Filtrar los datos para incluir solo las horas de 8 PM a 6 AM
filtered_data = medication_errors[(inputevents['starttime'].dt.hour >= 20) | (inputevents['starttime'].dt.hour < 6)]
inputevents['starttime'] = inputevents['starttime'].dt.date  # Extraer solo la fecha en formato YYYY-MM-DD
# Combinar con d_items para obtener las categorías
merged_data = pd.merge(filtered_data, d_items[['itemid', 'category']], on='itemid', how='left')

# Seleccionar y renombrar las columnas especificadas
final_data = merged_data[['starttime', 'ordercategoryname', 'category', 'amount']].rename(columns={
    'starttime': 'date',
    'Ordercategoryname': 'name',
    'category': 'category',
    'amount': 'value'
})

# Guardar el resultado combinado en un nuevo archivo CSV
final_data.to_csv('filtered_medication_errors_barra_tiempo.csv', index=False)

# Descargar el archivo a tu PC
from google.colab import files
files.download('filtered_medication_errors_barra_tiempo.csv')

# Crear un gráfico de barras
plt.figure(figsize=(10, 6))
for category, data in final_data.groupby('category'):
    plt.plot(data['date'], [category] * len(data), marker='o', linestyle='', label=category)
plt.title('Categorías de eventos de medicación (8 PM - 6 AM) Entrada')
plt.xlabel('Fecha y hora')
plt.ylabel('Categoría de itemid')
plt.legend()
plt.grid(True)
plt.show()
