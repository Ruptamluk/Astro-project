r"""
Import dasha analysis rows from an Excel workbook into MongoDB.

Default source:
    C:\Users\EBIW\Downloads\mahadasha_and_antradasha_exact_merged_v3.xlsx

Collection:
    dasha_analysis
"""

import asyncio
import os
import sys
import zipfile
import xml.etree.ElementTree as ET
from pathlib import Path

from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient

DEFAULT_XLSX_PATH = r"C:\Users\EBIW\Downloads\mahadasha_and_antradasha_exact_merged_v3.xlsx"
NS = {"a": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}


def load_sheet_rows(xlsx_path: str) -> list[dict]:
    with zipfile.ZipFile(xlsx_path) as archive:
        shared_strings: list[str] = []
        if "xl/sharedStrings.xml" in archive.namelist():
            shared_root = ET.fromstring(archive.read("xl/sharedStrings.xml"))
            shared_strings = [
                "".join(
                    node.text or ""
                    for node in item.iter("{http://schemas.openxmlformats.org/spreadsheetml/2006/main}t")
                )
                for item in shared_root
            ]

        sheet_root = ET.fromstring(archive.read("xl/worksheets/sheet1.xml"))

    rows: list[list[str]] = []
    for row in sheet_root.findall("a:sheetData/a:row", NS):
        cells: dict[str, str] = {}
        for cell in row.findall("a:c", NS):
            ref = cell.attrib.get("r", "")
            col = "".join(ch for ch in ref if ch.isalpha())
            cell_type = cell.attrib.get("t")
            raw_value = ""

            value_node = cell.find("a:v", NS)
            if value_node is not None and value_node.text is not None:
                raw_value = value_node.text
                if cell_type == "s":
                    raw_value = shared_strings[int(raw_value)]

            inline_node = cell.find("a:is/a:t", NS)
            if inline_node is not None and inline_node.text is not None:
                raw_value = inline_node.text

            cells[col] = str(raw_value).strip()

        if cells:
            rows.append([cells.get("A", ""), cells.get("B", ""), cells.get("C", "")])

    if not rows:
        return []

    imported_rows: list[dict] = []
    for mahadasha, antardasha, analysis in rows[1:]:
        if not mahadasha or not antardasha or not analysis:
            continue

        imported_rows.append(
            {
                "mahadasha_number": int(float(mahadasha)),
                "antardasha_number": int(float(antardasha)),
                "analysis": analysis.strip(),
            }
        )

    return imported_rows


async def main():
    load_dotenv()

    xlsx_path = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_XLSX_PATH
    resolved_path = Path(xlsx_path)
    if not resolved_path.exists():
        raise FileNotFoundError(f"Workbook not found: {resolved_path}")

    records = load_sheet_rows(str(resolved_path))
    if not records:
        raise RuntimeError("No importable rows found in workbook.")

    mongodb_url = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
    client = AsyncIOMotorClient(mongodb_url)
    db = client["astrology"]
    collection = db["dasha_analysis"]

    await collection.delete_many({})
    await collection.insert_many(records)
    await collection.create_index(
        [("mahadasha_number", 1), ("antardasha_number", 1)],
        unique=True,
        name="maha_antar_unique",
    )

    print(
        f"[OK] Imported {len(records)} records into 'dasha_analysis' from {resolved_path}"
    )
    client.close()


if __name__ == "__main__":
    asyncio.run(main())
