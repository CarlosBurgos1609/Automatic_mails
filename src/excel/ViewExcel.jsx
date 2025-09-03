import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import { fetchExcelFromOneDrive } from "../conection/excelOneDrive";

const EXCEL_URL = "https://etbcsj-my.sharepoint.com/:x:/r/personal/segingresopnar_cendoj_ramajudicial_gov_co/_layouts/15/Doc.aspx?sourcedoc=%7B63AA73DA-6BDE-46D4-8CCC-08F963263F23%7D&file=Juzgados_2025.xlsx&action=default&mobileredirect=true";

export default function ViewExcel() {
  const [rows, setRows] = useState([]);
  const [cols, setCols] = useState([]);

  useEffect(() => {
    async function loadExcel() {
      try {
        const blob = await fetchExcelFromOneDrive(EXCEL_URL);
        const data = await blob.arrayBuffer();
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        setCols(json[0]);
        setRows(json.slice(1));
      } catch (err) {
        setCols([]);
        setRows([]);
      }
    }
    loadExcel();
  }, []);

  if (!cols.length) return <div>No se pudo cargar el Excel.</div>;

  return (
    <div className="excel-table-container">
      <table>
        <thead>
          <tr>
            {cols.map((col, idx) => (
              <th key={idx}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr key={idx}>
              {row.map((cell, cidx) => (
                <td key={cidx}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}