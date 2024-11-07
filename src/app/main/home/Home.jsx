// import DemoContent from '@fuse/core/DemoContent';
import FusePageSimple from '@fuse/core/FusePageSimple';
// import { useTranslation } from 'react-i18next';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router';
import { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { IconButton, Tooltip, Chip } from '@mui/material';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { saveAs } from 'file-saver';
import Paper from '@mui/material/Paper';
import { motion } from 'framer-motion';
import { DataGrid } from '@mui/x-data-grid';
// import ReceiptIcon from '@mui/icons-material/Receipt';
import { toast } from 'react-toastify';
import '@react-pdf-viewer/core/lib/styles/index.css';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import axios from 'axios';

const Root = styled(FusePageSimple)(({ theme }) => ({
	'& .FusePageSimple-header': {
		backgroundColor: theme.palette.background.paper,
		borderBottomWidth: 1,
		borderStyle: 'solid',
		borderColor: theme.palette.divider
	},
	'& .FusePageSimple-content': {},
	'& .FusePageSimple-sidebarHeader': {},
	'& .FusePageSimple-sidebarContent': {}
}));

function ShowStatus({ item }) {
	const handleStatusClick = () => {
		// console.log('Chip clicked');
	};

	let label;
	let color;
	switch (item.state) {
		case 0:
			label = 'Processing';
			color = 'warning';
			break;
		case 1:
			label = 'Processed';
			color = 'warning';
			break;
		case 2:
			label = 'Attribute Mapped';
			color = 'info';
			break;
		case 3:
			label = 'Discarded';
			color = 'error';
			break;
		case 4:
			label = 'Validated';
			color = 'secondary';
			break;
		case 5:
			label = 'Completed';
			color = 'success';
			break;
		default:
			label = 'Unknown';
			color = 'default';
	}

	return (
		<Chip
			size="small"
			label={label}
			color={color}
			onClick={handleStatusClick}
		/>
	);
}

function DownLoadInvoiceFile({ item }) {
	const { state, customGeneratedInvoiceUrl, fileName } = item;
	const handleDownloadClick = async () => {
		saveAs(customGeneratedInvoiceUrl, fileName);
	};

	return (
		<Tooltip title="Download Invoice">
			<IconButton
				color="info"
				onClick={(event) => {
					event.stopPropagation();
					handleDownloadClick();
				}}
				disabled={state !== 5}
			>
				<FileCopyIcon />
			</IconButton>
		</Tooltip>
	);
}

function Home() {
	// const { t } = useTranslation('home');
	const [invoices, setInvoices] = useState([]);
	const navigate = useNavigate();
	const [loading, setLoading] = useState(false);
	const [selectedFile, setSelectedFile] = useState(null);
	const [pdfPreview, setPdfPreview] = useState(null);

	useEffect(() => {
		if (!selectedFile) {
			// eslint-disable-next-line no-console
			console.log('File removed successfully');
		}
	}, [selectedFile]);

	const columns = [
		{ field: 'fileName', headerName: 'Invoice', flex: 1 },
		{
			field: 'state',
			headerName: 'Status',
			flex: 1,
			renderCell: (params) => {
				return <ShowStatus item={params.row} />;
			}
		},
		{
			field: 'customGeneratedInvoiceUrl',
			headerName: 'Download Invoice',
			headerClassName: 'header',
			disableClickEventBubbling: true,
			filterable: false,
			flex: 1,
			// renderHeader: () => (
			//     <div>
			//         <FileCopyIcon />
			//     </div>
			// ),
			renderCell: (params) => {
				return <DownLoadInvoiceFile item={params.row} />;
			}
		}
		//  { field: 'file', headerName: 'Download File', flex: 1 },
	];

	const fetchInvoices = async () => {
		try {
			setLoading(true);
			const response = await axios.get('https://localhost:44307/api/Invoice');
			setInvoices(response.data);
			setLoading(false);
		} catch (err) {
			// setError("Error fetching invoices");
		} finally {
			// setLoading(false);
		}
	};

	useEffect(() => {
		fetchInvoices();
	}, []);

	// Handle file upload and preview
	const handleFile = (file) => {
		if (file && file.type === 'application/pdf') {
			setSelectedFile(file);

			// Create a preview using FileReader for PDFs
			// eslint-disable-next-line no-undef
			const reader = new FileReader();
			reader.onloadend = () => {
				setPdfPreview(reader.result);
			};
			reader.readAsDataURL(file); // Convert the PDF to base64
		} else {
			// eslint-disable-next-line no-alert, no-undef
			alert('Please select a valid PDF file');
		}
	};

	// Handle drag-and-drop
	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		accept: 'application/pdf',
		onDrop: (acceptedFiles) => {
			const file = acceptedFiles[0];
			handleFile(file);
		}
	});

	const handleRemoveFile = () => {
		setSelectedFile(null);
		setPdfPreview(null);
	};

	const handleUploadFile = async () => {
		if (!selectedFile) {
			toast.error('Please select a file to upload.');
			return;
		}

		setLoading(true);
		const formData = new FormData();
		formData.append('file', selectedFile);

		await axios.post('https://localhost:44307/api/Invoice/Upload', formData, {
			headers: {
				'Content-Type': 'multipart/form-data'
			}
		});
		toast.success('File Uploaded Successfully');
		setLoading(false);
		handleRemoveFile();
		fetchInvoices();
	};

	const handleRowClick = (params) => {
		if (params.row.state === 5) return;

		const { id } = params.row;
		navigate(`/invoice/${id}`);
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
		<Root
			// header={
			// 	<div className="p-24">
			// 		<h4>{t('TITLE')}</h4>
			// 	</div>
			// }
			content={
				<div className="p-24 w-full">
					<motion.div
						className="w-full"
						variants={container}
						initial="hidden"
						animate="show"
					>
						<div
							className="grid grid-cols-12 gap-40 w-full"
							style={{ height: 600 }}
						>
							<motion.div
								variants={item}
								className="flex flex-col flex-auto col-span-4"
							>
								<Paper className="relative flex flex-col flex-auto rounded-xl shadow overflow-hidden">
									<div className="p-20 w-full flex flex-col items-center justify-center">
										{!pdfPreview && (
											<>
												<Typography class="mb-16 text-md">Upload Your Invoice</Typography>
												<div
													{...getRootProps()}
													className={`w-full px-40 py-60 h-32 border-2 border-dashed rounded-lg cursor-pointer flex items-center justify-center mb-4 ${
														isDragActive ? 'border-blue-500' : 'border-gray-400'
													}`}
												>
													<input {...getInputProps()} />
													<div className="w-full flex flex-col justify-center items-center">
														<CloudUploadIcon
															fontSize="small"
															className="w-full text-blue-500 my-12"
														/>
														{isDragActive ? (
															<Typography className="text-blue-500">
																Drop the PDF here...
															</Typography>
														) : (
															<Typography className="text-gray-500">
																Drag & drop a PDF here, or click to select
															</Typography>
														)}
													</div>
												</div>
											</>
										)}

										{pdfPreview && (
											<div className="flex flex-col items-center mt-2">
												<Typography class="mb-4 text-md">PDF Preview</Typography>

												<iframe
													src={pdfPreview}
													title="PDF Preview"
													width="300"
													height="450"
													className="border"
												/>
												<div>
													<Button
														variant="outlined"
														color="error"
														onClick={handleRemoveFile}
														sx={{ m: 2 }}
													>
														Remove
													</Button>
													<Button
														variant="outlined"
														color="primary"
														onClick={handleUploadFile}
														sx={{ m: 2 }}
													>
														Upload
													</Button>
												</div>
											</div>
										)}
										{!pdfPreview && (
											<Typography className="mt-16 text-gray-500 font-mono">
												No file selected
											</Typography>
										)}
									</div>
								</Paper>
							</motion.div>
							<div className="col-span-8">
								<motion.div
									variants={item}
									className="flex flex-col flex-auto h-full"
								>
									<Paper className="relative flex flex-col flex-auto rounded-xl shadow overflow-hidden">
										<div className="w-full h-full">
											<DataGrid
												onRowClick={handleRowClick}
												rows={invoices}
												columns={columns}
												loading={loading}
												sx={{
													'& .MuiDataGrid-root': {
														// backgroundColor: '#f0f0f0', // Background color of the grid
													},
													'& .MuiDataGrid-cell': {
														// borderBottom: '1px solid #d9d9d9', // Border between rows
														borderRight: '1px solid #d9d9d9' // Border between columns
														// borderLeft: '1px solid #d9d9d9',
														// color: '#1976d2', // Text color of cells
													},
													'& .MuiDataGrid-columnHeader': {
														backgroundColor: '#00A4EF',
														color: 'white'
													}
												}}
											/>
										</div>
									</Paper>
								</motion.div>
							</div>
						</div>
					</motion.div>
				</div>
			}
		/>
	);
}

export default Home;
