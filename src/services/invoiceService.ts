/**
 * Invoice Service - Generación de Comprobantes PDF
 * Para órdenes procesadas por Wompi
 */

import { jsPDF } from 'jspdf';

// ============================================================
// TYPES
// ============================================================

export interface InvoiceCustomer {
    fullName: string;
    email: string;
    phone: string;
    city: string;
    address: string;
}

export interface InvoiceItem {
    name: string;
    quantity: number;
    price: number;
}

export interface InvoiceData {
    orderReference: string;
    orderDate: Date;
    customer: InvoiceCustomer;
    items: InvoiceItem[];
    subtotal: number;
    shipping: number;
    total: number;
    wompiTransactionId?: string;
    paymentMethod?: string;
}

// ============================================================
// PDF GENERATION
// ============================================================

/**
 * Genera un comprobante de compra en formato PDF
 * NO es una factura fiscal válida ante DIAN
 */
export const generateInvoicePDF = (data: InvoiceData): jsPDF => {
    const doc = new jsPDF();

    // Configuración
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    let yPosition = 20;

    // ============================================================
    // HEADER - Logo y Título
    // ============================================================

    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(212, 225, 87); // Amarillo brand
    doc.text('FILTROS Y LUBRICANTES', pageWidth / 2, yPosition, { align: 'center' });

    yPosition += 8;
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text('del Llano S.A.S.', pageWidth / 2, yPosition, { align: 'center' });

    yPosition += 15;

    // ============================================================
    // DISCLAIMER - No válido como factura
    // ============================================================

    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(200, 50, 50); // Rojo
    doc.text('COMPROBANTE DE COMPRA', pageWidth / 2, yPosition, { align: 'center' });

    yPosition += 5;
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('(Este documento NO es una factura fiscal válida ante DIAN)', pageWidth / 2, yPosition, { align: 'center' });

    yPosition += 15;

    // ============================================================
    // INFORMACIÓN DE LA ORDEN
    // ============================================================

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('INFORMACIÓN DE LA ORDEN', margin, yPosition);

    yPosition += 7;

    // Línea separadora
    doc.setDrawColor(212, 225, 87);
    doc.setLineWidth(0.5);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);

    yPosition += 8;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);

    doc.text(`Orden:`, margin, yPosition);
    doc.setFont('helvetica', 'bold');
    doc.text(data.orderReference, margin + 40, yPosition);

    yPosition += 6;

    doc.setFont('helvetica', 'normal');
    doc.text(`Fecha:`, margin, yPosition);
    doc.setFont('helvetica', 'bold');
    doc.text(data.orderDate.toLocaleDateString('es-CO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }), margin + 40, yPosition);

    if (data.wompiTransactionId) {
        yPosition += 6;
        doc.setFont('helvetica', 'normal');
        doc.text(`ID Wompi:`, margin, yPosition);
        doc.setFont('helvetica', 'bold');
        doc.text(data.wompiTransactionId, margin + 40, yPosition);
    }

    yPosition += 15;

    // ============================================================
    // DATOS DEL CLIENTE
    // ============================================================

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('DATOS DEL CLIENTE', margin, yPosition);

    yPosition += 7;

    doc.setDrawColor(212, 225, 87);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);

    yPosition += 8;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);

    doc.text(`Nombre:`, margin, yPosition);
    doc.setFont('helvetica', 'bold');
    doc.text(data.customer.fullName, margin + 40, yPosition);

    yPosition += 6;

    doc.setFont('helvetica', 'normal');
    doc.text(`Email:`, margin, yPosition);
    doc.setFont('helvetica', 'bold');
    doc.text(data.customer.email, margin + 40, yPosition);

    yPosition += 6;

    doc.setFont('helvetica', 'normal');
    doc.text(`Teléfono:`, margin, yPosition);
    doc.setFont('helvetica', 'bold');
    doc.text(data.customer.phone, margin + 40, yPosition);

    yPosition += 6;

    doc.setFont('helvetica', 'normal');
    doc.text(`Ciudad:`, margin, yPosition);
    doc.setFont('helvetica', 'bold');
    doc.text(data.customer.city, margin + 40, yPosition);

    yPosition += 6;

    doc.setFont('helvetica', 'normal');
    doc.text(`Dirección:`, margin, yPosition);
    doc.setFont('helvetica', 'bold');
    const addressLines = doc.splitTextToSize(data.customer.address, pageWidth - margin - 60);
    doc.text(addressLines, margin + 40, yPosition);
    yPosition += addressLines.length * 5;

    yPosition += 15;

    // ============================================================
    // PRODUCTOS
    // ============================================================

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('PRODUCTOS', margin, yPosition);

    yPosition += 7;

    doc.setDrawColor(212, 225, 87);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);

    yPosition += 8;

    // Header de tabla
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Cant.', margin, yPosition);
    doc.text('Descripción', margin + 15, yPosition);
    doc.text('Precio Unit.', pageWidth - 70, yPosition);
    doc.text('Total', pageWidth - margin - 10, yPosition, { align: 'right' });

    yPosition += 6;

    // Items
    doc.setFont('helvetica', 'normal');
    data.items.forEach((item) => {
        const itemTotal = item.quantity * item.price;

        doc.text(item.quantity.toString(), margin, yPosition);

        // Descripción con wrapping
        const descLines = doc.splitTextToSize(item.name, 85);
        doc.text(descLines, margin + 15, yPosition);

        doc.text(`$${item.price.toLocaleString('es-CO')}`, pageWidth - 70, yPosition);
        doc.text(`$${itemTotal.toLocaleString('es-CO')}`, pageWidth - margin - 10, yPosition, { align: 'right' });

        yPosition += descLines.length * 5 + 2;
    });

    yPosition += 10;

    // ============================================================
    // TOTALES
    // ============================================================

    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.line(pageWidth - 80, yPosition, pageWidth - margin, yPosition);

    yPosition += 7;

    doc.setFont('helvetica', 'normal');
    doc.text('Subtotal:', pageWidth - 80, yPosition);
    doc.text(`$${data.subtotal.toLocaleString('es-CO')} COP`, pageWidth - margin - 10, yPosition, { align: 'right' });

    yPosition += 6;

    doc.text('Envío:', pageWidth - 80, yPosition);
    doc.text(`$${data.shipping.toLocaleString('es-CO')} COP`, pageWidth - margin - 10, yPosition, { align: 'right' });

    yPosition += 8;

    doc.setDrawColor(212, 225, 87);
    doc.setLineWidth(0.5);
    doc.line(pageWidth - 80, yPosition, pageWidth - margin, yPosition);

    yPosition += 7;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('TOTAL:', pageWidth - 80, yPosition);
    doc.text(`$${data.total.toLocaleString('es-CO')} COP`, pageWidth - margin - 10, yPosition, { align: 'right' });

    yPosition += 15;

    // ============================================================
    // MÉTODO DE PAGO
    // ============================================================

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 128, 0);
    doc.text('✓ Pago procesado exitosamente por Wompi', margin, yPosition);

    yPosition += 6;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    if (data.paymentMethod) {
        doc.text(`Método: ${data.paymentMethod}`, margin, yPosition);
    }

    // ============================================================
    // FOOTER
    // ============================================================

    const footerY = doc.internal.pageSize.getHeight() - 30;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('Filtros y Lubricantes del Llano S.A.S.', margin, footerY);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text('Carrera 10 #15-03, Puerto Gaitán, Meta', margin, footerY + 5);
    doc.text('Tel: +57 314 393 0345', margin, footerY + 10);
    doc.text('info@filtrosylubricantes.co', margin, footerY + 15);

    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    doc.text('Gracias por su compra', pageWidth / 2, footerY + 20, { align: 'center' });

    return doc;
};

/**
 * Descarga el PDF inmediatamente
 */
export const downloadInvoice = (data: InvoiceData): void => {
    const pdf = generateInvoicePDF(data);
    const filename = `Comprobante_${data.orderReference}.pdf`;
    pdf.save(filename);
};

/**
 * Genera el PDF y lo retorna como Blob para envío por email
 */
export const getInvoiceBlob = (data: InvoiceData): Blob => {
    const pdf = generateInvoicePDF(data);
    return pdf.output('blob');
};

/**
 * Abre el PDF en una nueva ventana para preview
 */
export const previewInvoice = (data: InvoiceData): void => {
    const pdf = generateInvoicePDF(data);
    const pdfUrl = pdf.output('bloburl');
    window.open(pdfUrl.toString(), '_blank');
};

export default {
    generateInvoicePDF,
    downloadInvoice,
    getInvoiceBlob,
    previewInvoice
};
