import React, { useState, useEffect } from 'react';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/highlight/lib/styles/index.css';
import {
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	TextField,
	IconButton,
	Dialog,
	DialogActions,
	Button,
	Box,
	Collapse,
	Checkbox,
	Paper
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { motion } from 'framer-motion';
// import SaveIcon from '@mui/icons-material/Save';
import { ExpandMore, ExpandLess, ListAlt } from '@mui/icons-material';
import axios from 'axios';
import { highlightPlugin } from '@react-pdf-viewer/highlight';

function PdfHighlightViewer({ pdfUrl, highlightFields }) {
	const [pdfFile, setPdfFile] = useState(null);

	const highlightPluginInstance = highlightPlugin();

	useEffect(() => {
		fetch(pdfUrl, { mode: 'cors' })
			.then((res) => {
				if (!res.ok) {
					throw new Error(`HTTP error! status: ${res.status}`);
				}

				return res.blob(); // Ensure the response is handled as a Blob
			})
			.then((blob) => {
				const fileURL = URL.createObjectURL(blob); // Create Object URL from Blob
				setPdfFile(fileURL); // Set the URL to view the PDF
			})
			.catch((err) => {
				console.error('Error loading PDF:', err);
			});
	}, [pdfUrl]);

	const renderHighlights = (pageIndex) => {
		const highlights = highlightFields[pageIndex] || [];
		return highlights.map((highlight, index) => ({
			id: `highlight-${pageIndex}-${index}`,
			position: highlight.position,
			content: <div style={{ backgroundColor: 'rgba(255, 255, 0, 0.5)' }}>{highlight.text}</div>
		}));
	};

	return (
		<div
			style={{ height: '550px' }}
			className="rounded-full"
		>
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

function AttributeMapping(props) {
	const { invoiceData } = props;
	const [openDialog, setOpenDialog] = useState(false);
	const [currentArray, setCurrentArray] = useState([]);
	const [expandedRows, setExpandedRows] = useState([]);
	const [editableData, setEditableData] = useState({});
	// const [editableData, setEditableData] = useState(invoiceData?.invoiceResult);
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

	const pdfUrl = invoiceData?.fileUrl;

	useEffect(() => {
		if (invoiceData?.invoiceResult) {
			setEditableData(invoiceData.invoiceResult);
		}
	}, [invoiceData]);

	const handleInputChange = (e, key) => {
		const { value } = e.target;
		setEditableData((prevState) => ({
			...prevState,
			[key]: value
		}));
	};

	const handleItemChange = (e, index, field) => {
		const { value } = e.target;

		// Ensure you're updating the 'items' array within the editableData object
		setEditableData((prevState) => {
			// Make sure that 'items' exists in prevState
			const updatedItems = [...(prevState.items || [])];

			// Update the specific field of the item at the given index
			updatedItems[index] = {
				...updatedItems[index], // Spread the current item properties
				[field]: value // Update the specific field with the new value
			};

			return {
				...prevState, // Spread the rest of the object (editableData)
				items: updatedItems // Replace the items array with the updated one
			};
		});

		setCurrentArray((prevArray) => {
			// Clone the array to prevent mutating the state directly
			const updatedArray = [...prevArray];

			// Update the specific field of the object at the given index
			updatedArray[index] = {
				...updatedArray[index],
				[field]: value
			};

			return updatedArray;
		});
	};

	const handleRowCheckboxChange = (index) => {
		const newData = [...editableData];
		newData[index].isChecked = !newData[index].isChecked;
		setEditableData(newData);
	};

	// Handle header checkbox change
	const handleSelectAll = (event) => {
		const isChecked = event.target.checked;
		const newData = editableData.map((item) => ({
			...item,
			isChecked
		}));
		setEditableData(newData);
	};

	const renderEditableTable = (data) => {
		const commonBorderClass = 'border-b border-gray-200';
		const tableHeaderStyle = {
			backgroundColor: '#00A4EF',
			color: 'white'
		};
		// const allowedFields = ['vendorName', 'customerName', 'subTotal', 'totalTax', 'invoiceTotal'];
		const allowedFields = [
			'vendorName',
			'vendorTaxId',
			'vendorAddress',
			'invoiceId',
			'invoiceDate',
			'purchaseOrder',
			'purchaseOrderDate',
			'shippingAddressRecipient',
			'shippingAddress',
			'customerAddressRecipient',
			'customerAddress',
			'vendorAddressRecipient',
			'invoiceTotal',
			'invoiceTotalInWords',
			'customerTaxId'
		];
		const allowedItemFields = ['description', 'productCode', 'quantity', 'unit', 'unitPrice', 'amount'];

		const handleOpenDialog = (arrayData) => {
			setCurrentArray(arrayData);
			setOpenDialog(true);
		};

		const handleCloseDialog = () => {
			setOpenDialog(false);
		};

		const handleRowToggle = (index) => {
			setExpandedRows((prev) => (prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]));
		};

		const handleOnSubmit = async () => {
			try {
				const updatedInvoice = invoiceData;
				updatedInvoice.state = 2;
				updatedInvoice.invoiceResult = editableData;
				// Make an API call to update the invoice data
				await axios.put(`https://localhost:44307/api/invoice/${invoiceData?.id}`, updatedInvoice);
				// alert('Invoice successfully updated.');
			} catch (error) {
				// alert('Failed to update the invoice.');
			}
		};

		return (
			<div>
				<TableContainer
					sx={{
						backgroundColor: 'white',
						borderRadius: 3
					}}
					// component={Paper}
					style={{ height: 550, overflowY: 'auto' }}
				>
					<Table aria-label="editable invoice table">
						<TableHead>
							<TableRow>
								<TableCell
									className={commonBorderClass}
									sx={tableHeaderStyle}
								>
									<Checkbox
										// color="success"
										icon={<CheckCircleOutlineIcon />}
										checkedIcon={<CheckCircleIcon />}
										onChange={handleSelectAll}
										inputProps={{ 'aria-label': 'select all' }}
									/>
									{/* <Checkbox
										color="success"
										onChange={handleSelectAll}
										inputProps={{ 'aria-label': 'select all' }}
									/> */}
								</TableCell>
								<TableCell
									className={commonBorderClass}
									sx={tableHeaderStyle}
								>
									<strong>Name</strong>
								</TableCell>
								<TableCell
									className={commonBorderClass}
									sx={tableHeaderStyle}
								>
									<strong>Value</strong>
								</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{data &&
								allowedFields?.map((key) => {
									if (data[key] !== undefined) {
										return (
											<TableRow key={key}>
												<TableCell className={commonBorderClass}>
													<Checkbox
														color="success"
														icon={<CheckCircleOutlineIcon />}
														checkedIcon={<CheckCircleIcon />}
														onChange={(e) => handleRowCheckboxChange(e, key)}
														inputProps={{ 'aria-label': data[key] }}
													/>
													{/* <Checkbox
														// checked={data[key].isChecked}
														color="success"
														onChange={(e) => handleRowCheckboxChange(e, key)}
														inputProps={{ 'aria-label': data[key] }}
													/> */}
												</TableCell>
												<TableCell className={commonBorderClass}>{key}</TableCell>
												<TableCell className={commonBorderClass}>
													<TextField
														fullWidth
														variant="outlined"
														value={data[key] ?? ''}
														onChange={(e) => handleInputChange(e, key)}
													/>
												</TableCell>
											</TableRow>
										);
									}

									return null;
								})}

							{data &&
								Object.keys(data).map((key) => {
									if (Array.isArray(data[key]) && data[key].length > 0) {
										return (
											<TableRow key={key}>
												<TableCell className={commonBorderClass}>{key}</TableCell>
												<TableCell className={commonBorderClass}>
													<IconButton
														sx={{ '& .MuiSvgIcon-root': { fontSize: 30 } }}
														color="secondary"
														onClick={() => handleOpenDialog(data[key])}
													>
														<ListAlt />
													</IconButton>
												</TableCell>
											</TableRow>
										);
									}

									return null;
								})}
						</TableBody>
					</Table>
				</TableContainer>

				{/* <Button
					variant="text"
					endIcon={<SaveIcon />}
					onClick={handleOnSubmit}
					sx={{ width: { xs: '100%', sm: 'fit-content', marginTop: 8 } }}
				>
					Submit
				</Button> */}

				<Dialog
					BackdropProps={{
						style: {
							// backgroundColor: 'rgba(0, 0, 0, 0.1)'
						}
					}}
					open={openDialog}
					onClose={handleCloseDialog}
					maxWidth="sm"
					fullWidth
					PaperProps={{
						style: { marginLeft: 'auto', marginRight: 140 }
					}}
				>
					{/* <DialogTitle>List</DialogTitle> */}
					<TableContainer>
						<Table aria-label="array data table">
							<TableHead>
								<TableRow>
									<TableCell
										className={commonBorderClass}
										sx={tableHeaderStyle}
									>
										<strong>Item</strong>
									</TableCell>
									<TableCell
										className={commonBorderClass}
										sx={tableHeaderStyle}
									>
										<strong>Expand</strong>
									</TableCell>
								</TableRow>
							</TableHead>
							<TableBody>
								{currentArray.map((item, index) => (
									<React.Fragment key={index}>
										<TableRow>
											<TableCell className={commonBorderClass}>Item {index + 1}</TableCell>
											<TableCell className={commonBorderClass}>
												<IconButton onClick={() => handleRowToggle(index)}>
													{expandedRows.includes(index) ? <ExpandLess /> : <ExpandMore />}
												</IconButton>
											</TableCell>
										</TableRow>
										<TableRow>
											<TableCell
												className={commonBorderClass}
												colSpan={2}
												style={{ padding: 0 }}
											>
												<Collapse
													in={expandedRows.includes(index)}
													timeout="auto"
													unmountOnExit
												>
													<Box margin={1}>
														{/* Collapsible content with editable fields for each item */}
														<Table size="small">
															<TableBody>
																{allowedItemFields.map((field) => (
																	<TableRow key={field}>
																		<TableCell className={commonBorderClass}>
																			{field}
																		</TableCell>
																		<TableCell className={commonBorderClass}>
																			<TextField
																				fullWidth
																				variant="outlined"
																				value={item[field] ?? ''}
																				// multiline={field === 'description'}  // Make description multiline
																				// rows={field === 'description' ? 4 : 1}  // More space for description
																				onChange={(e) =>
																					handleItemChange(e, index, field)
																				}
																			/>
																		</TableCell>
																	</TableRow>
																))}
															</TableBody>
														</Table>
													</Box>
												</Collapse>
											</TableCell>
										</TableRow>
									</React.Fragment>
								))}
							</TableBody>
						</Table>
					</TableContainer>
					<DialogActions>
						<Button
							variant="contained"
							onClick={handleCloseDialog}
							color="secondary"
						>
							Close
						</Button>
					</DialogActions>
				</Dialog>
			</div>
		);
	};

	const container = {
		show: {
			transition: {
				staggerChildren: 0.04
			}
		}
	};
	const item = {
		hidden: { opacity: 0, y: 20 },
		show: { opacity: 1, y: 0 }
	};

	return (
		<motion.div
			className="w-full"
			variants={container}
			initial="hidden"
			animate="show"
		>
			<div className="grid grid-cols-2 gap-20 mt-12">
				<motion.div variants={item}>
					<Paper className="relative flex flex-col flex-auto rounded-xl shadow overflow-hidden">
						<PdfHighlightViewer
							pdfUrl={pdfUrl}
							highlightFields={highlightFields}
						/>
					</Paper>
				</motion.div>

				<motion.div variants={item}>
					<div>{renderEditableTable(editableData)}</div>
				</motion.div>
			</div>
		</motion.div>
	);
}

export default AttributeMapping;
