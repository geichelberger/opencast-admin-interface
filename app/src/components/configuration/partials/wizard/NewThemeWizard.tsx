import React, { useEffect } from "react";
import { Formik } from "formik";
import { connect } from "react-redux";
import GeneralPage from "./GeneralPage";
import BumperPage from "./BumperPage";
import TitleSlidePage from "./TitleSlidePage";
import WatermarkPage from "./WatermarkPage";
import ThemeSummaryPage from "./ThemeSummaryPage";
import WizardStepper from "../../../shared/wizard/WizardStepper";
import { postNewTheme } from "../../../../thunks/themeThunks";
import { initialFormValuesNewThemes } from "../../../../configs/modalConfig";
import { usePageFunctions } from "../../../../hooks/wizardHooks";
import { NewThemeSchema } from "../../../../utils/validate";

/**
 * This component manages the pages of the new theme wizard and the submission of values
 */
const NewThemeWizard = ({
    close,
    postNewTheme
}: any) => {
	const initialValues = initialFormValuesNewThemes;

	const [
		snapshot,
		page,
		nextPage,
		previousPage,
		setPage,
		pageCompleted,
		setPageCompleted,
	] = usePageFunctions(0, initialValues);

	// Caption of steps used by Stepper
	const steps = [
		{
			name: "generalForm",
			translation: "CONFIGURATION.THEMES.DETAILS.GENERAL.CAPTION",
		},
		{
			name: "bumperForm",
			translation: "CONFIGURATION.THEMES.DETAILS.BUMPER.CAPTION",
		},
		{
			name: "trailerForm",
			translation: "CONFIGURATION.THEMES.DETAILS.TRAILER.CAPTION",
		},
		{
			name: "titleSlideForm",
			translation: "CONFIGURATION.THEMES.DETAILS.TITLE.CAPTION",
		},
		{
			name: "watermarkForm",
			translation: "CONFIGURATION.THEMES.DETAILS.WATERMARK.CAPTION",
		},
		{
			name: "summary",
			translation: "CONFIGURATION.THEMES.DETAILS.SUMMARY.CAPTION",
		},
	];

	// Validation schema of current page
	const currentValidationSchema = NewThemeSchema[page];

// @ts-expect-error TS(7006): Parameter 'values' implicitly has an 'any' type.
	const handleSubmit = (values) => {
		postNewTheme(values);
		close();
	};

	return (
		<>
			{/* Initialize overall form */}
			<Formik
				initialValues={snapshot}
				validationSchema={currentValidationSchema}
				onSubmit={(values) => handleSubmit(values)}
			>
				{/* Render wizard pages depending on current value of page variable */}
				{(formik) => {
					// eslint-disable-next-line react-hooks/rules-of-hooks
					useEffect(() => {
						formik.validateForm();
						// eslint-disable-next-line react-hooks/exhaustive-deps
					}, [page]);

					return (
						<>
							{/* Stepper that shows each step of wizard as header */}
							<WizardStepper
								steps={steps}
								page={page}
								setPage={setPage}
								completed={pageCompleted}
								setCompleted={setPageCompleted}
								formik={formik}
							/>
							<div>
								{page === 0 && (
									<GeneralPage formik={formik} nextPage={nextPage} />
								)}
								{page === 1 && (
									<BumperPage
										formik={formik}
										nextPage={nextPage}
										previousPage={previousPage}
									/>
								)}
								{page === 2 && (
									<BumperPage
										formik={formik}
										nextPage={nextPage}
										previousPage={previousPage}
										isTrailer
									/>
								)}
								{page === 3 && (
									<TitleSlidePage
										formik={formik}
										nextPage={nextPage}
										previousPage={previousPage}
									/>
								)}
								{page === 4 && (
									<WatermarkPage
										formik={formik}
										nextPage={nextPage}
										previousPage={previousPage}
									/>
								)}
								{page === 5 && (
									<ThemeSummaryPage
										formik={formik}
										previousPage={previousPage}
									/>
								)}
							</div>
						</>
					);
				}}
			</Formik>
		</>
	);
};

// Mapping actions to dispatch
// @ts-expect-error TS(7006): Parameter 'dispatch' implicitly has an 'any' type.
const mapDispatchToProps = (dispatch) => ({
// @ts-expect-error TS(7006): Parameter 'values' implicitly has an 'any' type.
	postNewTheme: (values) => dispatch(postNewTheme(values)),
});

export default connect(null, mapDispatchToProps)(NewThemeWizard);
