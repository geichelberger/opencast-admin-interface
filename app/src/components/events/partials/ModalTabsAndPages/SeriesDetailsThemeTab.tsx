import React from "react";
import { useTranslation } from "react-i18next";
import { Formik } from "formik";
// @ts-expect-error TS(7016): Could not find a declaration file for module 'loda... Remove this comment to see the full error message
import _ from "lodash";
import cn from "classnames";
import { connect } from "react-redux";
import Notifications from "../../../shared/Notifications";
import { updateSeriesTheme } from "../../../../thunks/seriesDetailsThunks";
import { getUserInformation } from "../../../../selectors/userInfoSelectors";
import { hasAccess } from "../../../../utils/utils";
import DropDown from "../../../shared/DropDown";

/**
 * This component renders the tab for editing the theme of a certain series
 */
const SeriesDetailsThemeTab = ({
// @ts-expect-error TS(7031): Binding element 'theme' implicitly has an 'any' ty... Remove this comment to see the full error message
	theme,
// @ts-expect-error TS(7031): Binding element 'seriesId' implicitly has an 'any'... Remove this comment to see the full error message
	seriesId,
// @ts-expect-error TS(7031): Binding element 'themeNames' implicitly has an 'an... Remove this comment to see the full error message
	themeNames,
// @ts-expect-error TS(7031): Binding element 'updateTheme' implicitly has an 'a... Remove this comment to see the full error message
	updateTheme,
// @ts-expect-error TS(7031): Binding element 'user' implicitly has an 'any' typ... Remove this comment to see the full error message
	user,
}) => {
	const { t } = useTranslation();

// @ts-expect-error TS(7006): Parameter 'values' implicitly has an 'any' type.
	const handleSubmit = (values) => {
		updateTheme(seriesId, values);
	};

// @ts-expect-error TS(7006): Parameter 'formik' implicitly has an 'any' type.
	const checkValidity = (formik) => {
		if (formik.dirty && formik.isValid) {
			// check if user provided values differ from initial ones
			return !_.isEqual(formik.values, formik.initialValues);
		} else {
			return false;
		}
	};

	return (
		<Formik
			enableReinitialize
			initialValues={{ theme: theme }}
			onSubmit={(values) => handleSubmit(values)}
		>
			{(formik) => (
				<>
					<div className="modal-content">
						<div className="modal-body">
							<Notifications context="not-corner" />
							<div className="full-col">
								<div className="obj quick-actions">
									<header>{t("CONFIGURATION.NAVIGATION.THEMES")}</header>
									<div className="obj-container padded">
										<ul>
											<li>
												<p>{t("EVENTS.SERIES.NEW.THEME.DESCRIPTION.TEXT")}</p>
												{themeNames.length > 0 && (
													<p>
														<div className="editable">
															<DropDown
																value={formik.values.theme}
																text={formik.values.theme}
																options={themeNames}
																type={"theme"}
																required={false}
// @ts-expect-error TS(7006): Parameter 'element' implicitly has an 'any' type.
																handleChange={(element) =>
																	formik.setFieldValue("theme", element.value)
																}
																placeholder={t("EVENTS.SERIES.NEW.THEME.LABEL")}
																tabIndex={"8"}
																disabled={
																	!hasAccess(
																		"ROLE_UI_SERIES_DETAILS_THEMES_EDIT",
																		user
																	)
																}
															/>
														</div>
														{/*<option value={theme}>{theme}</option>*/}
													</p>
												)}
											</li>
										</ul>
									</div>
									{formik.dirty && (
										<>
											{/* Render buttons for updating theme */}
											<footer style={{ padding: "15px" }}>
												<button
													type="submit"
													onClick={() => formik.handleSubmit()}
													disabled={!checkValidity(formik)}
													className={cn("submit", {
														active: checkValidity(formik),
														inactive: !checkValidity(formik),
													})}
												>
													{t("SAVE")}
												</button>
												<button
// @ts-expect-error TS(2322): Type 'string' is not assignable to type '{ theme: ... Remove this comment to see the full error message
													onClick={() => formik.resetForm({ values: "" })}
													className="cancel"
												>
													{t("CANCEL")}
												</button>
											</footer>

											<div className="btm-spacer" />
										</>
									)}
								</div>
							</div>
						</div>
					</div>
				</>
			)}
		</Formik>
	);
};

// Getting state data out of redux store
// @ts-expect-error TS(7006): Parameter 'state' implicitly has an 'any' type.
const mapStateToProps = (state) => ({
	user: getUserInformation(state),
});

// @ts-expect-error TS(7006): Parameter 'dispatch' implicitly has an 'any' type.
const mapDispatchToProps = (dispatch) => ({
// @ts-expect-error TS(7006): Parameter 'id' implicitly has an 'any' type.
	updateTheme: (id, values) => dispatch(updateSeriesTheme(id, values)),
});

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(SeriesDetailsThemeTab);
