import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/highlight/lib/styles/index.css';
import { Worker, Viewer } from '@react-pdf-viewer/core';
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
import { toast } from 'react-toastify';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { motion } from 'framer-motion';
// import SaveIcon from '@mui/icons-material/Save';
import { ExpandMore, ExpandLess, ListAlt } from '@mui/icons-material';
import axios from 'axios';
import { highlightPlugin, Trigger } from '@react-pdf-viewer/highlight';

function PdfHighlightViewer({ pdfUrl, highlightFields, onTextSelect }) {
	const [pdfFile, setPdfFile] = useState(null);
	const renderHighlights = (props) => (
		<div>
			{highlightFields
				.filter((area) => area.pageIndex === props.pageIndex)
				.map((area, idx) => (
					<div
						key={idx}
						className="highlight-area"
						style={{
							background: area.isAttributeMapped === true ? 'green' : '#f9c555',
							opacity: 0.4,
							...props.getCssProperties(area, props.rotation)
						}}
					/>
				))}
		</div>
	);

	const highlightPluginInstance = highlightPlugin({
		renderHighlights,
		trigger: Trigger.TextSelection,
		selectedText: (text) => {
			console.log('Selected text:', text); // Add this line to check if it logs the selected text

			if (text) {
				onTextSelect(text); // Call the passed function to update the state in the parent
			}
		}
	});

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

function AttributeMapping(props, ref) {
	const { invoiceData } = props;
	const [openDialog, setOpenDialog] = useState(false);
	const [currentArray, setCurrentArray] = useState([]);
	const [currentArrayIndex, setCurrentArrayIndex] = useState([]);
	const [expandedRows, setExpandedRows] = useState([]);
	const [editableData, setEditableData] = useState([]);
	const [highlightFields, setHighlightFields] = useState([]);
	const [selectedText, setSelectedText] = useState('');

	const pdfUrl = invoiceData?.fileUrl;

	const extractPositions = (attributes) => {
		const positions = [];

		attributes.forEach((attr) => {
			// Add positions from the current attribute
			if (attr.position) {
				attr.position.forEach((pos) => {
					positions.push({
						pageIndex: pos.pageIndex,
						height: pos.height,
						width: pos.width,
						left: pos.left,
						top: pos.top,
						isAttributeMapped: attr.isAttributeMapped
					});
				});
			}

			if (attr.children && attr.children.length > 0) {
				positions.push(...extractPositions(attr.children));
			}
		});

		return positions;
	};

	useEffect(() => {
		if (invoiceData?.attributes) {
			setEditableData(invoiceData?.attributes);
			const parsedHighlights = extractPositions(invoiceData.attributes);
			setHighlightFields(parsedHighlights);
		}
	}, [invoiceData]);

	const handleInputChange = (e, index) => {
		const { value } = e.target;
		const newData = [...editableData];
		newData[index].attributeValue = value;
		setEditableData(newData);
	};

	const handleInputBlur = (index) => {
		const item = editableData[index];

		if (item && !item.isAttributeMapped) {
			item.isAttributeMapped = true;
			const newData = [...editableData];
			newData[index].isAttributeMapped = true;
			setEditableData(newData);
		}
	};

	const handleItemChange = (e, parentIndex, childIndex) => {
		const { value } = e.target;

		setEditableData((prevState) => {
			const updatedItems = [...(prevState || [])];

			if (updatedItems[currentArrayIndex] && updatedItems[currentArrayIndex].children) {
				const updatedChildren = [...updatedItems[currentArrayIndex].children];

				if (updatedChildren[parentIndex] && updatedChildren[parentIndex].children) {
					const subChildren = [...updatedChildren[parentIndex].children];

					subChildren[childIndex] = {
						...subChildren[childIndex],
						attributeValue: value
					};

					updatedChildren[parentIndex] = {
						...updatedChildren[parentIndex],
						children: subChildren
					};

					updatedItems[currentArrayIndex] = {
						...updatedItems[currentArrayIndex],
						children: updatedChildren
					};
				}
			}

			return updatedItems;
		});

		// Update the `currentArray` state
		setCurrentArray((prevArray) => {
			const updatedArray = [...prevArray];

			if (updatedArray[parentIndex] && updatedArray[parentIndex].children) {
				const updatedChildren = [...updatedArray[parentIndex].children];

				updatedChildren[childIndex] = {
					...updatedChildren[childIndex],
					attributeValue: value
				};

				updatedArray[parentIndex] = {
					...updatedArray[parentIndex],
					children: updatedChildren
				};
			}

			return updatedArray;
		});
	};

	const handleRowCheckboxChange = (index) => {
		const newData = [...editableData];
		newData[index].isAttributeMapped = !newData[index].isAttributeMapped;
		setEditableData(newData);
	};

	const handleRowNestedCheckboxChange = (index) => {
		const newData = [...editableData];

		newData[index].isAttributeMapped = !newData[index].isAttributeMapped;

		// Helper function to recursively update the nested children
		const toggleNestedChildren = (children, newValue) => {
			if (children && children.length > 0) {
				children.forEach((child) => {
					child.isAttributeMapped = newValue;

					if (child.children && child.children.length > 0) {
						toggleNestedChildren(child.children, newValue);
					}
				});
			}
		};

		// Apply the toggle to the children of the main item
		toggleNestedChildren(newData[index].children, newData[index].isAttributeMapped);

		setEditableData(newData);
	};

	const handleRowItemCheckboxChange = (parentIndex, childIndex) => {
		setEditableData((prevState) => {
			const updatedItems = [...(prevState || [])];

			if (updatedItems[currentArrayIndex] && updatedItems[currentArrayIndex].children) {
				const updatedChildren = [...updatedItems[currentArrayIndex].children];

				if (updatedChildren[parentIndex] && updatedChildren[parentIndex].children) {
					const subChildren = [...updatedChildren[parentIndex].children];

					subChildren[childIndex] = {
						...subChildren[childIndex],
						isAttributeMapped: !subChildren[childIndex].isAttributeMapped
					};

					updatedChildren[parentIndex] = {
						...updatedChildren[parentIndex],
						children: subChildren
					};

					updatedItems[currentArrayIndex] = {
						...updatedItems[currentArrayIndex],
						children: updatedChildren
					};
				}
			}

			return updatedItems;
		});
	};

	useEffect(() => {
		if (editableData && editableData.length > 0) {
			const parsedHighlights = extractPositions(editableData);
			setHighlightFields(parsedHighlights);
		}
	}, [editableData]);

	const handleSelectAll = (event) => {
		const isChecked = event.target.checked;

		const updateAttributes = (attributes) => {
			return attributes.map((item) => {
				const updatedItem = {
					...item,
					isAttributeMapped: isChecked
				};

				// Check if the item has children and update them recursively
				if (item.children && item.children.length > 0) {
					updatedItem.children = updateAttributes(item.children);
				}

				return updatedItem;
			});
		};

		const newData = updateAttributes(editableData);
		setEditableData(newData);
	};

	const handleTextSelect = (selectedText) => {
		setSelectedText(selectedText);
		console.log(selectedText);
	};

	useImperativeHandle(ref, () => ({
		handleOnSubmit
	}));

	const handleOnSubmit = async () => {
		const validateAttributes = (dataArray) => {
			return dataArray.some((item) => {
				// Only consider items where `attributeName` has a value
				if (item.attributeName !== null) {
					// Check if `isAttributeMapped` is false
					if (!item.isAttributeMapped) {
						toast.error('Verify all the attributes');
						return true; // Return true to indicate validation failed
					}
				}

				// Recursively check nested children if they exist
				if (item.children && item.children.length > 0) {
					return validateAttributes(item.children);
				}

				return false; // Continue if no issues found in this item
			});
		};

		// If validation fails, stop execution
		if (validateAttributes(editableData)) {
			return false;
		}

		try {
			const updatedInvoice = invoiceData;
			updatedInvoice.state = 2;
			updatedInvoice.attributes = editableData;

			// Make an API call to update the invoice data
			await axios.put(`https://localhost:44307/api/invoice/${invoiceData?.id}`, updatedInvoice);

			return true;
		} catch (error) {
			console.error('Failed to update the invoice:', error);
			// Return false to indicate failure
			return false;
		}
	};

	const renderEditableTable = (data) => {
		const commonBorderClass = 'border-b border-gray-200';
		const tableHeaderStyle = {
			backgroundColor: '#00A4EF',
			color: 'white'
		};
		const allowedFields = [
			'VendorName',
			'VendorTaxId',
			'VendorAddress',
			'InvoiceId',
			'InvoiceDate',
			'PurchaseOrder',
			'PurchaseOrderDate',
			'ShippingAddressRecipient',
			'ShippingAddress',
			'CustomerAddressRecipient',
			'CustomerAddress',
			'VendorAddressRecipient',
			'InvoiceTotal',
			'InvoiceTotalInWords',
			'CustomerTaxId'
		];
		const allowedItemFields = ['Description', 'ProductCode', 'Quantity', 'Unit', 'UnitPrice', 'Amount'];

		const handleOpenDialog = (arrayData, index) => {
			setCurrentArray(arrayData);
			setCurrentArrayIndex(index);
			setOpenDialog(true);
		};

		const handleCloseDialog = () => {
			setOpenDialog(false);
		};

		const handleRowToggle = (index) => {
			setExpandedRows((prev) => (prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]));
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
								data.length > 0 &&
								data.map((item, index) => {
									// Destructure the necessary properties from the item
									const { attributeName, attributeValue } = item;

									// Check if the attributeName is in allowedFields
									if (allowedFields?.includes(attributeName)) {
										return (
											<TableRow key={index}>
												{' '}
												{/* Use index as key here or a unique identifier if available */}
												<TableCell className={commonBorderClass}>
													<Checkbox
														checked={item.isAttributeMapped}
														color="success"
														icon={<CheckCircleOutlineIcon />}
														checkedIcon={<CheckCircleIcon />}
														onChange={() => handleRowCheckboxChange(index)}
														inputProps={{ 'aria-label': attributeValue }}
													/>
												</TableCell>
												<TableCell className={commonBorderClass}>{attributeName}</TableCell>
												<TableCell className={commonBorderClass}>
													<TextField
														fullWidth
														variant="outlined"
														value={attributeValue ?? ''} // Use attributeValue directly
														onChange={(e) => handleInputChange(e, index)}
														onBlur={() => handleInputBlur(index)}
													/>
												</TableCell>
											</TableRow>
										);
									}

									// Check if the data item has children and render accordingly
									if (Array.isArray(item.children) && item.children.length > 0) {
										return (
											<TableRow key={index}>
												{' '}
												<TableCell className={commonBorderClass}>
													<Checkbox
														checked={item.isAttributeMapped}
														color="success"
														icon={<CheckCircleOutlineIcon />}
														checkedIcon={<CheckCircleIcon />}
														onChange={() => handleRowNestedCheckboxChange(index)}
														inputProps={{ 'aria-label': attributeValue }}
													/>
												</TableCell>
												{/* Use index as key here or a unique identifier if available */}
												<TableCell className={commonBorderClass}>{attributeName}</TableCell>
												<TableCell className={commonBorderClass}>
													<IconButton
														sx={{ '& .MuiSvgIcon-root': { fontSize: 30 } }}
														color="secondary"
														onClick={() => handleOpenDialog(item.children, index)}
													>
														<ListAlt />
													</IconButton>
												</TableCell>
											</TableRow>
										);
									}

									return null; // Return null for keys that don't match any criteria
								})}
						</TableBody>
					</Table>
				</TableContainer>

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
									{' '}
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
											{' '}
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
																{item.children &&
																	item.children.map((child, childIndex) => {
																		const { attributeName, attributeValue } = child;

																		// Check if attributeName is in allowedFields
																		if (
																			allowedItemFields?.includes(attributeName)
																		) {
																			return (
																				<TableRow key={childIndex}>
																					<TableCell
																						className={commonBorderClass}
																					>
																						<Checkbox
																							checked={
																								item.isAttributeMapped
																							}
																							color="success"
																							icon={
																								<CheckCircleOutlineIcon />
																							}
																							checkedIcon={
																								<CheckCircleIcon />
																							}
																							onChange={() =>
																								handleRowItemCheckboxChange(
																									index,
																									childIndex
																								)
																							}
																							inputProps={{
																								'aria-label':
																									attributeValue
																							}}
																						/>
																					</TableCell>
																					<TableCell
																						className={commonBorderClass}
																					>
																						{attributeName}
																					</TableCell>
																					<TableCell
																						className={commonBorderClass}
																					>
																						<TextField
																							fullWidth
																							variant="outlined"
																							value={attributeValue ?? ''}
																							onChange={(e) =>
																								handleItemChange(
																									e,
																									index,
																									childIndex
																								)
																							}
																						/>
																					</TableCell>
																				</TableRow>
																			);
																		}

																		return null; // Skip if attributeName is not in allowedFields
																	})}
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
							onTextSelect={handleTextSelect}
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

export default forwardRef(AttributeMapping);
