import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/highlight/lib/styles/index.css';
import axios from 'axios';
import { highlightPlugin } from '@react-pdf-viewer/highlight';

function PdfHighlightViewer({ pdfBlob, highlightFields }) {
	const [pdfFile, setPdfFile] = useState(null);

	const highlightPluginInstance = highlightPlugin();

	useEffect(() => {
		if (pdfBlob) {
			const fileURL = URL.createObjectURL(pdfBlob); // Create Object URL from Blob
			setPdfFile(fileURL); // Set the URL to view the PDF
		}
	}, [pdfBlob]);

	const renderHighlights = (pageIndex) => {
		const highlights = highlightFields[pageIndex] || [];
		return highlights.map((highlight, index) => ({
			id: `highlight-${pageIndex}-${index}`,
			position: highlight.position,
			content: <div style={{ backgroundColor: 'rgba(255, 255, 0, 0.5)' }}>{highlight.text}</div>
		}));
	};

	return (
		<div style={{ height: '550px' }}>
			{pdfFile ? (
				<Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
					<Viewer
						fileUrl={pdfFile}
						plugins={[highlightPluginInstance]}
						renderHighlights={renderHighlights}
					/>
				</Worker>
			) : (
				<p>Loading PDF...</p>
			)}
		</div>
	);
}

function CustomInvoiceGenerator({ invoiceData }, ref) {
	const [pdfBlob, setPdfBlob] = useState(null);
	const highlightFields = {
		0: [
			{
				position: { left: 20, top: 200, width: 200, height: 30 },
				text: 'Invoice'
			},
			{
				position: { left: 50, top: 300, width: 250, height: 30 },
				text: 'Email Field'
			}
		],
		1: [
			{
				position: { left: 100, top: 150, width: 150, height: 30 },
				text: 'Address Field'
			}
		]
	};

	useEffect(() => {
		if (invoiceData?.id) {
			// Fetch PDF from the API
			axios
				.get(`https://localhost:44307/api/Invoice/GetCustomInvoice/${invoiceData.id}`, {
					responseType: 'blob' // Ensure response is a Blob
				})
				.then((response) => {
					setPdfBlob(response.data); // Store the Blob in state
				})
				.catch((error) => {
					console.error('Error fetching the PDF:', error);
				});
		}
	}, [invoiceData]);

	const generateCustomInvoice = () => {
		const formData = new FormData();
		const customFileName = `Custom_Invoice_${invoiceData.fileName}`;

		formData.append('file', pdfBlob, customFileName);
		axios.post(`https://localhost:44307/api/Invoice/UploadCustomInvoice/${invoiceData.id}`, formData, {
			headers: {
				'Content-Type': 'multipart/form-data'
			}
		});
	};

	useImperativeHandle(ref, () => ({
		generateCustomInvoice
	}));

	return (
		<div className="w-full mt-12 px-40">
			<PdfHighlightViewer
				pdfBlob={pdfBlob}
				highlightFields={highlightFields}
			/>
		</div>
	);
}

export default forwardRef(CustomInvoiceGenerator);
