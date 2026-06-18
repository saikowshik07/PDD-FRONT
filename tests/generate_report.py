import os
import sys
import json
import datetime
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

def generate_excel():
    json_path = "tests/results/results.json"
    excel_path = "tests/results/E2E_Test_Report.xlsx"
    
    if not os.path.exists(json_path):
        print(f"Error: results.json not found at {json_path}")
        sys.exit(1)
        
    with open(json_path, "r", encoding="utf-8") as f:
        results = json.load(f)
        
    wb = Workbook()
    
    # TAB 1: SUMMARY DASHBOARD
    ws1 = wb.active
    ws1.title = "Dashboard"
    ws1.views.sheetView[0].showGridLines = True
    
    primary_color = "1F4E79" # Deep Blue
    accent_color = "D9E1F2"  # Soft Blue-Gray
    text_color = "FFFFFF"    # White
    pass_color = "C6EFCE"    # Soft Green
    pass_text = "006100"
    fail_color = "FFC7CE"    # Soft Red
    fail_text = "9C0006"
    
    title_font = Font(name="Segoe UI", size=18, bold=True, color=text_color)
    header_font = Font(name="Segoe UI", size=11, bold=True, color=primary_color)
    bold_font = Font(name="Segoe UI", size=11, bold=True)
    regular_font = Font(name="Segoe UI", size=11)
    
    title_fill = PatternFill(start_color=primary_color, end_color=primary_color, fill_type="solid")
    
    thin_border = Border(
        left=Side(style='thin', color='BFBFBF'),
        right=Side(style='thin', color='BFBFBF'),
        top=Side(style='thin', color='BFBFBF'),
        bottom=Side(style='thin', color='BFBFBF')
    )
    
    # 1. Header Banner
    ws1.merge_cells("A1:D2")
    cell_a1 = ws1["A1"]
    cell_a1.value = "SignVision AI — Test Execution Report"
    cell_a1.font = title_font
    cell_a1.fill = title_fill
    cell_a1.alignment = Alignment(horizontal="center", vertical="center")
    
    # 2. Metadata Block
    metadata = [
        ("Execution Date", datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S UTC")),
        ("Test Environment", "GitHub Actions (CI/CD Pipeline)"),
        ("Source Branch", os.environ.get("GITHUB_REF_NAME", "Local / Main")),
        ("Commit SHA", os.environ.get("GITHUB_SHA", "Local-Run")[:8]),
    ]
    
    ws1.cell(row=4, column=1, value="METADATA").font = header_font
    for idx, (k, v) in enumerate(metadata):
        row = 5 + idx
        ws1.cell(row=row, column=1, value=k).font = bold_font
        ws1.cell(row=row, column=1).border = thin_border
        
        ws1.cell(row=row, column=2, value=v).font = regular_font
        ws1.cell(row=row, column=2).border = thin_border
        
    # 3. Test Statistics Block
    total_tests = len(results)
    passed_tests = sum(1 for r in results if r["status"] == "PASS")
    failed_tests = total_tests - passed_tests
    pass_rate = (passed_tests / total_tests) if total_tests > 0 else 0
    
    ws1.cell(row=4, column=3, value="RESULTS SUMMARY").font = header_font
    stats = [
        ("Total Test Cases", total_tests),
        ("Passed Cases", passed_tests),
        ("Failed Cases", failed_tests),
        ("Overall Pass Rate", f"{pass_rate:.1%}")
    ]
    
    for idx, (k, v) in enumerate(stats):
        row = 5 + idx
        c1 = ws1.cell(row=row, column=3, value=k)
        c1.font = bold_font
        c1.border = thin_border
        
        c2 = ws1.cell(row=row, column=4, value=v)
        c2.font = bold_font if k == "Overall Pass Rate" else regular_font
        c2.border = thin_border
        
        if k == "Overall Pass Rate":
            if pass_rate == 1.0:
                c2.fill = PatternFill(start_color=pass_color, end_color=pass_color, fill_type="solid")
                c2.font = Font(name="Segoe UI", size=11, bold=True, color=pass_text)
            else:
                c2.fill = PatternFill(start_color=fail_color, end_color=fail_color, fill_type="solid")
                c2.font = Font(name="Segoe UI", size=11, bold=True, color=fail_text)

    # TAB 2: DETAILED RESULTS
    ws2 = wb.create_sheet(title="Execution Details")
    ws2.views.sheetView[0].showGridLines = True
    
    headers = ["No.", "Category", "Test Case Name", "Description", "Status", "Duration (s)", "Execution Details"]
    
    for col_idx, text in enumerate(headers, 1):
        cell = ws2.cell(row=1, column=col_idx, value=text)
        cell.font = Font(name="Segoe UI", size=11, bold=True, color="FFFFFF")
        cell.fill = title_fill
        cell.alignment = Alignment(horizontal="center", vertical="center")
        cell.border = thin_border
        
    ws2.row_dimensions[1].height = 28
    
    for idx, r in enumerate(results, 1):
        row = 1 + idx
        ws2.row_dimensions[row].height = 22
        
        ws2.cell(row=row, column=1, value=idx).alignment = Alignment(horizontal="center")
        ws2.cell(row=row, column=2, value=r["category"])
        ws2.cell(row=row, column=3, value=r["name"]).font = bold_font
        ws2.cell(row=row, column=4, value=r["description"])
        
        status_cell = ws2.cell(row=row, column=5, value=r["status"])
        status_cell.alignment = Alignment(horizontal="center")
        if r["status"] == "PASS":
            status_cell.fill = PatternFill(start_color=pass_color, end_color=pass_color, fill_type="solid")
            status_cell.font = Font(name="Segoe UI", size=11, bold=True, color=pass_text)
        else:
            status_cell.fill = PatternFill(start_color=fail_color, end_color=fail_color, fill_type="solid")
            status_cell.font = Font(name="Segoe UI", size=11, bold=True, color=fail_text)
            
        ws2.cell(row=row, column=6, value=r["duration"]).alignment = Alignment(horizontal="right")
        ws2.cell(row=row, column=7, value=r["details"])
        
        for c in range(1, 8):
            cell = ws2.cell(row=row, column=c)
            cell.border = thin_border
            if c != 3 and c != 5:
                cell.font = regular_font

    for ws in [ws1, ws2]:
        for col in ws.columns:
            max_len = 0
            for cell in col:
                val = str(cell.value or '')
                if cell.row in [1, 2] and ws.title == "Dashboard":
                    continue
                if len(val) > max_len:
                    max_len = len(val)
            col_letter = get_column_letter(col[0].column)
            ws.column_dimensions[col_letter].width = max(max_len + 4, 12)
            
    wb.save(excel_path)
    print(f"Excel report generated successfully at: {excel_path}")

if __name__ == "__main__":
    generate_excel()
