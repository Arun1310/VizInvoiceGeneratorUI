// import DemoContent from '@fuse/core/DemoContent';
import FusePageSimple from '@fuse/core/FusePageSimple';
// import { useTranslation } from 'react-i18next';
import { styled } from '@mui/material/styles';
import { useNavigate, useParams } from 'react-router';
import { useState, useEffect, useCallback, useRef } from 'react';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import axios from 'axios';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Stepper from '@mui/material/Stepper';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import AttributeMapping from '../components/AttributeMapping';
import Validator from '../components/Validator';
import CustomInvoiceGenerator from '../components/CustomInvoiceGenerator';

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

const steps = ['Attribute Mapping', 'Validator', 'Custom Invoice'];

function getStepContent(step, invoiceData, ref, handleValidationStatusChange) {
	switch (step) {
		case 0:
			return (
				<AttributeMapping
					invoiceData={invoiceData}
					ref={ref}
				/>
			);
		case 1:
			return (
				<Validator
					invoiceData={invoiceData}
					ref={ref}
					onValidationStatusChange={handleValidationStatusChange}
				/>
			);
		case 2:
			return (
				<CustomInvoiceGenerator
					invoiceData={invoiceData}
					ref={ref}
				/>
			);
		default:
			throw new Error('Unknown step');
	}
}

function InvoiceDetail() {
	const ref = useRef();
	const [invoiceData, setInvoiceData] = useState([]);
	const [activeStep, setActiveStep] = useState(0);
	const { id } = useParams();
	const navigate = useNavigate();
	const [hasValidationErrors, setHasValidationErrors] = useState(false);

	const handleValidationStatusChange = (hasErrors) => {
		setHasValidationErrors(hasErrors);
	};

	const fetchInvoiceById = useCallback(async () => {
		try {
			// setLoading(true);
			const response = await axios.get(`https://localhost:44307/api/Invoice/${id}`);

			if (response.data.state === 2 || response.data.state === 3) setActiveStep(1);
			else if (response.data.state === 4) setActiveStep(2);

			setInvoiceData(response.data);
			// setLoading(false);
		} catch (err) {
			// setError("Error fetching invoices");
		} finally {
			// setLoading(false);
		}
	}, [id]);

	useEffect(() => {
		fetchInvoiceById();
	}, [fetchInvoiceById]);

	// const handleNext = async () => {
	// 	if (activeStep === 1) {
	// 		setActiveStep(activeStep + 1);
	// 		return;
	// 	}

	// 	if (ref.current) {
	// 		const success = await ref.current.handleOnSubmit();

	// 		if (success) {
	// 			setActiveStep(activeStep + 1);
	// 		}
	// 	}
	// };

	const handleNext = async () => {
		if (hasValidationErrors) {
			// If there are validation errors, show the Discard button logic here
			const success = await ref.current.handleOnDiscard();

			if (success) {
				onClickHome();
			}
		} else {
			// Existing logic to move to the next step
			const success = await ref.current.handleOnSubmit();

			if (success) {
				setActiveStep(activeStep + 1);
			}
		}
	};

	const handleBack = () => {
		if (activeStep === 1) setHasValidationErrors(false);

		setActiveStep(activeStep - 1);
	};
	// const handleGoBack = () => {
	// 	navigate('/');
	// };

	const onClickGenerate = () => {
		ref.current.generateCustomInvoice();
		setActiveStep(activeStep + 1);
	};
	const onClickHome = () => {
		navigate('/');
	};

	return (
		<Root
			content={
				<div className="px-24 pt-12 w-full">
					<div className="px-60">
						<Stepper
							activeStep={activeStep}
							sx={{ width: '100%', height: 40 }}
						>
							{steps.map((label) => (
								<Step
									sx={{ ':first-child': { pl: 0 }, ':last-child': { pr: 0 } }}
									key={label}
								>
									<StepLabel>{label}</StepLabel>
								</Step>
							))}
						</Stepper>
						<Stepper
							activeStep={activeStep}
							alternativeLabel
							sx={{ display: { sm: 'flex', md: 'none' } }}
						>
							{steps.map((label) => (
								<Step
									sx={{
										':first-child': { pl: 0 },
										':last-child': { pr: 0 },
										'& .MuiStepConnector-root': { top: { xs: 6, sm: 12 } }
									}}
									key={label}
								>
									<StepLabel sx={{ '.MuiStepLabel-labelContainer': { maxWidth: '70px' } }}>
										{label}
									</StepLabel>
								</Step>
							))}
						</Stepper>
						{activeStep === steps.length ? (
							<Stack
								spacing={2}
								useFlexGap
							>
								<Typography variant="h1">📜</Typography>
								<Typography variant="h5">Invoice Generated Successfully</Typography>
								<Button
									variant="contained"
									sx={{ alignSelf: 'start', width: { xs: '100%', sm: 'auto' } }}
									onClick={onClickHome}
								>
									Go to Home
								</Button>
							</Stack>
						) : (
							<>
								{getStepContent(activeStep, invoiceData, ref, handleValidationStatusChange)}
								<Box
									sx={[
										{
											display: 'flex',
											flexDirection: { xs: 'column-reverse', sm: 'row' },
											alignItems: 'end',
											flexGrow: 1,
											gap: 1,
											pb: { xs: 12, sm: 0 },
											mt: 3,
											mb: '60px'
										},
										activeStep !== 0
											? { justifyContent: 'space-between' }
											: { justifyContent: 'flex-end' }
									]}
								>
									{activeStep !== 0 && (
										<Button
											startIcon={<ChevronLeftRoundedIcon />}
											onClick={handleBack}
											variant="outlined"
											color="primary"
											size="small"
										>
											Previous
										</Button>
									)}
									{invoiceData.state !== 3 && hasValidationErrors ? (
										<Button
											variant="contained"
											color="error"
											onClick={handleNext}
											size="small"
										>
											Discard
										</Button>
									) : (
										activeStep !== steps.length - 1 &&
										invoiceData.state !== 3 && (
											<Button
												variant="contained"
												color="secondary"
												endIcon={<ChevronRightRoundedIcon />}
												onClick={handleNext}
												size="small"
											>
												Next
											</Button>
										)
									)}
									{activeStep === steps.length - 1 && (
										<Button
											variant="contained"
											color="secondary"
											endIcon={<ChevronRightRoundedIcon />}
											onClick={onClickGenerate}
											size="small"
										>
											Generate
										</Button>
									)}
								</Box>
							</>
						)}
					</div>
				</div>
			}
		/>
	);
}

export default InvoiceDetail;
