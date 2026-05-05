import { Button, Dropdown, Space } from "antd";
import { Download, Printer } from "lucide-react";
import { FaFileCsv, FaFilePdf } from "react-icons/fa6";
import CustomActionButton from "../Button/CustomActionButton";

interface PrintProps {
  tableData: any[];
  fileName?: string;
  logoUrl?: string;
  backgroundImageUrl?: string;
}

const PageListPrint: React.FC<PrintProps> = ({
  tableData,
  fileName = "exported-data",
  logoUrl = "/images/logo/logo.png",
  backgroundImageUrl = "/images/logo/logo2.png",
}) => {
  // CSV Download
  const handleCSVDownload = () => {
    if (!tableData.length) return;
    const headers = Object.keys(tableData[0]);
    const csv = [
      headers.join(","),
      ...tableData.map((row) =>
        headers.map((h) => JSON.stringify(row[h] ?? "")).join(","),
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${fileName}.csv`;
    link.click();
  };

  // PDF Print (transparent table + visible background)
  const handlePdfPrint = () => {
    if (!tableData.length) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const headers = Object.keys(tableData[0] || {});
    const tableRows = tableData
      .map(
        (row) =>
          `<tr>${headers
            .map(
              (h) =>
                `<td style="border-bottom:1px solid #e5e7eb;padding:10px 12px;font-size:13px;color:#111827;">${
                  row[h] ?? ""
                }</td>`,
            )
            .join("")}</tr>`,
      )
      .join("");

    const tableHTML = `
      <html>
        <head>
          <title>${fileName}</title>
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              background: transparent;
              color: #111827;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }

            .page-container {
              position: relative;
              min-height: 100vh;
              padding: 10px;
            }

            /* ✅ Background watermark visible behind everything */
            .page-container::before {
              content: "";
              position: absolute;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              background-image: url('${backgroundImageUrl}');
              background-repeat: no-repeat;
              background-position: center center;
              background-size: 180px auto;
              opacity: 0.1;
              z-index: -1;
            }

            .header {
              text-align: center;
              margin-bottom: 20px;
            }

            .header img {
              height: 60px;
              margin-bottom: 10px;
            }

            .title {
              font-size: 22px;
              font-weight: 700;
              color: #1e293b;
              text-transform: capitalize;
            }

            .subtitle {
              font-size: 14px;
              color: #64748b;
              margin-top: 5px;
            }

            .table-container {
              margin-top: 40px;
              background: transparent; /* ✅ Transparent background */
              overflow: hidden;
            }

            table {
              width: 100%;
              border-collapse: collapse;
              background: transparent; /* ✅ Transparent table background */
            }

            th {
              background: #15803d; /* ✅ Green background for header */
              color: white;
              text-align: left;
              padding: 10px 12px;
              font-size: 13px;
              font-weight: 600;
            }

            td {
              background: transparent !important; /* ✅ Fully transparent rows */
              padding: 10px 12px;
              border-bottom: 1px solid #e5e7eb;
              font-size: 13px;
              color: #374151;
            }

            tr:hover td {
              background: rgba(241, 245, 249, 0.2); /* subtle hover tint */
            }

            .footer {
              text-align: center;
              margin-top: 40px;
              font-size: 12px;
              color: #64748b;
              border-top: 1px solid #e2e8f0;
              padding-top: 10px;
            }

            @media print {
              @page { margin: 1cm; }
              .no-print { display: none !important; }
            }

            .print-button {
              position: fixed;
              top: 20px;
              right: 20px;
              background: #2563eb;
              color: white;
              border: none;
              padding: 10px 20px;
              border-radius: 6px;
              cursor: pointer;
              font-weight: 500;
              z-index: 1000;
            }
          </style>
        </head>

        <body>
          <button class="print-button no-print" onclick="window.print()">Print</button>
          <div class="page-container">
            <div class="header">
              <img src="${logoUrl}" alt="Company Logo" />
              <div class="title">${fileName}</div>
              <div class="subtitle">Printed in : ${new Date().toLocaleString(
                "en-GB",
                {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                },
              )}
</div>
            </div>

            <div class="table-container">
              <table>
                <thead>
                  <tr>${headers.map((h) => `<th>${h}</th>`).join("")}</tr>
                </thead>
                <tbody>${tableRows}</tbody>
              </table>
            </div>

          </div>

          <script>
            window.onload = () => setTimeout(() => window.print(), 400);
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(tableHTML);
    printWindow.document.close();
  };

  // PDF Download (direct download without opening print window)
  const handlePdfDownload = async () => {
    if (!tableData.length) return;

    const headers = Object.keys(tableData[0] || {});
    const tableRows = tableData
      .map(
        (row) =>
          `<tr>${headers
            .map(
              (h) =>
                `<td style="border-bottom:1px solid #e5e7eb;padding:10px 12px;font-size:13px;color:#111827;">${
                  row[h] ?? ""
                }</td>`,
            )
            .join("")}</tr>`,
      )
      .join("");

    const tableHTML = `
      <div class="page-container">
        <div class="header">
          <img src="${logoUrl}" alt="Company Logo" />
          <div class="title">${fileName}</div>
          <div class="subtitle">Printed in : ${new Date().toLocaleString()}</div>
        </div>

        <div class="table-container">
          <table>
            <thead>
              <tr>${headers.map((h) => `<th>${h}</th>`).join("")}</tr>
            </thead>
            <tbody>${tableRows}</tbody>
          </table>
        </div>
        
        <!-- Page number container - will be populated by JavaScript -->
        <div id="page-number" class="page-number"></div>
      </div>
    `;

    // Create a temporary div with the content
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = tableHTML;

    // Add styles for PDF
    const styles = document.createElement("style");
    styles.textContent = `
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        background: transparent;
        color: #111827;
      }

      .page-container {
        position: relative;
        min-height: 100vh;
        padding: 40px 20px;
      }

      .page-container::before {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-image: url('${backgroundImageUrl}');
        background-repeat: no-repeat;
        background-position: center center;
        background-size: 180px auto;
        opacity: 0.1;
        z-index: -1;
      }

      .header {
        text-align: center;
        margin-bottom: 20px;
        margin-top: -30px;
      }

      .header img {
        height: 60px;
        margin-bottom: 10px;
        display: block;
        margin-left: auto;
        margin-right: auto;
      }

      .title {
        font-size: 22px;
        font-weight: 700;
        color: #1e293b;
        text-transform: capitalize;
        text-align: center;
      }

      .subtitle {
        font-size: 14px;
        color: #64748b;
        margin-top: 5px;
        text-align: center;
      }

      .table-container {
        margin-top: 40px;
        background: transparent;
        overflow: hidden;
      }

      table {
        width: 100%;
        border-collapse: collapse;
        background: transparent;
      }

      th {
        background: #1BA143; /* ✅ Green background for header */
        color: white;
        text-align: left;
        padding: 10px 12px;
        font-size: 12px;
        font-weight: 600;
      }

      td {
        background: transparent !important;
        padding: 10px 12px;
        border-bottom: 1px solid #e5e7eb;
        font-size: 12px;
        color: #374151;
      }

      /* Page number styles */
      .page-number {
        position: fixed;
        bottom: 20px;
        right: 20px;
        font-size: 11px;
        color: #64748b;
        z-index: 1000;
      }

      /* Hide page number by default - will be shown via JavaScript for multi-page */
      .page-number {
        display: none;
      }
    `;

    const container = document.createElement("div");
    container.appendChild(styles);
    container.appendChild(tempDiv);

    // Load html2pdf library dynamically
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src =
        "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";

      script.onload = () => {
        const options = {
          margin: [10, 10, 10, 10],
          filename: `${fileName}.pdf`,
          image: {
            type: "jpeg",
            quality: 0.98,
          },
          html2canvas: {
            scale: 2,
            useCORS: true,
            logging: false,
            scrollY: 0,
          },
          jsPDF: {
            unit: "mm",
            format: "a4",
            orientation: "portrait",
            compress: true,
          },
          // Add page number callback
          pagebreak: { mode: ["css", "legacy"] },
        };

        // Create PDF and add page numbers for multi-page documents
        // @ts-expect-error htm12
        const pdf = html2pdf().set(options).from(container);

        // Get the PDF instance to check page count
        pdf
          .toPdf()
          .get("pdf")
          .then((pdfDoc: any) => {
            const totalPages = pdfDoc.internal.getNumberOfPages();

            // Only add page numbers if there are multiple pages
            if (totalPages > 1) {
              for (let i = 1; i <= totalPages; i++) {
                pdfDoc.setPage(i);
                pdfDoc.setFontSize(10);
                pdfDoc.setTextColor(100, 100, 100);
                pdfDoc.text(
                  `Page ${i} of ${totalPages}`,
                  pdfDoc.internal.pageSize.getWidth() - 25,
                  pdfDoc.internal.pageSize.getHeight() - 10,
                );
              }
            }

            pdfDoc.save(`${fileName}.pdf`);
            resolve(true);
          });
      };

      document.head.appendChild(script);
    });
  };

  const menuContent = (
    <div className="!border bg-white p-2 rounded-md !border-primary-border !shadow-md">
      <Space direction="vertical" style={{ width: "100%" }}>
        <div className="flex gap-3 items-center">
          <Button
            type="primary"
            icon={<FaFilePdf />}
            style={{
              width: "100%",
              backgroundColor: "#1BA143",
              fontWeight: 500,
              borderRadius: "6px",
            }}
            onClick={handlePdfPrint}
          >
            Print PDF
          </Button>

          <Button
            type="primary"
            icon={<FaFileCsv />}
            style={{
              width: "100%",
              backgroundColor: "orange",
              fontWeight: 500,
              borderRadius: "6px",
            }}
            onClick={handleCSVDownload}
          >
            CSV
          </Button>
        </div>

        {/* Extra Download PDF Button */}
        <div className="mt-2">
          <Button
            type="primary"
            icon={<Download size={14} />}
            style={{
              width: "100%",
              backgroundColor: "#1BA143",
              fontWeight: 500,
              borderRadius: "6px",
            }}
            onClick={handlePdfDownload}
          >
            Download PDF
          </Button>
        </div>
      </Space>
    </div>
  );

  return (
    <Dropdown
      trigger={["click"]}
      dropdownRender={() => menuContent}
      placement="bottomRight"
      disabled={tableData?.length === 0}
      arrow
    >
      <CustomActionButton icon={<Printer />} type="default" text="Print" />
    </Dropdown>
  );
};

export default PageListPrint;
