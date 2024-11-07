import { forwardRef, useState, useEffect, useImperativeHandle } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField } from '@mui/material';
import VerifiedIcon from '@mui/icons-material/Verified';
import DoNotDisturbOnIcon from '@mui/icons-material/DoNotDisturbOn';
import { motion } from 'framer-motion';
import axios from 'axios';
import { toast } from 'react-toastify';
import moment from 'moment';

function Validator(props, ref) {
	const { invoiceData, onValidationStatusChange } = props;
	const [validationData, setValidationData] = useState([]);
	// eslint-disable-next-line unused-imports/no-unused-vars
	const [hasErrors, setHasErrors] = useState(false);

	useEffect(() => {
		if (invoiceData?.attributes) {
			setValidationData(invoiceData?.attributes);
		}
	}, [invoiceData]);

	useEffect(() => {
		// Check if there are any validation errors in the data
		const errorsExist = validationData.some((item) => {
			const { attributeName, attributeValue } = item;

			if (attributeName === 'InvoiceDate') {
				return isInvalidDate(attributeValue) || isFutureDate(attributeValue);
			}

			return false;
		});
		setHasErrors(errorsExist);
		onValidationStatusChange(errorsExist);
	}, [validationData, onValidationStatusChange]);

	const isFutureDate = (dateString) => {
		return moment(dateString).isAfter(moment());
	};

	const isInvalidDate = (dateString) => {
		// Specify the format explicitly and use strict mode to ensure the format matches exactly
		return !moment(dateString, 'DD/MM/YYYY', true).isValid();
	};

	const handleOnDiscard = async () => {
		try {
			const updatedInvoice = invoiceData;
			updatedInvoice.state = 3;

			await axios.put(`https://localhost:44307/api/invoice/${invoiceData?.id}`, updatedInvoice);
			toast.success('Invoice Discarded Successfully');
			return true;
		} catch (error) {
			console.error('Failed to discard the invoice:', error);
			return false;
		}
	};

	const handleOnSubmit = async () => {
		try {
			const updatedInvoice = invoiceData;
			updatedInvoice.state = 4;

			await axios.put(`https://localhost:44307/api/invoice/${invoiceData?.id}`, updatedInvoice);
			toast.success('Invoice Validated Successfully');
			return true;
		} catch (error) {
			console.error('Failed to discard the invoice:', error);
			return false;
		}
	};

	useImperativeHandle(ref, () => ({
		handleOnDiscard,
		handleOnSubmit
	}));

	const renderValidationTable = (data) => {
		const commonBorderClass = 'border-b border-gray-200';
		const tableHeaderStyle = {
			backgroundColor: '#00A4EF',
			color: 'white'
		};
		const allowedFields = ['InvoiceId', 'InvoiceDate', 'InvoiceTotal'];

		return (
			<div>
				<TableContainer
					sx={{
						backgroundColor: 'white',
						borderRadius: 3
					}}
					style={{ height: 550, overflowY: 'auto' }}
				>
					<Table aria-label="editable invoice table">
						<TableHead>
							<TableRow>
								<TableCell
									className={commonBorderClass}
									sx={tableHeaderStyle}
								>
									{}
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
									const { attributeName, attributeValue } = item;

									if (allowedFields.includes(attributeName)) {
										let isValid = true;
										let errorMessage = '';

										if (attributeName === 'InvoiceDate') {
											if (isInvalidDate(attributeValue)) {
												isValid = false;
												errorMessage = 'Invalid date format';
											} else if (isFutureDate(attributeValue)) {
												isValid = false;
												errorMessage = 'Date should not be in the future';
											}
										}

										if (attributeName === 'InvoiceTotal') {
											if (Number(attributeValue) >= 100000) {
												isValid = false;
												errorMessage = 'Invoice total must be less than 1 Lakh';
											}
										}

										return (
											<TableRow key={index}>
												<TableCell className={commonBorderClass}>
													{isValid ? (
														<VerifiedIcon
															fontSize="medium"
															color="success"
														/>
													) : (
														<DoNotDisturbOnIcon
															fontSize="medium"
															color="error"
														/>
													)}
												</TableCell>
												<TableCell className={commonBorderClass}>{attributeName}</TableCell>
												<TableCell className={commonBorderClass}>
													<TextField
														fullWidth
														variant="outlined"
														value={attributeValue ?? ''}
														inputProps={{
															readOnly: true
														}}
														error={!isValid}
														helperText={!isValid && errorMessage}
													/>
												</TableCell>
											</TableRow>
										);
									}

									return null;
								})}
						</TableBody>
					</Table>
				</TableContainer>
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
			<div className="w-full mt-12">
				<motion.div variants={item}>
					<div>{renderValidationTable(validationData)}</div>
				</motion.div>
			</div>
		</motion.div>
	);
}

export default forwardRef(Validator);
