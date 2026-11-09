/* ═══════════════════════════════════════════════════════════════
   GarantíasPro — Reclamación en PDF
   Convierte el escrito del generador de reclamaciones en un PDF
   maquetado (A4), listo para enviar o imprimir, con el ticket de
   compra como anexo cuando está disponible.
   jsPDF se carga solo al pulsar el botón (no pesa en el arranque).
   ═══════════════════════════════════════════════════════════════ */
'use strict';

(function () {
  let loading = null;

  function loadJsPDF() {
    if (window.jspdf && window.jspdf.jsPDF) return Promise.resolve(window.jspdf.jsPDF);
    if (loading) return loading;
    loading = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = 'vendor/jspdf.umd.min.js';
      s.async = true;
      s.onload = () => (window.jspdf && window.jspdf.jsPDF) ? resolve(window.jspdf.jsPDF) : reject(new Error('jsPDF no disponible'));
      s.onerror = () => { loading = null; reject(new Error('No se pudo cargar el generador de PDF')); };
      document.head.appendChild(s);
    });
    return loading;
  }

  // Imagen del ticket -> JPEG en data URL (solo imágenes; los PDF no se incrustan)
  function ticketToJpeg(src) {
    return new Promise((resolve) => {
      if (!src || /\.pdf(\?|$)/i.test(src) || /^data:application\/pdf/i.test(src)) return resolve(null);
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          const max = 1600;
          const k = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
          const c = document.createElement('canvas');
          c.width = Math.round(img.naturalWidth * k);
          c.height = Math.round(img.naturalHeight * k);
          const ctx = c.getContext('2d');
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, c.width, c.height);
          ctx.drawImage(img, 0, 0, c.width, c.height);
          resolve({ data: c.toDataURL('image/jpeg', 0.85), w: c.width, h: c.height });
        } catch (e) { resolve(null); }
      };
      img.onerror = () => resolve(null);
      img.src = src;
    });
  }

  function parseLetter(text) {
    const lines = text.split('\n');
    const meta = {};
    let i = 0;
    for (; i < lines.length; i++) {
      const m = lines[i].match(/^(ASUNTO|FECHA|LOCALIZACIÓN|SUBJECT|DATE|LOCATION):\s*(.*)$/);
      if (m) meta[m[1]] = m[2];
      else if (lines[i].trim() === '' && Object.keys(meta).length) { i++; break; }
      else break;
    }
    return { subject: meta.ASUNTO || meta.SUBJECT || '', date: meta.FECHA || meta.DATE || '', place: meta['LOCALIZACIÓN'] || meta.LOCATION || '', body: lines.slice(i).join('\n').trim() };
  }

  const INK = [34, 32, 28], MUTED = [117, 109, 96], CORAL = [217, 83, 58], TEAL = [19, 83, 79], LINE = [227, 213, 191];

  async function generate({ text, product, buyerName, type, lang }) {
    const jsPDF = await loadJsPDF();
    const en = lang === 'en';
    const doc = new jsPDF({ unit: 'mm', format: 'a4', compress: true });
    const W = 210, H = 297, M = 22, CW = W - M * 2;
    const L = parseLetter(text);
    doc.setProperties({ title: L.subject || 'Reclamación', subject: product.name, author: buyerName || '', creator: 'GarantíasPro' });

    // Cabecera
    doc.setFillColor(...CORAL); doc.rect(0, 0, W, 4, 'F');
    doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.setTextColor(...MUTED);
    doc.text((en ? 'CLAIM · ' : 'RECLAMACIÓN · ') + ({ warranty: en ? 'LEGAL WARRANTY' : 'GARANTÍA LEGAL', return: en ? 'RETURN' : 'DEVOLUCIÓN', replacement: en ? 'REPLACEMENT' : 'SUSTITUCIÓN', delay: en ? 'REPAIR DELAY' : 'DEMORA EN REPARACIÓN' }[type] || ''), M, 16);
    doc.setFont('helvetica', 'normal');
    doc.text([L.place, L.date].filter(Boolean).join(', '), W - M, 16, { align: 'right' });

    // Datos del comprador y destinatario
    let y = 28;
    doc.setFontSize(9.5); doc.setTextColor(...MUTED); doc.text(en ? 'From' : 'Remitente', M, y);
    doc.text(en ? 'To' : 'Destinatario', M + CW / 2, y);
    doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.setTextColor(...INK);
    doc.text(doc.splitTextToSize(buyerName || '—', CW / 2 - 6), M, y + 6);
    doc.text(doc.splitTextToSize(product.store || (en ? 'Customer service' : 'Atención al cliente'), CW / 2 - 6), M + CW / 2, y + 6);

    // Ficha del producto
    y += 18;
    doc.setDrawColor(...LINE); doc.setFillColor(251, 245, 236); doc.roundedRect(M, y, CW, 20, 3, 3, 'FD');
    const cell = (label, value, x) => {
      doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(...MUTED); doc.text(label, x, y + 7);
      doc.setFont('helvetica', 'bold'); doc.setFontSize(10.5); doc.setTextColor(...INK);
      doc.text(doc.splitTextToSize(String(value || '—'), CW / 3 - 6)[0], x, y + 14);
    };
    cell(en ? 'Product' : 'Producto', product.name, M + 5);
    cell(en ? 'Purchase date' : 'Fecha de compra', product.purchaseDateFmt, M + 5 + CW / 3);
    cell(en ? 'Amount paid' : 'Importe', product.priceFmt, M + 5 + 2 * CW / 3);

    // Asunto
    y += 30;
    doc.setFont('helvetica', 'bold'); doc.setFontSize(12); doc.setTextColor(...TEAL);
    const subj = doc.splitTextToSize(L.subject, CW);
    doc.text(subj, M, y); y += subj.length * 5.6 + 4;

    // Cuerpo con saltos de página
    doc.setFont('helvetica', 'normal'); doc.setFontSize(10.5); doc.setTextColor(...INK);
    const lh = 5.1;
    const pageBottom = H - 24;
    L.body.split('\n').forEach((para) => {
      const isHeading = /^[A-ZÁÉÍÓÚÑ ,/().:-]{5,}:$/.test(para.trim());
      if (isHeading) { doc.setFont('helvetica', 'bold'); doc.setFontSize(9.5); doc.setTextColor(...TEAL); }
      const wrapped = para.trim() === '' ? [''] : doc.splitTextToSize(para, CW);
      wrapped.forEach((ln) => {
        if (y > pageBottom) { doc.addPage(); doc.setFillColor(...CORAL); doc.rect(0, 0, W, 2, 'F'); y = 22; }
        doc.text(ln, M, y); y += ln === '' ? lh * 0.6 : lh;
      });
      if (isHeading) { doc.setFont('helvetica', 'normal'); doc.setFontSize(10.5); doc.setTextColor(...INK); }
    });

    // Firma
    if (y > pageBottom - 24) { doc.addPage(); y = 30; }
    y += 10;
    doc.setDrawColor(...INK); doc.line(M, y + 12, M + 70, y + 12);
    doc.setFontSize(9); doc.setTextColor(...MUTED); doc.text(en ? 'Signature' : 'Firma', M, y + 17);

    // Anexo: ticket
    let annexNote = '';
    if (product.ticketImage) {
      const img = await ticketToJpeg(product.ticketImage);
      if (img) {
        doc.addPage();
        doc.setFillColor(...CORAL); doc.rect(0, 0, W, 2, 'F');
        doc.setFont('helvetica', 'bold'); doc.setFontSize(12); doc.setTextColor(...TEAL);
        doc.text(en ? 'Annex · Proof of purchase' : 'Anexo · Justificante de compra', M, 22);
        const maxW = CW, maxH = H - 60;
        const k = Math.min(maxW / img.w, maxH / img.h);
        const w = img.w * k, h = img.h * k;
        doc.addImage(img.data, 'JPEG', M + (maxW - w) / 2, 30, w, h);
      } else {
        annexNote = en ? 'The receipt is kept in GarantíasPro; attach it when sending this letter.' : 'El justificante está custodiado en GarantíasPro; adjúntalo al enviar este escrito.';
      }
    }

    // Pie en todas las páginas
    const pages = doc.getNumberOfPages();
    for (let p = 1; p <= pages; p++) {
      doc.setPage(p);
      doc.setDrawColor(...LINE); doc.line(M, H - 16, W - M, H - 16);
      doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5); doc.setTextColor(...MUTED);
      const note = en ? 'Template generated with GarantíasPro. It is guidance, not legal advice.' : 'Modelo generado con GarantíasPro. Es orientativo y no constituye asesoramiento jurídico.';
      doc.text(p === 1 && annexNote ? annexNote : note, M, H - 11);
      doc.text(`${p} / ${pages}`, W - M, H - 11, { align: 'right' });
    }

    const slug = (product.name || 'producto').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    doc.save(`${en ? 'claim' : 'reclamacion'}-${slug}.pdf`);
  }

  window.GPClaimPDF = { generate };
})();
