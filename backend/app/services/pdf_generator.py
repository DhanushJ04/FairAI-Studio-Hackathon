import os
from app.config import REPORTS_DIR

def generate_pdf_report(report_id: str, data: dict) -> str:
    """Generates a PDF report and returns its file path."""
    try:
        from reportlab.lib.pagesizes import letter
        from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
        from reportlab.lib.styles import getSampleStyleSheet
        from reportlab.lib import colors
    except ImportError:
        print("ReportLab is not installed, returning dummy path.")
        # Create a dummy file
        filename = f"report_{report_id}.pdf"
        filepath = os.path.join(REPORTS_DIR, filename)
        with open(filepath, "w") as f: f.write("dummy pdf")
        return filepath
    filename = f"report_{report_id}.pdf"
    filepath = os.path.join(REPORTS_DIR, filename)
    
    doc = SimpleDocTemplate(filepath, pagesize=letter)
    styles = getSampleStyleSheet()
    Story = []
    
    # Title
    Story.append(Paragraph(f"AI Bias Audit Report", styles['Title']))
    Story.append(Spacer(1, 12))
    
    # General Info
    Story.append(Paragraph(f"<b>Dataset:</b> {data.get('filename', 'Unknown')}", styles['Normal']))
    Story.append(Paragraph(f"<b>Target Column:</b> {data.get('target_column', 'Unknown')}", styles['Normal']))
    Story.append(Paragraph(f"<b>Sensitive Attributes:</b> {', '.join(data.get('sensitive_attributes', []))}", styles['Normal']))
    Story.append(Paragraph(f"<b>Overall Fairness Score (Accuracy):</b> {data.get('overall_fairness_score', 'N/A')}", styles['Normal']))
    Story.append(Spacer(1, 12))
    
    # Bias Metrics Table
    Story.append(Paragraph("Bias Metrics", styles['Heading2']))
    metrics_data = [["Metric", "Value", "Threshold", "Status"]]
    for metric in data.get("metrics", []):
        metrics_data.append([
            metric["name"],
            str(metric["value"]),
            str(metric["threshold"]),
            metric["status"].upper()
        ])
        
    table = Table(metrics_data)
    table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.grey),
        ('TEXTCOLOR', (0,0), (-1,0), colors.whitesmoke),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0,0), (-1,0), 12),
        ('BACKGROUND', (0,1), (-1,-1), colors.beige),
        ('GRID', (0,0), (-1,-1), 1, colors.black)
    ]))
    Story.append(table)
    Story.append(Spacer(1, 12))
    
    # Mitigation Strategies
    Story.append(Paragraph("Recommended Mitigations", styles['Heading2']))
    for strat in data.get("mitigation_strategies", []):
        Story.append(Paragraph(f"<b>{strat['name']}</b> ({strat['category']})", styles['Normal']))
        Story.append(Paragraph(strat['description'], styles['Normal']))
        Story.append(Spacer(0, 5))

    doc.build(Story)
    return filepath
